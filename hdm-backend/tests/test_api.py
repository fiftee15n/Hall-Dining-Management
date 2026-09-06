import pytest
import io


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_auth_login_admin_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin.hdm@gmail.com", "password": "Tamal12345@@"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Admin"


def test_auth_login_mp01_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "mp_01.hdm@gmail.com", "password": "Management@@"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "Management Team"
    assert data["user"]["periodId"] == "period-01"


def test_period_creation_and_credential_provisioning(client):
    # Authority creates Period #02 with custom password
    payload = {
        "name": "Management Period #02",
        "code": "P-02",
        "startDate": "2026-10-01",
        "endDate": "2026-10-15",
        "managedByTeam": "51st Batch Committee",
        "teamLead": "Tanvir Hasan",
        "teamContactEmail": "tanvir.51@gmail.com",
        "managementPassword": "CustomSecret123@@",
        "lunchPrice": 55.0,
        "dinnerPrice": 55.0,
        "feastRegularPrice": 180.0,
        "feastGuestPrice": 240.0,
        "minBookingDays": 3,
        "openingBalance": 5000.0,
        "status": "upcoming"
    }
    res = client.post("/api/v1/periods", json=payload)
    assert res.status_code == 201
    period_data = res.json()
    assert period_data["managementEmail"] == "mp_02.hdm@gmail.com"
    assert period_data["teamContactEmail"] == "tanvir.51@gmail.com"

    # Verify that the provisioned user can login with the set password
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "mp_02.hdm@gmail.com", "password": "CustomSecret123@@"}
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["role"] == "Management Team"
    assert login_data["user"]["periodId"] == period_data["id"]

    # Authority resets the password for Period #02
    reset_res = client.post(
        f"/api/v1/periods/{period_data['id']}/reset-password",
        json={"newPassword": "NewAuthorityResetPass@@"}
    )
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True

    # Test login with old password fails
    fail_res = client.post(
        "/api/v1/auth/login",
        json={"email": "mp_02.hdm@gmail.com", "password": "CustomSecret123@@"}
    )
    assert fail_res.status_code == 400

    # Test login with new reset password succeeds
    success_res = client.post(
        "/api/v1/auth/login",
        json={"email": "mp_02.hdm@gmail.com", "password": "NewAuthorityResetPass@@"}
    )
    assert success_res.status_code == 200


def test_get_students_list(client):
    response = client.get("/api/v1/students")
    assert response.status_code == 200
    students = response.json()
    assert len(students) > 0
    assert "name" in students[0]
    assert "room" in students[0]


