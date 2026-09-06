import csv
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.period import ManagementPeriod
from app.models.student import Student
from app.models.setting import HallSettings


DEFAULT_USERS = [
    {
        "id": "admin-super-01",
        "email": "admin.hdm@gmail.com",
        "password": "Tamal12345@@",
        "name": "Jahangir Alam Tamal",
        "role": "Admin",
        "title": "Chief Dining Supervisor & System Admin",
        "department": "Dining & Kitchen Operations",
        "avatar_letter": "A",
        "period_id": None,
    },
    {
        "id": "auth-provost-01",
        "email": "authority.hdm@gmail.com",
        "password": "Authority@@",
        "name": "Prof. Dr. Farhana Sultana",
        "role": "Authority",
        "title": "Hall Provost & Advisory Authority",
        "department": "Hall Administration Office",
        "avatar_letter": "P",
        "period_id": None,
    },
    {
        "id": "mgmt-mp01-50",
        "email": "mp_01.hdm@gmail.com",
        "password": "Management@@",
        "name": "50th Batch Student Committee (Period #01)",
        "role": "Management Team",
        "title": "Resident Dining Management Committee",
        "department": "Resident Student Representatives",
        "avatar_letter": "M",
        "period_id": "period-01",
    },
    {
        "id": "mgmt-comm-50-alias",
        "email": "management.hdm@gmail.com",
        "password": "Management@@",
        "name": "50th Batch Student Committee",
        "role": "Management Team",
        "title": "Student Dining Management Committee",
        "department": "Resident Student Representatives",
        "avatar_letter": "M",
        "period_id": "period-01",
    },
]

SAMPLE_STUDENTS = [
    {"studentId": "GAU-2024-001", "name": "Priya Bain", "block": "D", "room": "325", "phone": "01710000000", "department": "Agronomy", "batch": "05"},
    {"studentId": "GAU-2024-002", "name": "Prome Das", "block": "D", "room": "325", "phone": "01710000083", "department": "Horticulture", "batch": "05"},
    {"studentId": "GAU-2024-003", "name": "Asma Sulker Anika", "block": "D", "room": "325", "phone": "01710000166", "department": "Plant Pathology", "batch": "05"},
    {"studentId": "GAU-2024-004", "name": "Api Roy", "block": "D", "room": "325", "phone": "01710000249", "department": "Agricultural Economics", "batch": "05"},
    {"studentId": "GAU-2024-005", "name": "Simanti Rani", "block": "D", "room": "326", "phone": "01710000332", "department": "Soil Science", "batch": "05"},
    {"studentId": "GAU-2024-006", "name": "Adrita Saha", "block": "D", "room": "326", "phone": "01710000415", "department": "Entomology", "batch": "05"},
    {"studentId": "GAU-2024-007", "name": "Toma Rani", "block": "D", "room": "326", "phone": "01710000498", "department": "Genetics & Plant Breeding", "batch": "05"},
    {"studentId": "GAU-2024-008", "name": "Nashat Rahman", "block": "D", "room": "326", "phone": "01710000581", "department": "Agricultural Extension", "batch": "05"},
    {"studentId": "GAU-2024-009", "name": "Afsunna Aker Akhi", "block": "D", "room": "327", "phone": "01710000664", "department": "Seed Science", "batch": "05"},
    {"studentId": "GAU-2024-010", "name": "Shahorin Shifat Lithy", "block": "D", "room": "327", "phone": "01710000747", "department": "Crop Botany", "batch": "05"},
    {"studentId": "GAU-2024-011", "name": "Nafiza Tabassom", "block": "D", "room": "327", "phone": "01710000830", "department": "Biotechnology", "batch": "05"},
    {"studentId": "GAU-2024-012", "name": "Rifa Sanjida Orthy", "block": "D", "room": "327", "phone": "01710000913", "department": "Environmental Science", "batch": "05"},
    {"studentId": "GAU-2024-013", "name": "Mst. Siddikatul Habiba Disha", "block": "D", "room": "328", "phone": "01710000996", "department": "Agronomy", "batch": "05"},
    {"studentId": "GAU-2024-014", "name": "Sumiea Akter Rupe", "block": "D", "room": "328", "phone": "01710001079", "department": "Horticulture", "batch": "05"},
    {"studentId": "GAU-2024-015", "name": "Ahona Tasnia Binta Hyder", "block": "D", "room": "328", "phone": "01710001162", "department": "Plant Pathology", "batch": "05"},
    {"studentId": "GAU-2024-016", "name": "Maisatul Jannat", "block": "D", "room": "328", "phone": "01710001245", "department": "Agricultural Economics", "batch": "05"},
    {"studentId": "GAU-2024-017", "name": "Mst. Jannatul Faria Ashika", "block": "D", "room": "329", "phone": "01710001328", "department": "Soil Science", "batch": "05"},
    {"studentId": "GAU-2024-018", "name": "Labisha Tabassum Chowdhury", "block": "D", "room": "329", "phone": "01710001411", "department": "Entomology", "batch": "05"},
    {"studentId": "GAU-2024-019", "name": "Fairuji Anika", "block": "D", "room": "329", "phone": "01710001494", "department": "Genetics & Plant Breeding", "batch": "05"},
    {"studentId": "GAU-2024-020", "name": "Srabone Basak", "block": "D", "room": "329", "phone": "01710001577", "department": "Agricultural Extension", "batch": "05"},
]


