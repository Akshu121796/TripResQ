import pytest
from app import create_app
from app.core.db import db
from app.models.cohort import TravelerType
from app.services.cohort import create_cohort_for_trip
from app.services.cohort_constraints import (
    validate_cohort_recovery,
    RULE_CHILD_GUARDIAN,
    RULE_COHORT_COHESION,
    RULE_BOOKING_DEPENDENCY,
    SEVERITY_HARD,
    SEVERITY_SOFT
)
from app.services.recovery import generate_recovery_options

@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client

@pytest.fixture
def sample_cohort():
    """Standard 2-adult 1-child cohort fixture."""
    return {
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


def test_1_cohort_stays_together(sample_cohort):
    """
    Test 1 — Cohort stays together
    Adult A -> Flight X
    Adult B -> Flight X
    Child -> Flight X
    Expected: VALID
    """
    plan = {
        "id": "plan-unified",
        "traveler_assignments": {
            "T1": "Flight-X",
            "T2": "Flight-X",
            "T3": "Flight-X"
        }
    }
    result = validate_cohort_recovery(sample_cohort, plan)
    assert result["valid"] is True, f"Expected valid, got: {result}"
    assert len(result["violations"]) == 0
    assert result["seating"]["preference"] == "ADJACENT"
    assert result["seating"]["status"] == "REQUESTED"


def test_2_child_separated_from_guardians(sample_cohort):
    """
    Test 2 — Child separated from guardians
    Adult A -> Flight X
    Adult B -> Flight Y
    Child -> Flight Z
    Expected: INVALID, CHILD_GUARDIAN (and COHORT_COHESION)
    """
    plan = {
        "id": "plan-split-alone",
        "traveler_assignments": {
            "T1": "Flight-X",
            "T2": "Flight-Y",
            "T3": "Flight-Z"
        }
    }
    result = validate_cohort_recovery(sample_cohort, plan)
    assert result["valid"] is False
    rule_names = [v["rule"] for v in result["violations"]]
    assert RULE_CHILD_GUARDIAN in rule_names
    assert RULE_COHORT_COHESION in rule_names

    minor_violation = next(v for v in result["violations"] if v["rule"] == RULE_CHILD_GUARDIAN)
    assert minor_violation["severity"] == SEVERITY_HARD
    assert minor_violation["traveler_id"] == "T3"
    assert "Aarav" in minor_violation["message"]


def test_3_child_remains_with_one_guardian(sample_cohort):
    """
    Test 3 — Child remains with one guardian
    Adult A -> Flight X
    Adult B -> Flight Y
    Child -> Flight X
    Expected: VALID with respect to guardian constraint (no CHILD_GUARDIAN violation).
    If cohort cohesion is also enabled without advance party, COHORT_COHESION is flagged.
    """
    plan = {
        "id": "plan-child-with-one-guardian",
        "traveler_assignments": {
            "T1": "Flight-X",
            "T2": "Flight-Y",
            "T3": "Flight-X"  # Child is with T1 (guardian)
        }
    }
    result = validate_cohort_recovery(sample_cohort, plan)
    rule_names = [v["rule"] for v in result["violations"]]
    # Guardian constraint MUST be satisfied
    assert RULE_CHILD_GUARDIAN not in rule_names, "Child has guardian on Flight-X, so CHILD_GUARDIAN must not trigger"

    # Default keep_group_together without advance_party triggers COHORT_COHESION
    assert RULE_COHORT_COHESION in rule_names
    assert result["valid"] is False


def test_4_cohort_split_without_advance_party(sample_cohort):
    """
    Test 4 — Cohort split
    Adult A -> Flight X
    Adult B -> Flight Y
    Child -> Flight Y
    when Advance Party is disabled.
    Expected: INVALID, COHORT_COHESION
    """
    plan = {
        "id": "plan-split-no-advance",
        "advance_party_allowed": False,
        "traveler_assignments": {
            "T1": "Flight-X",
            "T2": "Flight-Y",
            "T3": "Flight-Y"
        }
    }
    result = validate_cohort_recovery(sample_cohort, plan, trip_context={"advance_party_allowed": False})
    assert result["valid"] is False
    rule_names = [v["rule"] for v in result["violations"]]
    assert RULE_COHORT_COHESION in rule_names
    assert RULE_CHILD_GUARDIAN not in rule_names


def test_5_advance_party_allowed(sample_cohort):
    """
    Test 5 — Advance Party
    Adult A -> Flight X
    Adult B -> Flight Y
    Child -> Flight Y
    with: advance_party_allowed = true
    Expected: VALID
    """
    plan = {
        "id": "plan-advance-party",
        "advance_party_allowed": True,
        "traveler_assignments": {
            "T1": "Flight-X",  # Adult A travels ahead
            "T2": "Flight-Y",  # Adult B travels with Child
            "T3": "Flight-Y"   # Child accompanied by Adult B
        }
    }
    result = validate_cohort_recovery(sample_cohort, plan, trip_context={"advance_party_allowed": True})
    assert result["valid"] is True, f"Expected valid under advance party, got: {result}"
    assert len(result["violations"]) == 0


def test_6_advance_party_cannot_separate_child(sample_cohort):
    """
    Test 6 — Advance Party cannot separate child
    Adult A -> Flight X
    Adult B -> Flight Y
    Child -> Flight Z
    with Advance Party enabled.
    Expected: INVALID, CHILD_GUARDIAN
    """
    plan = {
        "id": "plan-advance-fail",
        "advance_party_allowed": True,
        "traveler_assignments": {
            "T1": "Flight-X",
            "T2": "Flight-Y",
            "T3": "Flight-Z"  # Unaccompanied child
        }
    }
    result = validate_cohort_recovery(sample_cohort, plan, trip_context={"advance_party_allowed": True})
    assert result["valid"] is False
    rule_names = [v["rule"] for v in result["violations"]]
    assert RULE_CHILD_GUARDIAN in rule_names, "Advance party can never override the child/guardian safety rule"


def test_soft_rule_booking_dependency(sample_cohort):
    """
    Soft rule test: booking dependency triggers warning without marking plan invalid.
    """
    plan = {
        "id": "plan-soft-warning",
        "advance_party_allowed": True,
        "traveler_assignments": {
            "T1": "Flight-X",
            "T2": "Flight-Y",
            "T3": "Flight-Y"
        },
        "shared_dependencies": [
            {
                "type": "RENTAL_CAR",
                "responsible_traveler_id": "T1",
                "message": "Primary rental-car driver arrives on an advance flight."
            }
        ]
    }
    result = validate_cohort_recovery(sample_cohort, plan, trip_context={"advance_party_allowed": True})
    assert result["valid"] is True, "SOFT warnings must not invalidate the plan"
    assert len(result["warnings"]) == 1
    assert result["warnings"][0]["rule"] == RULE_BOOKING_DEPENDENCY
    assert result["warnings"][0]["severity"] == SEVERITY_SOFT


def test_7_no_cohort_recovery_behavior(client):
    """
    Test 7 — No cohort
    Existing trip without cohort.
    Expected: Existing recovery behavior unchanged.
    """
    # 1. Create a trip with broken nodes but NO cohort
    res = client.post("/api/trips", json={"name": "Trip Without Cohort"})
    trip_id = res.json["id"]

    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    f_res = client.post("/api/nodes", json={
        "trip_id": trip_id, "node_type": "FLIGHT", "title": "Flight 1",
        "start_time": now.isoformat(), "end_time": (now + timedelta(hours=2)).isoformat()
    })
    h_res = client.post("/api/nodes", json={
        "trip_id": trip_id, "node_type": "HOTEL", "title": "Hotel 1",
        "start_time": (now + timedelta(hours=3)).isoformat(), "end_time": (now + timedelta(hours=24)).isoformat(),
        "hard_cutoff": (now + timedelta(hours=4)).isoformat()
    })

    # Disrupt to trigger broken hotel cutoff
    client.post(f"/api/trips/{trip_id}/disrupt", json={"node_id": f_res.json["id"], "delay_minutes": 300})

    # Call recovery options
    rec_res = client.post(f"/api/trips/{trip_id}/recovery-options", json={"priority": "FASTEST"})
    assert rec_res.status_code == 200
    rec_data = rec_res.json

    assert "plans" in rec_data
    assert len(rec_data["plans"]) == 4
    assert rec_data["rejected_plans"] == []
    assert "cohort" not in rec_data  # No cohort attached


def test_recovery_engine_filters_fractured_candidate(client):
    """
    Test integration in recovery engine: When a cohort exists and an invalid
    split candidate is evaluated, it is filtered out of plans and moved to rejected_plans.
    """
    # Create trip with cohort
    t_res = client.post("/api/trips", json={"name": "Family Trip With Disruption"})
    trip_id = t_res.json["id"]

    client.post(f"/api/trips/{trip_id}/cohort/demo")

    now = pytest.importorskip("datetime").datetime.now(pytest.importorskip("datetime").timezone.utc)
    delta = pytest.importorskip("datetime").timedelta
    f_res = client.post("/api/nodes", json={
        "trip_id": trip_id, "node_type": "FLIGHT", "title": "Flight AI-101",
        "start_time": now.isoformat(), "end_time": (now + delta(hours=2)).isoformat()
    })
    client.post("/api/nodes", json={
        "trip_id": trip_id, "node_type": "HOTEL", "title": "Hotel Grand",
        "start_time": (now + delta(hours=3)).isoformat(), "end_time": (now + delta(hours=24)).isoformat(),
        "hard_cutoff": (now + delta(hours=4)).isoformat()
    })

    client.post(f"/api/trips/{trip_id}/disrupt", json={"node_id": f_res.json["id"], "delay_minutes": 300})

    # Pass in a candidate with simulated airline split
    split_candidate = {
        "id": "plan-airline-split",
        "title": "Airline Split Rebooking",
        "priority": "FASTEST",
        "traveler_assignments": {
            "T1": "Flight-A",
            "T2": "Flight-B",
            "T3": "Flight-C"
        },
        "estimated_cost": 0,
        "time_saved_minutes": 60,
        "proposals": []
    }

    rec_res = client.post(f"/api/trips/{trip_id}/recovery-options", json={
        "priority": "FASTEST",
        "additional_candidates": [split_candidate]
    })
    assert rec_res.status_code == 200
    rec_data = rec_res.json

    assert rec_data["fracture_detected"] is True
    assert len(rec_data["rejected_plans"]) >= 1

    rejected_plan_ids = [rp["plan_id"] for rp in rec_data["rejected_plans"]]
    assert "plan-airline-split" in rejected_plan_ids

    # The surviving valid plans do NOT include the split candidate
    valid_plan_ids = [p["id"] for p in rec_data["plans"]]
    assert "plan-airline-split" not in valid_plan_ids
