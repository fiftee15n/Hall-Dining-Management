from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.setting import HallSettings
from app.schemas.setting import HallSettingsOut, HallSettingsUpdate
from app.services.audit_service import log_audit
from app.api.deps import get_current_user_optional

router = APIRouter()


def settings_to_out(s: HallSettings) -> HallSettingsOut:
    return HallSettingsOut(
        hallName=s.hall_name,
        universityName=s.university_name,
        currencySymbol=s.currency_symbol,
        lunchTime=s.lunch_time,
        dinnerTime=s.dinner_time,
        contactEmergency=s.contact_emergency
    )


@router.get("", response_model=HallSettingsOut)
def get_hall_settings(db: Session = Depends(get_db)):
    """Get operational hall dining settings."""
    settings_rec = db.query(HallSettings).first()
    if not settings_rec:
        settings_rec = HallSettings()
        db.add(settings_rec)
        db.commit()
        db.refresh(settings_rec)
    return settings_to_out(settings_rec)


@router.put("", response_model=HallSettingsOut)
def update_hall_settings(
    update_in: HallSettingsUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Update operational hall dining settings."""
    settings_rec = db.query(HallSettings).first()
    if not settings_rec:
        settings_rec = HallSettings()
        db.add(settings_rec)

    data = update_in.model_dump(exclude_unset=True)
    if "hallName" in data: settings_rec.hall_name = data["hallName"]
    if "universityName" in data: settings_rec.university_name = data["universityName"]
    if "currencySymbol" in data: settings_rec.currency_symbol = data["currencySymbol"]
    if "lunchTime" in data: settings_rec.lunch_time = data["lunchTime"]
    if "dinnerTime" in data: settings_rec.dinner_time = data["dinnerTime"]
    if "contactEmergency" in data: settings_rec.contact_emergency = data["contactEmergency"]

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="UPDATE_SETTINGS",
        details="Updated dining hall operational settings",
        user=user_name
    )

    db.commit()
    db.refresh(settings_rec)
    return settings_to_out(settings_rec)
