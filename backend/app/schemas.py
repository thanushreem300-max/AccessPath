from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ProfileSelection(BaseModel):
    profile_id: str = Field(..., description="ID of the accessibility profile (e.g. wheelchair, low_vision, hearing, elderly, temporary_injury)")

class RouteRequest(BaseModel):
    profile_id: str
    destination_id: str
    start_node: Optional[str] = "entrance"

class BarrierReport(BaseModel):
    barrier_type: str = Field(..., description="Type of barrier (e.g., blocked_ramp, broken_lift, construction, narrow_path, uneven_surface, temporary_closure)")
    description: str = Field(..., description="User description of the barrier")
    location_description: str = Field(..., description="Name or description of where this barrier is")
    edge_id: str = Field(..., description="The ID of the graph edge this barrier affects")
    severity: str = Field(..., description="Severity level: low, medium, high")

class BarrierResponse(BaseModel):
    id: str
    barrier_type: str
    description: str
    location_description: str
    edge_id: str
    severity: str
    reported_at: str

class RouteEdge(BaseModel):
    id: str
    source: str
    target: str
    distance: float
    stairs_count: int
    ramp_available: bool
    lift_available: bool
    slope_pct: float
    surface_type: str
    path_width: float
    lighting_level: str  # high, medium, low
    temp_barrier_status: bool
    last_verified: str
    confidence_score: str # High, Medium, Low
    notes: Optional[str] = None

class GuidanceStep(BaseModel):
    instruction: str
    visual_alert: Optional[str] = None
    distance_to_next: float

class RouteInfo(BaseModel):
    route_id: str
    name: str
    path: List[str]
    coordinates: List[List[float]]
    distance_m: float
    duration_mins: float
    accessibility_score: float
    stairs_count: int
    ramp_available: bool
    max_slope_pct: float
    min_width_m: float
    surface_condition: str
    lighting: str
    barriers_count: int
    last_verified: str
    confidence: str
    status: str  # Recommended, Suitable with Caution, Rejected
    reasons: List[str]
    edges: List[RouteEdge]
    guidance: List[GuidanceStep]

class RouteComparisonResult(BaseModel):
    selected_profile: str
    destination_id: str
    routes: List[RouteInfo]
