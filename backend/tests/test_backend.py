import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.graph import graph_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Reset in-memory database before each test
    graph_db.reset()
    yield
    graph_db.reset()

def test_api_health():
    """Verify that the health check endpoint returns 200 and 'ok' status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_wheelchair_stair_rejection():
    """Verify that in wheelchair mode, Route A (stairs segment) is marked Rejected and score is penalized."""
    response = client.post("/api/routes/compare", json={
        "profile_id": "wheelchair",
        "destination_id": "cubbon_park"
    })
    assert response.status_code == 200
    data = response.json()
    
    # Route A (route_a) must be rejected
    route_a = next(r for r in data["routes"] if r["route_id"] == "route_a")
    assert route_a["status"] == "Rejected"
    assert route_a["stairs_count"] > 0
    assert any("stairs" in r.lower() for r in route_a["reasons"])
    assert route_a["accessibility_score"] < 50.0

def test_route_scoring_and_recommendation():
    """Verify that under default conditions, Route B (step-free ramp) is the Recommended route for wheelchair."""
    response = client.post("/api/routes/compare", json={
        "profile_id": "wheelchair",
        "destination_id": "cubbon_park"
    })
    assert response.status_code == 200
    data = response.json()
    
    # Under normal circumstances, Route B (route_b) is Recommended
    route_b = next(r for r in data["routes"] if r["route_id"] == "route_b")
    assert route_b["status"] == "Recommended"
    assert route_b["accessibility_score"] > 80.0
    
    # The first route in the sorted array must be Recommended
    assert data["routes"][0]["status"] == "Recommended"
    assert data["routes"][0]["route_id"] == "route_b"

def test_barrier_triggered_rerouting():
    """Verify that reporting a barrier on Route B's ramp causes it to be Rejected and Route C to become Recommended."""
    # 1. Verify B is Recommended initially
    resp1 = client.post("/api/routes/compare", json={
        "profile_id": "wheelchair",
        "destination_id": "cubbon_park"
    })
    assert resp1.json()["routes"][0]["route_id"] == "route_b"
    
    # 2. Report a barrier on Route B's ramp segment: edge_junc1_junc3
    barrier_report = {
        "barrier_type": "blocked_ramp",
        "description": "A fallen tree branch is blocking the wheelchair ramp transition.",
        "location_description": "Central Promenade entrance to Bamboo Grove ramp",
        "edge_id": "edge_junc1_junc3",
        "severity": "high"
    }
    resp_barrier = client.post("/api/barriers", json=barrier_report)
    assert resp_barrier.status_code == 200
    
    # 3. Verify Route B is now Rejected and Route C (alternate) becomes Recommended
    resp2 = client.post("/api/routes/compare", json={
        "profile_id": "wheelchair",
        "destination_id": "cubbon_park"
    })
    data = resp2.json()
    
    route_b = next(r for r in data["routes"] if r["route_id"] == "route_b")
    route_c = next(r for r in data["routes"] if r["route_id"] == "route_c")
    
    assert route_b["status"] == "Rejected"
    assert route_b["barriers_count"] == 1
    
    # Route C should be promoted to Recommended (or sorted first since it's the only non-rejected route)
    assert route_c["status"] == "Recommended" or data["routes"][0]["route_id"] == "route_c"
    assert data["routes"][0]["route_id"] == "route_c"

def test_confidence_and_freshness_calculation():
    """Verify that confidence score is calculated correctly and freshness timestamps exist."""
    response = client.post("/api/routes/compare", json={
        "profile_id": "wheelchair",
        "destination_id": "cubbon_park"
    })
    assert response.status_code == 200
    data = response.json()
    
    route_b = next(r for r in data["routes"] if r["route_id"] == "route_b")
    route_c = next(r for r in data["routes"] if r["route_id"] == "route_c")
    
    # Route B has high confidence verification
    assert route_b["confidence"] == "High"
    assert "last_verified" in route_b
    
    # Route C uses older data and should have Medium confidence
    assert route_c["confidence"] == "Medium"

def test_demo_reset():
    """Verify that the DELETE demo-reset endpoint removes barriers and restores defaults."""
    # 1. Report a barrier
    client.post("/api/barriers", json={
        "barrier_type": "blocked_ramp",
        "description": "Blocking branch",
        "location_description": "J1 to J3",
        "edge_id": "edge_junc1_junc3",
        "severity": "high"
    })
    
    # Check barriers list
    resp_barr = client.get("/api/barriers")
    assert len(resp_barr.json()) == 1
    
    # 2. Reset
    resp_reset = client.delete("/api/barriers/demo-reset")
    assert resp_reset.status_code == 200
    
    # 3. Check barriers list is empty
    resp_barr_after = client.get("/api/barriers")
    assert len(resp_barr_after.json()) == 0
    
    # Check that Route B is recommended again
    resp_routes = client.post("/api/routes/compare", json={
        "profile_id": "wheelchair",
        "destination_id": "cubbon_park"
    })
    assert resp_routes.json()["routes"][0]["route_id"] == "route_b"
