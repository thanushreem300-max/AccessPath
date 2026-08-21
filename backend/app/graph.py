from typing import Dict, List, Any
import copy
from datetime import datetime

# Pilot Destination Nodes centered around Cubbon Park, Bengaluru
DEFAULT_NODES = {
    "entrance": {
        "id": "entrance",
        "name": "Hudson Circle Entrance",
        "coordinates": [12.9760, 77.5925]
    },
    "junc_1": {
        "id": "junc_1",
        "name": "Central Promenade Junction",
        "coordinates": [12.9755, 77.5935]
    },
    "junc_2_stairs": {
        "id": "junc_2_stairs",
        "name": "King Edward Statue Junction (Stairs Segment)",
        "coordinates": [12.9750, 77.5940]
    },
    "junc_3_ramp": {
        "id": "junc_3_ramp",
        "name": "Bamboo Grove Path (Ramp Segment)",
        "coordinates": [12.9758, 77.5945]
    },
    "junc_4_alt": {
        "id": "junc_4_alt",
        "name": "Outer Loop Trail (Flat Alternate)",
        "coordinates": [12.9765, 77.5955]
    },
    "destination": {
        "id": "destination",
        "name": "Band Stand / Musical Fountain",
        "coordinates": [12.9745, 77.5950]
    }
}

# Default edges for Route A (shortest but has stairs), Route B (accessible via ramp), and Route C (longer alternate)
DEFAULT_EDGES = [
    # Base segment from entrance to central junction
    {
        "id": "edge_entrance_junc1",
        "source": "entrance",
        "target": "junc_1",
        "distance": 120.0,
        "stairs_count": 0,
        "ramp_available": False,
        "lift_available": False,
        "slope_pct": 1.5,
        "surface_type": "Asphalt",
        "path_width": 2.2,
        "lighting_level": "high",
        "temp_barrier_status": False,
        "last_verified": "2026-08-20T10:00:00Z",
        "confidence_score": "High",
        "notes": "Main smooth asphalt path leading into the park."
    },
    # Route A - Stairs Pathway (Shortest to destination)
    {
        "id": "edge_junc1_junc2",
        "source": "junc_1",
        "target": "junc_2_stairs",
        "distance": 60.0,
        "stairs_count": 0,
        "ramp_available": False,
        "lift_available": False,
        "slope_pct": 2.0,
        "surface_type": "Paved Stone",
        "path_width": 1.8,
        "lighting_level": "medium",
        "temp_barrier_status": False,
        "last_verified": "2026-08-19T14:30:00Z",
        "confidence_score": "High",
        "notes": "Connecting pathway to statue area."
    },
    {
        "id": "edge_junc2_destination",
        "source": "junc_2_stairs",
        "target": "destination",
        "distance": 40.0,
        "stairs_count": 12,  # REJECTS Wheelchair and Temporary Injury
        "ramp_available": False,
        "lift_available": False,
        "slope_pct": 8.0,
        "surface_type": "Granite Steps",
        "path_width": 1.5,
        "lighting_level": "medium",
        "temp_barrier_status": False,
        "last_verified": "2026-08-19T14:30:00Z",
        "confidence_score": "High",
        "notes": "Short flight of 12 steps down to the Band Stand."
    },
    # Route B - Ramp Pathway (Accessible route)
    {
        "id": "edge_junc1_junc3",
        "source": "junc_1",
        "target": "junc_3_ramp",
        "distance": 110.0,
        "stairs_count": 0,
        "ramp_available": True,  # Ramped transition
        "lift_available": False,
        "slope_pct": 3.0,
        "surface_type": "Concrete",
        "path_width": 1.7,
        "lighting_level": "high",
        "temp_barrier_status": False,
        "last_verified": "2026-08-20T11:00:00Z",
        "confidence_score": "High",
        "notes": "Gentle ramped entrance next to the flower beds."
    },
    {
        "id": "edge_junc3_destination",
        "source": "junc_3_ramp",
        "target": "destination",
        "distance": 70.0,
        "stairs_count": 0,
        "ramp_available": False,
        "lift_available": False,
        "slope_pct": 2.0,
        "surface_type": "Concrete",
        "path_width": 1.7,
        "lighting_level": "high",
        "temp_barrier_status": False,
        "last_verified": "2026-08-20T11:00:00Z",
        "confidence_score": "High",
        "notes": "Wide step-free concrete walkway."
    },
    # Route C - Alternate flat pathway (Longer bypass)
    {
        "id": "edge_junc1_junc4",
        "source": "junc_1",
        "target": "junc_4_alt",
        "distance": 180.0,
        "stairs_count": 0,
        "ramp_available": False,
        "lift_available": False,
        "slope_pct": 1.0,
        "surface_type": "Paved Stone",
        "path_width": 1.5,
        "lighting_level": "medium",
        "temp_barrier_status": False,
        "last_verified": "2026-08-15T09:00:00Z",  # Older verification timestamp
        "confidence_score": "Medium",
        "notes": "Longer bypass route around the outer loop. No steps."
    },
    {
        "id": "edge_junc4_destination",
        "source": "junc_4_alt",
        "target": "destination",
        "distance": 100.0,
        "stairs_count": 0,
        "ramp_available": False,
        "lift_available": False,
        "slope_pct": 1.5,
        "surface_type": "Paved Stone",
        "path_width": 1.5,
        "lighting_level": "low",  # Dimly lit
        "temp_barrier_status": False,
        "last_verified": "2026-08-15T09:00:00Z",
        "confidence_score": "Medium",
        "notes": "Bypass approach under trees; lighting is poor after sunset."
    }
]

# In-memory database simulation state
class CubbonParkGraphDB:
    def __init__(self):
        self.nodes = copy.deepcopy(DEFAULT_NODES)
        self.edges = copy.deepcopy(DEFAULT_EDGES)
        self.barriers = []

    def reset(self):
        self.nodes = copy.deepcopy(DEFAULT_NODES)
        self.edges = copy.deepcopy(DEFAULT_EDGES)
        self.barriers = []

    def get_edge(self, edge_id: str) -> Dict[str, Any]:
        for edge in self.edges:
            if edge["id"] == edge_id:
                return edge
        return None

    def add_barrier(self, barrier: Dict[str, Any]):
        self.barriers.append(barrier)
        # Update edge temporary status
        edge = self.get_edge(barrier["edge_id"])
        if edge:
            edge["temp_barrier_status"] = True
            edge["notes"] = f"BARRIER REPORTED: {barrier['barrier_type']} - {barrier['description']}. {edge['notes']}"
            edge["last_verified"] = datetime.utcnow().isoformat() + "Z"
            # Reporting a barrier drops confidence score for standard navigation, but increases confidence of the barrier itself.
            # We mark the edge confidence as High since we recently received a report of blockage.
            edge["confidence_score"] = "High"

# Single instanced DB
graph_db = CubbonParkGraphDB()
