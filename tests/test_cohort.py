import pytest
from app import create_app
from app.core.db import db
from app.models.trip import Trip
from app.models.cohort import TravelerType

@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client

@pytest.fixture
def test_trip_id(client):
    res = client.post('/api/trips', json={"name": "Family Vacation 2026"})
    assert res.status_code == 201
    return res.json["id"]

def test_stage1_cohort_suite(client, test_trip_id):
    """
    TripResQ Stage 1 Test Suite:
    - Test 1: Create a cohort containing 2 adults and 1 child (201 / success)
    - Test 2: Verify separate PNRs are preserved (T1->PNR-A123, T2->PNR-B456, T3->PNR-C789)
    - Test 3: Verify child guardian relationships are preserved (Aarav.guardian_ids = [T1, T2])
    - Test 4: Retrieve the cohort (COHORT-001, 3 members)
    """
    payload = {
        "cohort_id": "COHORT-001",
        "name": "Family Trip",
        "members": [
            {
                "traveler_id": "T1",
                "name": "Rahul",
                "type": "ADULT",
                "pnr": "PNR-A123"
            },
            {
                "traveler_id": "T2",
                "name": "Priya",
                "type": "ADULT",
                "pnr": "PNR-B456"
            },
            {
                "traveler_id": "T3",
                "name": "Aarav",
                "type": "CHILD",
                "pnr": "PNR-C789",
                "guardian_ids": ["T1", "T2"]
            }
        ],
        "settings": {
            "keep_group_together": True,
            "child_requires_guardian": True,
            "adjacent_seating_preference": True
        }
    }

    # ----------------------------------------------------
    # TEST 1: Create a cohort containing 2 adults and 1 child
    # Expected: 201 / success
    # ----------------------------------------------------
    create_res = client.post(f"/api/trips/{test_trip_id}/cohort", json=payload)
    assert create_res.status_code == 201, f"Failed cohort creation: {create_res.data}"
    data = create_res.json
    assert data["cohort_id"] == "COHORT-001"
    assert data["trip_id"] == test_trip_id
    assert len(data["members"]) == 3

    # ----------------------------------------------------
    # TEST 2: Verify separate PNRs are preserved
    # Expected:
    # T1 -> PNR-A123
    # T2 -> PNR-B456
    # T3 -> PNR-C789
    # ----------------------------------------------------
    member_map = {m["traveler_id"]: m for m in data["members"]}
    assert member_map["T1"]["pnr"] == "PNR-A123", "T1 PNR mismatch"
    assert member_map["T2"]["pnr"] == "PNR-B456", "T2 PNR mismatch"
    assert member_map["T3"]["pnr"] == "PNR-C789", "T3 PNR mismatch"
    assert member_map["T1"]["type"] == "ADULT"
    assert member_map["T2"]["type"] == "ADULT"
    assert member_map["T3"]["type"] == "CHILD"

    # ----------------------------------------------------
    # TEST 3: Verify child guardian relationships are preserved
    # Expected: Aarav.guardian_ids = ["T1", "T2"]
    # ----------------------------------------------------
    aarav = member_map["T3"]
    assert aarav["name"] == "Aarav"
    assert aarav["guardian_ids"] == ["T1", "T2"], "Aarav guardian_ids relationship mismatch"

    # ----------------------------------------------------
    # TEST 4: Retrieve the cohort
    # Expected: COHORT-001, 3 members
    # ----------------------------------------------------
    get_res = client.get(f"/api/trips/{test_trip_id}/cohort")
    assert get_res.status_code == 200, f"Failed to retrieve cohort: {get_res.data}"
    retrieved = get_res.json
    assert retrieved["cohort_id"] == "COHORT-001"
    assert len(retrieved["members"]) == 3
    assert retrieved["settings"]["keep_group_together"] is True
    assert retrieved["settings"]["child_requires_guardian"] is True
    assert retrieved["settings"]["adjacent_seating_preference"] is True

def test_demo_cohort_fallback_and_direct_endpoint(client, test_trip_id):
    """Verify demo cohort endpoint generates deterministic Rahul/Priya/Aarav structure."""
    demo_res = client.post(f"/api/trips/{test_trip_id}/cohort/demo")
    assert demo_res.status_code == 201
    demo_data = demo_res.json
    assert demo_data["cohort_id"] == "COHORT-001"
    assert len(demo_data["members"]) == 3
    
    # Query cohort by public ID
    lookup_res = client.get("/api/cohorts/COHORT-001")
    assert lookup_res.status_code == 200
    assert lookup_res.json["name"] == "Family Trip"

def test_validation_errors(client, test_trip_id):
    """Test validation errors for invalid traveler types, missing fields, or nonexistent trip."""
    # Invalid trip ID
    res = client.post("/api/trips/non-existent-id/cohort", json={
        "members": [{"name": "Solo", "pnr": "PNR-1"}]
    })
    assert res.status_code == 404

    # Invalid traveler type
    res = client.post(f"/api/trips/{test_trip_id}/cohort", json={
        "members": [{"name": "Robot", "type": "CYBORG", "pnr": "PNR-ROBOT"}]
    })
    assert res.status_code == 400

    # Non-existent guardian ID
    res = client.post(f"/api/trips/{test_trip_id}/cohort", json={
        "members": [{
            "traveler_id": "T1",
            "name": "Child Alone",
            "type": "CHILD",
            "pnr": "PNR-KID",
            "guardian_ids": ["NON_EXISTENT_GUARDIAN"]
        }]
    })
    assert res.status_code == 400
