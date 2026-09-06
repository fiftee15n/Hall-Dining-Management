import csv
import io
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.student import Student
from app.models.booking import MealBooking
from app.models.attendance import MealAttendanceRecord
from app.models.transaction import PaymentTransaction
from app.models.receivable import Receivable
from app.schemas.student import StudentCreate, StudentUpdate, StudentOut
from app.services.audit_service import log_audit
from app.api.deps import get_current_user_optional

router = APIRouter()


def student_to_out(s: Student) -> StudentOut:
    return StudentOut(
        id=s.id,
        studentId=s.student_id,
        name=s.name,
        block=s.block,
        room=s.room,
        phone=s.phone or "",
        department=s.department or "",
        batch=s.batch or "",
        status=s.status,
        balanceDue=float(s.balance_due or 0.0),
        balanceReceivable=float(s.balance_receivable or 0.0),
        email=s.email
    )


@router.get("", response_model=List[StudentOut])
def get_students(
    search: Optional[str] = Query(None, description="Search by name, room, studentId"),
    block: Optional[str] = Query(None, description="Filter by block A, B, C, D, etc."),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by active/inactive"),
    db: Session = Depends(get_db)
):
    """List students with optional search query and filters."""
    query = db.query(Student)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.name.ilike(search_term),
                Student.room.ilike(search_term),
                Student.student_id.ilike(search_term),
                Student.department.ilike(search_term)
            )
        )

    if block:
        query = query.filter(Student.block == block)

    if status_filter:
        query = query.filter(Student.status == status_filter)

    students = query.order_by(Student.room.asc(), Student.name.asc()).all()
    return [student_to_out(s) for s in students]


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Add a new student to the hall database."""
    # Check if studentId already exists
    existing = db.query(Student).filter(Student.student_id == student_in.studentId).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Student with ID '{student_in.studentId}' already exists."
        )

    new_student = Student(
        id=f"std-{uuid.uuid4().hex[:8]}",
        student_id=student_in.studentId,
        name=student_in.name,
        block=student_in.block,
        room=student_in.room,
        phone=student_in.phone or "",
        department=student_in.department or "",
        batch=student_in.batch or "",
        status=student_in.status,
        balance_due=0.0,
        balance_receivable=0.0,
        email=student_in.email
    )
    db.add(new_student)

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="ADD_STUDENT",
        details=f"Added student {new_student.name} ({new_student.room}, Block {new_student.block})",
        user=user_name,
        entity_type="Student",
        entity_id=new_student.id
    )

    db.commit()
    db.refresh(new_student)
    return student_to_out(new_student)


@router.post("/import-csv")
async def import_students_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Bulk import students from an uploaded CSV file."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV file.")

    content = await file.read()
    try:
        decoded = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        decoded = content.decode("latin1")

    reader = csv.DictReader(io.StringIO(decoded))
    imported_count = 0
    errors = []

    # Get max existing index for auto-generating studentId if missing
    existing_count = db.query(Student).count()

    for idx, row in enumerate(reader, start=1):
        name = row.get("name") or row.get("Name")
        block = row.get("block") or row.get("Block") or "D"
        room = row.get("room") or row.get("Room") or "Unknown"

        if not name or not name.strip():
            continue

        name = name.strip()
        block = block.strip()
        room = str(room).strip()

        student_id = row.get("studentId") or row.get("student_id") or row.get("StudentID") or row.get("ID")
        if not student_id or not student_id.strip():
            student_id = f"GAU-2024-{str(existing_count + imported_count + 1).zfill(3)}"
        else:
            student_id = student_id.strip()

        # Check if studentId exists, if so append unique suffix
        if db.query(Student).filter(Student.student_id == student_id).first():
            student_id = f"{student_id}-{uuid.uuid4().hex[:4]}"

        new_student = Student(
            id=f"std-{uuid.uuid4().hex[:8]}",
            student_id=student_id,
            name=name,
            block=block,
            room=room,
            phone=row.get("phone", "") or row.get("Phone", ""),
            department=row.get("department", "") or row.get("Department", ""),
            batch=row.get("batch", "") or row.get("Batch", ""),
            status="active",
            balance_due=0.0,
            balance_receivable=0.0,
            email=row.get("email", None)
        )
        db.add(new_student)
        imported_count += 1

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="IMPORT_STUDENTS",
        details=f"Bulk imported {imported_count} students from CSV upload ({file.filename})",
        user=user_name
    )

    db.commit()
    return {"success": True, "importedCount": imported_count, "errors": errors}


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: str, db: Session = Depends(get_db)):
    """Get single student details."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student_to_out(student)


@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: str,
    student_update: StudentUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Update student profile."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_update.model_dump(exclude_unset=True)
    if "studentId" in update_data:
        student.student_id = update_data["studentId"]
    if "name" in update_data:
        student.name = update_data["name"]
    if "block" in update_data:
        student.block = update_data["block"]
    if "room" in update_data:
        student.room = update_data["room"]
    if "phone" in update_data:
        student.phone = update_data["phone"]
    if "department" in update_data:
        student.department = update_data["department"]
    if "batch" in update_data:
        student.batch = update_data["batch"]
    if "status" in update_data:
        student.status = update_data["status"]
    if "email" in update_data:
        student.email = update_data["email"]

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="UPDATE_STUDENT",
        details=f"Updated profile of {student.name} ({student.room})",
        user=user_name,
        entity_type="Student",
        entity_id=student.id
    )

    db.commit()
    db.refresh(student)
    return student_to_out(student)


@router.delete("/{student_id}")
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional)
):
    """Delete student from system."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    name = student.name
    db.delete(student)

    user_name = user.name if user else "Admin"
    log_audit(
        db=db,
        action="DELETE_STUDENT",
        details=f"Deleted student {name} ({student_id})",
        user=user_name,
        entity_type="Student",
        entity_id=student_id
    )

    db.commit()
    return {"success": True, "message": f"Student '{name}' deleted successfully."}
