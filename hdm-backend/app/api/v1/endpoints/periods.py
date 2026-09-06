import re
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.period import ManagementPeriod
from app.models.user import User
from app.schemas.period import (
    ManagementPeriodCreate,
    ManagementPeriodUpdate,
    ManagementPeriodOut,
    ResetPeriodPasswordRequest,
)
from app.services.audit_service import log_audit
from app.api.deps import get_current_user_optional, get_current_user

router = APIRouter()


def period_to_out(p: ManagementPeriod) -> ManagementPeriodOut:
    return ManagementPeriodOut(
        id=p.id,
        name=p.name,
        code=p.code,
        startDate=p.start_date,
        endDate=p.end_date,
        managedByTeam=p.managed_by_team,
        teamLead=p.team_lead,
        contactNumber=p.contact_number or "",
        managementEmail=p.management_email,
        teamContactEmail=p.team_contact_email,
        lunchPrice=p.lunch_price,
        dinnerPrice=p.dinner_price,
        feastRegularPrice=p.feast_regular_price,
        feastGuestPrice=p.feast_guest_price,
        minBookingDays=p.min_booking_days,
        openingBalance=p.opening_balance,
        status=p.status,
        notes=p.notes
    )


def extract_period_number(name_or_code: str, fallback_idx: int = 1) -> str:
    """Extract digits from name/code, e.g. 'Period #06' -> '06', 'P-02' -> '02'."""
    nums = re.findall(r'\d+', name_or_code)
    if nums:
        return nums[0].zfill(2)
    return str(fallback_idx).zfill(2)


@router.get("", response_model=List[ManagementPeriodOut])
def get_periods(db: Session = Depends(get_db)):
    """List all management periods."""
    periods = db.query(ManagementPeriod).order_by(ManagementPeriod.created_at.desc()).all()
    return [period_to_out(p) for p in periods]


