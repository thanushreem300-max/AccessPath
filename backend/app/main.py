from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime
import uuid

from .schemas import (
    RouteRequest, 
    RouteComparisonResult, 
    BarrierReport, 
    BarrierResponse, 
    GuidanceStep
)
from .graph import graph_db, DEFAULT_NODES
from .router import compare_routes_for_profile, CANDIDATE_ROUTES, evaluate_route

app = FastAPI(
    title="AccessPath Core API",
    description="Accessible route recommendations and barrier tracking backend for travelers with disabilities.",
    version="1.0.0"
)

# Enable CORS for the local React development environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Accessibility profiles mock dataset
ACCESSIBILITY_PROFILES = [
    {
        "id": "wheelchair",
        "name": "Wheelchair Mode",
        "icon": "Wheelchair",
        "description": "Optimized for travelers using manual or motorized wheelchairs.",
        "rules": [
            "Rejects any stairs or high curbs",
            "Requires path width >= 1.6 metres",
            "Prefers ramped access and lifts",
            "Avoids steep inclines (> 5% slope)",
            "Prioritizes smooth paved/asphalt surfaces"
        ]
    },
    {
        "id": "low_vision",
        "name": "Low Vision Mode",
        "icon": "Eye",
        "description": "Optimized for travelers with mild to severe visual impairments.",
        "rules": [
            "Prioritizes well-lit, highly contrast pathways",
            "Avoids complex multiple-turn junctions",
            "Enables descriptive audio voice alerts",
            "Warns of sudden steps or drops"
        ]
    },
    {
        "id": "hearing",
        "name": "Hearing Support Mode",
        "icon": "Ear",
        "description": "Optimized for deaf or hard-of-hearing travelers.",
        "rules": [
            "Prioritizes strong visual route signposts",
            "Uses flashing onscreen alerts for warnings",
            "Displays textual captions for all voice prompts"
        ]
    },
    {
        "id": "elderly",
        "name": "Elderly Support Mode",
        "icon": "UserCheck",
        "description": "Optimized for senior travelers needing gentle walking routes.",
        "rules": [
            "Avoids strenuous steep inclines",
            "Limits continuous stairs to under 5 steps",
            "Highlights routes containing benches and resting spots",
            "Prefers smooth, flat, low-effort surfaces"
        ]
    },
    {
        "id": "temporary_injury",
        "name": "Temporary Injury Mode",
        "icon": "Activity",
        "description": "Optimized for travelers using crutches, braces, or walking aids.",
        "rules": [
            "Rejects flights of stairs",
            "Avoids steep inclines (> 4% slope)",
            "Prefers shorter, less exhausting pathways"
        ]
    }
]

# Destinations mock dataset
DESTINATIONS = [
    {
        "id": "cubbon_park",
        "name": "Cubbon Park, Bengaluru",
        "status": "Active Pilot",
        "description": "A historic 300-acre park in the heart of Bengaluru. Features lush greenery, walking paths, and historic bandstands.",
        "coming_soon": False,
        "accessibility_attributes": {
            "pathways": "Asphalt, Concrete, Paved Stone",
            "ramps": "Available at Bamboo Grove section",
            "stairs": "Granite steps (12) near King Edward Statue",
            "width": "Varies between 1.5m and 2.5m",
            "lighting": "Well-lit main pathways; dim outer loop",
            "barriers": "Dynamic updates via crowd-sourced reports"
        }
    },
    {
        "id": "lalbagh_gardens",
        "name": "Lalbagh Botanical Garden",
        "status": "Coming Later",
        "description": "A renowned botanical garden containing over 1,000 species of flora, a classic glass house, and lake pathways.",
        "coming_soon": True,
        "accessibility_attributes": {}
    },
    {
        "id": "bangalore_palace",
        "name": "Bangalore Palace",
        "status": "Coming Later",
        "description": "A royal palace owned by the Mysore Royal Family, featuring grand wooden architecture and historic galleries.",
        "coming_soon": True,
        "accessibility_attributes": {}
    }
]

@app.get("/api/health")
def get_health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat() + "Z"}

@app.get("/api/profiles")
def get_profiles():
    return ACCESSIBILITY_PROFILES

@app.get("/api/destinations")
def get_destinations():
    return DESTINATIONS

@app.get("/api/destinations/{destination_id}")
def get_destination_details(destination_id: str):
    for dest in DESTINATIONS:
        if dest["id"] == destination_id:
            return dest
    raise HTTPException(status_code=404, detail="Destination not found")

@app.post("/api/routes/compare", response_model=RouteComparisonResult)
def compare_routes(req: RouteRequest):
    # Verify profile exists
    valid_profiles = [p["id"] for p in ACCESSIBILITY_PROFILES]
    if req.profile_id not in valid_profiles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid profile_id. Must be one of {valid_profiles}"
        )
        
    # Verify destination is Cubbon Park (our active pilot)
    if req.destination_id != "cubbon_park":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Destination is currently inactive. Only 'cubbon_park' pilot is active."
        )
        
    routes_comparison = compare_routes_for_profile(req.profile_id, req.destination_id)
    
    return RouteComparisonResult(
        selected_profile=req.profile_id,
        destination_id=req.destination_id,
        routes=routes_comparison
    )

@app.post("/api/barriers", response_model=BarrierResponse)
def report_barrier(report: BarrierReport):
    # Verify that the edge exists in our Cubbon Park graph
    edge = graph_db.get_edge(report.edge_id)
    if not edge:
        raise HTTPException(
            status_code=404, 
            detail=f"Route edge ID '{report.edge_id}' not found in pilot graph."
        )
        
    # Generate unique ID and timestamp
    barrier_id = f"barr_{uuid.uuid4().hex[:8]}"
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    new_barrier = {
        "id": barrier_id,
        "barrier_type": report.barrier_type,
        "description": report.description,
        "location_description": report.location_description,
        "edge_id": report.edge_id,
        "severity": report.severity,
        "reported_at": timestamp
    }
    
    graph_db.add_barrier(new_barrier)
    
    return BarrierResponse(**new_barrier)

@app.get("/api/barriers", response_model=List[BarrierResponse])
def get_barriers():
    return [BarrierResponse(**b) for b in graph_db.barriers]

@app.delete("/api/barriers/demo-reset")
def reset_demo():
    graph_db.reset()
    return {"status": "success", "message": "Demo database reset. Barriers removed and pathways restored."}

@app.get("/api/guidance/{route_id}", response_model=List[GuidanceStep])
def get_route_guidance(route_id: str, profile_id: str = "wheelchair"):
    # Find matching candidate route definition
    route_def = None
    for r in CANDIDATE_ROUTES:
        if r["id"] == route_id:
            route_def = r
            break
            
    if not route_def:
        raise HTTPException(status_code=404, detail="Route ID not found.")
        
    # Evaluate route to obtain its customized guidance steps
    evaluated = evaluate_route(route_def, profile_id)
    return evaluated.guidance