def test_create_and_get_student(client):
    new_student = {
        "studentId": "TEST-2026-999",
        "name": "Sharmin Sultana",
        "block": "D",
        "room": "335",
        "phone": "01711223344",
        "department": "Agronomy",
        "batch": "05",
        "status": "active"
    }
    create_res = client.post("/api/v1/students", json=new_student)
    assert create_res.status_code == 201
    created_id = create_res.json()["id"]

    get_res = client.get(f"/api/v1/students/{created_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Sharmin Sultana"


def test_create_booking_and_attendance_generation(client):
    students = client.get("/api/v1/students").json()
    student = students[0]

    booking_payload = {
        "studentId": student["id"],
        "startDate": "2026-09-10",
        "endDate": "2026-09-12",
        "selectedMeals": [
            {"date": "2026-09-10", "lunch": True, "dinner": True},
            {"date": "2026-09-11", "lunch": True, "dinner": True},
            {"date": "2026-09-12", "lunch": True, "dinner": False}
        ],
        "paidAmount": 250,
        "paymentMethod": "Cash",
        "notes": "Test booking for verification"
    }

    # 3 lunches @50 = 150, 2 dinners @50 = 100 -> Total = 250
    booking_res = client.post("/api/v1/bookings", json=booking_payload)
    assert booking_res.status_code == 201
    booking_data = booking_res.json()
    assert booking_data["totalLunchCount"] == 3
    assert booking_data["totalDinnerCount"] == 2
    assert booking_data["totalMealsCount"] == 5
    assert booking_data["totalAmount"] == 250.0
    assert booking_data["paidAmount"] == 250.0
    assert booking_data["dueAmount"] == 0.0

    # Verify attendance slots exist for 2026-09-10
    att_res = client.get("/api/v1/attendance?date=2026-09-10")
    assert att_res.status_code == 200
    records = att_res.json()
    matching = [r for r in records if r["studentId"] == student["id"]]
    assert len(matching) == 2


def test_record_expense_and_verify_transaction(client):
    expense_payload = {
        "item": "Fresh Broiler Chicken",
        "quantity": "15",
        "unit": "KG",
        "totalCost": 3000.0,
        "date": "2026-09-08",
        "category": "Meat",
        "purchasedBy": "Admin Supervisor",
        "vendor": "Gazipur Market",
        "memoNo": "M-8891"
    }
    exp_res = client.post("/api/v1/expenses", json=expense_payload)
    assert exp_res.status_code == 201
    exp_data = exp_res.json()
    assert exp_data["totalCost"] == 3000.0

    # Verify transactions ledger includes this outflow
    txn_res = client.get("/api/v1/finance/transactions?flow=outflow")
    assert txn_res.status_code == 200
    txns = txn_res.json()
    matching_txns = [t for t in txns if t["referenceId"] == exp_data["id"]]
    assert len(matching_txns) == 1
    assert matching_txns[0]["amount"] == 3000.0


def test_guest_meal_due_and_clearance(client):
    guest_payload = {
        "guestName": "Prof. Rafiqul",
        "hostStudentName": "Priya Bain",
        "block": "D",
        "room": "325",
        "mealType": "lunch",
        "date": "2026-09-09",
        "quantity": 2,
        "unitPrice": 60.0,
        "paymentMethod": "Due"
    }
    res = client.post("/api/v1/guest-meals", json=guest_payload)
    assert res.status_code == 201
    guest_data = res.json()
    assert guest_data["paymentStatus"] == "Due"
    assert guest_data["totalPrice"] == 120.0

    # Clear payment
    pay_res = client.post(f"/api/v1/guest-meals/{guest_data['id']}/pay", json={"paymentMethod": "Cash"})
    assert pay_res.status_code == 200
    assert pay_res.json()["paymentStatus"] == "Paid"


def test_feast_creation_and_registration(client):
    feast_payload = {
        "title": "Semester Grand Welcome Feast",
        "date": "2026-09-25",
        "mealType": "dinner",
        "regularPrice": 160.0,
        "guestPrice": 220.0,
        "maxCapacity": 250
    }
    feast_res = client.post("/api/v1/feasts", json=feast_payload)
    assert feast_res.status_code == 201
    feast_id = feast_res.json()["id"]

    students = client.get("/api/v1/students").json()
    student = students[0]

    reg_payload = {
        "studentId": student["id"],
        "isGuest": True,
        "guestCount": 1,
        "paidAmount": 400.0,
        "paymentMethod": "bKash"
    }
    reg_res = client.post(f"/api/v1/feasts/{feast_id}/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["totalAmount"] == 380.0
    assert reg_data["payableAmount"] == 20.0


def test_csv_import_endpoint(client):
    csv_content = (
        "name,block,room\n"
        "Farzana Yasmin,D,336\n"
        "Tasnim Tabassum,D,336\n"
    )
    files = {"file": ("students.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    res = client.post("/api/v1/students/import-csv", files=files)
    assert res.status_code == 200
    assert res.json()["importedCount"] == 2


def test_dashboard_stats_endpoint(client):
    stats_res = client.get("/api/v1/dashboard/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "registeredStudentsCount" in stats
    assert "totalExpectedCollection" in stats
    assert "totalCollected" in stats
    assert "currentBalance" in stats