@router.post("", response_model=ManagementPeriodOut, status_code=status.HTTP_201_CREATED)
def create_period(
    period_in: ManagementPeriodCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """
    Create a new management period and provision dedicated Management Team credentials (mp_periodno.hdm@gmail.com).
    """
    total_periods = db.query(ManagementPeriod).count()
    period_num = extract_period_number(period_in.code or period_in.name, total_periods + 1)

    # Format dedicated email: mp_01.hdm@gmail.com, mp_06.hdm@gmail.com
    system_email = (
        period_in.managementEmail.strip().lower()
        if period_in.managementEmail and period_in.managementEmail.strip()
        else f"mp_{period_num}.hdm@gmail.com"
    )

    new_period = ManagementPeriod(
        id=f"period-{uuid.uuid4().hex[:8]}",
        name=period_in.name,
        code=period_in.code,
        start_date=period_in.startDate,
        end_date=period_in.endDate,
        managed_by_team=period_in.managedByTeam,
        team_lead=period_in.teamLead,
        contact_number=period_in.contactNumber or "",
        management_email=system_email,
        team_contact_email=period_in.teamContactEmail,
        lunch_price=period_in.lunchPrice,
        dinner_price=period_in.dinnerPrice,
        feast_regular_price=period_in.feastRegularPrice,
        feast_guest_price=period_in.feastGuestPrice,
        min_booking_days=period_in.minBookingDays,
        opening_balance=period_in.openingBalance,
        status=period_in.status,
        notes=period_in.notes
    )
    db.add(new_period)
    db.flush()

    # Automatically provision / link the dedicated Management Team user account
    mgmt_password = period_in.managementPassword or "Management@@"
    existing_user = db.query(User).filter(User.email == system_email).first()

    if existing_user:
        existing_user.hashed_password = get_password_hash(mgmt_password)
        existing_user.period_id = new_period.id
        existing_user.name = f"{period_in.managedByTeam} ({period_in.name})"
    else:
        new_user = User(
            id=f"mgmt-{period_num}-{uuid.uuid4().hex[:6]}",
            email=system_email,
            hashed_password=get_password_hash(mgmt_password),
            name=f"{period_in.managedByTeam} ({period_in.name})",
            role="Management Team",
            title=f"Management Committee - {period_in.name}",
            department="Resident Student Representatives",
            avatar_letter="M",
            period_id=new_period.id,
            is_active=True
        )
        db.add(new_user)

    user_name = user.name if user else "Authority"
    log_audit(
        db=db,
        action="CREATE_PERIOD",
        details=f"Created period '{new_period.name}' ({new_period.code}) & provisioned login {system_email}",
        period_id=new_period.id,
        user=user_name,
        entity_type="Period",
        entity_id=new_period.id
    )

    db.commit()
    db.refresh(new_period)
    return period_to_out(new_period)


@router.get("/{period_id}", response_model=ManagementPeriodOut)
def get_period(period_id: str, db: Session = Depends(get_db)):
    """Get management period details."""
    period = db.query(ManagementPeriod).filter(ManagementPeriod.id == period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="Management period not found")
    return period_to_out(period)


@router.put("/{period_id}", response_model=ManagementPeriodOut)
def update_period(
    period_id: str,
    period_update: ManagementPeriodUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Update management period configuration."""
    period = db.query(ManagementPeriod).filter(ManagementPeriod.id == period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="Management period not found")

    data = period_update.model_dump(exclude_unset=True)
    if "name" in data: period.name = data["name"]
    if "code" in data: period.code = data["code"]
    if "startDate" in data: period.start_date = data["startDate"]
    if "endDate" in data: period.end_date = data["endDate"]
    if "managedByTeam" in data: period.managed_by_team = data["managedByTeam"]
    if "teamLead" in data: period.team_lead = data["teamLead"]
    if "contactNumber" in data: period.contact_number = data["contactNumber"]
    if "managementEmail" in data: period.management_email = data["managementEmail"]
    if "teamContactEmail" in data: period.team_contact_email = data["teamContactEmail"]
    if "lunchPrice" in data: period.lunch_price = data["lunchPrice"]
    if "dinnerPrice" in data: period.dinner_price = data["dinnerPrice"]
    if "feastRegularPrice" in data: period.feast_regular_price = data["feastRegularPrice"]
    if "feastGuestPrice" in data: period.feast_guest_price = data["feastGuestPrice"]
    if "minBookingDays" in data: period.min_booking_days = data["minBookingDays"]
    if "openingBalance" in data: period.opening_balance = data["openingBalance"]
    if "status" in data: period.status = data["status"]
    if "notes" in data: period.notes = data["notes"]

    user_name = user.name if user else "Authority"
    log_audit(
        db=db,
        action="UPDATE_PERIOD",
        details=f"Updated settings for period '{period.name}'",
        period_id=period.id,
        user=user_name,
        entity_type="Period",
        entity_id=period.id
    )

    db.commit()
    db.refresh(period)
    return period_to_out(period)


@router.post("/{period_id}/reset-password")
def reset_period_management_password(
    period_id: str,
    req: ResetPeriodPasswordRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """
    Authority/Admin endpoint to reset/change the password for the period's Management Team.
    """
    period = db.query(ManagementPeriod).filter(ManagementPeriod.id == period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="Management period not found")

    if not req.newPassword or len(req.newPassword.strip()) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    # Find the management user for this period
    mgmt_user = db.query(User).filter(
        (User.period_id == period_id) | (User.email == period.management_email)
    ).first()

    if not mgmt_user:
        # Create user if not existed
        period_num = extract_period_number(period.code or period.name)
        system_email = period.management_email or f"mp_{period_num}.hdm@gmail.com"
        mgmt_user = User(
            id=f"mgmt-{period_num}-{uuid.uuid4().hex[:6]}",
            email=system_email,
            hashed_password=get_password_hash(req.newPassword),
            name=f"{period.managed_by_team} ({period.name})",
            role="Management Team",
            title=f"Management Committee - {period.name}",
            department="Resident Student Representatives",
            avatar_letter="M",
            period_id=period.id,
            is_active=True
        )
        db.add(mgmt_user)
    else:
        mgmt_user.hashed_password = get_password_hash(req.newPassword)

    user_name = user.name if user else "Authority"
    log_audit(
        db=db,
        action="RESET_PERIOD_PASSWORD",
        details=f"Authority reset password for Management Team account ({mgmt_user.email}) under '{period.name}'",
        period_id=period.id,
        user=user_name,
        entity_type="Period",
        entity_id=period.id
    )

    db.commit()
    return {
        "success": True,
        "message": f"Password for '{mgmt_user.email}' successfully updated by Authority.",
        "managementEmail": mgmt_user.email,
        "periodId": period.id
    }


@router.post("/{period_id}/activate", response_model=ManagementPeriodOut)
def activate_period(
    period_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Switch active management period."""
    period = db.query(ManagementPeriod).filter(ManagementPeriod.id == period_id).first()
    if not period:
        raise HTTPException(status_code=404, detail="Management period not found")

    db.query(ManagementPeriod).filter(ManagementPeriod.id != period_id, ManagementPeriod.status == "active").update({"status": "completed"})
    period.status = "active"

    user_name = user.name if user else "Authority"
    log_audit(
        db=db,
        action="SWITCH_PERIOD",
        details=f"Activated management period '{period.name}'",
        period_id=period.id,
        user=user_name,
        entity_type="Period",
        entity_id=period.id
    )

    db.commit()
    db.refresh(period)
    return period_to_out(period)