def seed_database(db: Session):
    """Seed initial core database entities if they do not already exist."""
    # 1. Create tables
    Base.metadata.create_all(bind=engine)

    # 2. Seed Management Period #01
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    period = db.query(ManagementPeriod).filter(ManagementPeriod.id == "period-01").first()
    if not period:
        period = ManagementPeriod(
            id="period-01",
            name="Management Period #01",
            code="P-01",
            start_date=today_str,
            end_date="2026-09-30",
            managed_by_team="Management Team",
            team_lead="Admin",
            contact_number="01700-000000",
            management_email="mp_01.hdm@gmail.com",
            team_contact_email="team50.gau@gmail.com",
            lunch_price=50.0,
            dinner_price=50.0,
            feast_regular_price=160.0,
            feast_guest_price=220.0,
            min_booking_days=3,
            opening_balance=0.0,
            status="active",
            notes="Initial session for New Female Hall Dining, Gazipur Agriculture University."
        )
        db.add(period)
        print("[*] Seeded Management Period #01")

    # 3. Seed default users
    for u in DEFAULT_USERS:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            new_user = User(
                id=u["id"],
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                name=u["name"],
                role=u["role"],
                title=u["title"],
                department=u["department"],
                avatar_letter=u["avatar_letter"],
                period_id=u["period_id"],
                is_active=True
            )
            db.add(new_user)
            print(f"[*] Seeded user: {u['email']} ({u['role']})")
        else:
            existing.period_id = u["period_id"]

    # 4. Seed Hall Settings
    settings_rec = db.query(HallSettings).first()
    if not settings_rec:
        settings_rec = HallSettings(
            id=1,
            hall_name="New Female Hall Dining",
            university_name="Gazipur Agriculture University",
            currency_symbol="৳",
            lunch_time="12:30 PM – 03:00 PM",
            dinner_time="08:00 PM – 10:30 PM",
            contact_emergency="+880 1700-000000"
        )
        db.add(settings_rec)
        print("[*] Seeded Hall Settings")

    # 5. Seed Students from students_template.csv or sample list
    student_count = db.query(Student).count()
    if student_count == 0:
        csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "hdm-frontend", "students_template.csv"))
        students_seeded = 0
        if os.path.exists(csv_path):
            try:
                with open(csv_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for idx, row in enumerate(reader, start=1):
                        name = row.get("name")
                        block = row.get("block", "D")
                        room = row.get("room", "325")
                        if not name:
                            continue
                        std_id = f"GAU-2024-{str(idx).zfill(3)}"
                        new_std = Student(
                            id=f"std-{idx}",
                            student_id=std_id,
                            name=name.strip(),
                            block=block.strip(),
                            room=str(room).strip(),
                            phone=f"0171000{str(idx).zfill(4)}",
                            department="Agronomy",
                            batch="05",
                            status="active",
                            balance_due=0.0,
                            balance_receivable=0.0
                        )
                        db.add(new_std)
                        students_seeded += 1
                print(f"[*] Seeded {students_seeded} students from students_template.csv")
            except Exception as e:
                print(f"[!] Error reading CSV: {e}")

        if students_seeded == 0:
            for idx, s in enumerate(SAMPLE_STUDENTS, start=1):
                new_std = Student(
                    id=f"std-{idx}",
                    student_id=s["studentId"],
                    name=s["name"],
                    block=s["block"],
                    room=s["room"],
                    phone=s["phone"],
                    department=s["department"],
                    batch=s["batch"],
                    status="active",
                    balance_due=0.0,
                    balance_receivable=0.0
                )
                db.add(new_std)
            print(f"[*] Seeded {len(SAMPLE_STUDENTS)} sample students")

    db.commit()
    print("[SUCCESS] Database seeding complete!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
