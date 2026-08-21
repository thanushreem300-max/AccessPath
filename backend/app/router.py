from typing import List, Dict, Any, Tuple
from .graph import graph_db, DEFAULT_NODES
from .schemas import RouteInfo, RouteEdge, GuidanceStep
from datetime import datetime

# Predefined paths representing the three demo alternatives
CANDIDATE_ROUTES = [
    {
        "id": "route_a",
        "name": "Route A (Shortest Pathway)",
        "path": ["entrance", "junc_1", "junc_2_stairs", "destination"],
        "color": "orange-red",
        "guidance_template": [
            {"instruction": "Enter through the Hudson Circle Gate and head straight on the asphalt pathway.", "visual": "Go straight for 120m. Path is smooth asphalt.", "distance": 120.0},
            {"instruction": "At the Central Promenade, turn right towards the King Edward Statue.", "visual": "Turn right and walk 60m.", "distance": 60.0},
            {"instruction": "Head down the granite steps to reach the Band Stand.", "visual": "CAUTION: 12 granite stairs ahead without a ramp.", "distance": 40.0}
        ]
    },
    {
        "id": "route_b",
        "name": "Route B (Main Accessible Pathway)",
        "path": ["entrance", "junc_1", "junc_3_ramp", "destination"],
        "color": "teal",
        "guidance_template": [
            {"instruction": "Enter through the Hudson Circle Gate and head straight on the asphalt pathway.", "visual": "Go straight for 120m. Path is smooth asphalt.", "distance": 120.0},
            {"instruction": "At the Central Promenade, turn slightly left towards the Bamboo Grove ramp.", "visual": "Slight left towards the ramp. Slope is gentle (3%).", "distance": 110.0},
            {"instruction": "Follow the wide concrete path directly to the Band Stand.", "visual": "Go straight 70m to the destination.", "distance": 70.0}
        ]
    },
    {
        "id": "route_c",
        "name": "Route C (Outer Loop Alternate)",
        "path": ["entrance", "junc_1", "junc_4_alt", "destination"],
        "color": "blue",
        "guidance_template": [
            {"instruction": "Enter through the Hudson Circle Gate and head straight on the asphalt pathway.", "visual": "Go straight for 120m. Path is smooth asphalt.", "distance": 120.0},
            {"instruction": "At the Central Promenade, turn left onto the Outer Loop Trail.", "visual": "Turn left onto Outer Loop. Low slope. Stone path.", "distance": 180.0},
            {"instruction": "Follow the path under the bamboo clusters. Note: lighting is dim here.", "visual": "Go straight 100m. Be cautious: dim lighting.", "distance": 100.0}
        ]
    }
]

def find_edge_between(source: str, target: str) -> Dict[str, Any]:
    """Finds the edge connecting source and target from the dynamic graph database."""
    for edge in graph_db.edges:
        if (edge["source"] == source and edge["target"] == target) or \
           (edge["source"] == target and edge["target"] == source):
            return edge
    return None

def evaluate_route(route_def: Dict[str, Any], profile_id: str) -> RouteInfo:
    """Evaluates a predefined path against the specified accessibility profile rules."""
    path_nodes = route_def["path"]
    edges_in_route = []
    
    # Extract edges
    for i in range(len(path_nodes) - 1):
        src, dst = path_nodes[i], path_nodes[i+1]
        edge = find_edge_between(src, dst)
        if edge:
            edges_in_route.append(edge)
            
    # Calculate aggregated statistics
    total_distance = sum(e["distance"] for e in edges_in_route)
    total_stairs = sum(e["stairs_count"] for e in edges_in_route)
    has_ramp = any(e["ramp_available"] for e in edges_in_route)
    max_slope = max((e["slope_pct"] for e in edges_in_route), default=0.0)
    min_width = min((e["path_width"] for e in edges_in_route), default=99.0)
    barriers_count = sum(1 for e in edges_in_route if e["temp_barrier_status"])
    
    # Establish overall surface type and lighting description
    surfaces = [e["surface_type"] for e in edges_in_route]
    surface_condition = ", ".join(set(surfaces))
    
    lightings = [e["lighting_level"] for e in edges_in_route]
    if "low" in lightings:
        overall_lighting = "Dim / Partially Lit"
    elif "medium" in lightings:
        overall_lighting = "Moderately Lit"
    else:
        overall_lighting = "Well Lit"
        
    # Determine oldest freshness and overall confidence (lowest confidence determines route confidence)
    confidences = [e["confidence_score"] for e in edges_in_route]
    if "Low" in confidences:
        overall_confidence = "Low"
    elif "Medium" in confidences:
        overall_confidence = "Medium"
    else:
        overall_confidence = "High"
        
    # Estimate time: walking/rolling speed depends on profile
    # Default 1.2 m/s (approx 72 m/min)
    speed = 72.0 
    if profile_id == "wheelchair":
        speed = 50.0 # slower rolling
    elif profile_id == "elderly":
        speed = 45.0 # slower walking
    elif profile_id == "temporary_injury":
        speed = 40.0 # crutches
        
    duration_mins = round(total_distance / speed, 1)
    
    # Calculate accessibility score and build reasons
    score = 100.0
    reasons = []
    hard_rejected = False
    rejection_reasons = []
    
    # ---------------- Profile Specific Rules ----------------
    if profile_id == "wheelchair":
        # 1. Stairs rejection
        if total_stairs > 0:
            hard_rejected = True
            rejection_reasons.append(f"Contains {total_stairs} stairs which cannot be navigated by wheelchair.")
            score -= 60
        # 2. Width rejection
        if min_width < 1.6:
            # penalize width below standard width
            score -= 15
            reasons.append(f"Narrow path width ({min_width}m) is less than the desired 1.6m.")
        # 3. Slope penalty
        if max_slope > 5.0:
            if not has_ramp:
                hard_rejected = True
                rejection_reasons.append(f"Steep slope ({max_slope}%) without ramp assistance.")
                score -= 40
            else:
                score -= 10
                reasons.append(f"Includes a slope of {max_slope}% (navigable via ramp).")
        else:
            if has_ramp:
                reasons.append("Includes access ramps for elevation changes.")
        # 4. Barrier rejection
        if barriers_count > 0:
            hard_rejected = True
            rejection_reasons.append("Route is blocked by an active temporary barrier (e.g. blocked ramp).")
            score = 0
            
    elif profile_id == "low_vision":
        # 1. Light penalty
        if "low" in lightings:
            score -= 20
            reasons.append("Contains dimly lit sections which may reduce visibility.")
        # 2. Stairs penalty (low vision can walk stairs but prefers smooth/stepless)
        if total_stairs > 0:
            score -= 15
            reasons.append(f"Contains {total_stairs} steps. Focus on high visual contrast.")
        # 3. Simple paths preferred
        if len(path_nodes) > 4:
            score -= 5
            reasons.append("Includes multiple turn intersections.")
        # 4. Barrier warning
        if barriers_count > 0:
            hard_rejected = True
            rejection_reasons.append("Route contains reported barriers that block visibility landmarks.")
            score = 0
            
    elif profile_id == "hearing":
        # Hearing has mostly default navigation, but emphasizes visual indicators
        if total_stairs > 0:
            reasons.append(f"Contains {total_stairs} stairs. Route is fully accessible but requires visual caution.")
        if barriers_count > 0:
            hard_rejected = True
            rejection_reasons.append("Route is currently closed due to temporary barriers.")
            score = 0
            
    elif profile_id == "elderly":
        # 1. Stairs penalty
        if total_stairs > 5:
            hard_rejected = True
            rejection_reasons.append(f"Stair count ({total_stairs}) is too strenuous for elderly travelers.")
            score -= 50
        elif total_stairs > 0:
            score -= 15
            reasons.append(f"Contains {total_stairs} steps (resting points recommended).")
        # 2. Slope penalty
        if max_slope > 4.0:
            score -= 15
            reasons.append(f"Includes steeper incline ({max_slope}% slope).")
        # 3. Barrier rejection
        if barriers_count > 0:
            hard_rejected = True
            rejection_reasons.append("Route is blocked by an active barrier.")
            score = 0
            
    elif profile_id == "temporary_injury":
        # 1. Stairs rejection
        if total_stairs > 0:
            hard_rejected = True
            rejection_reasons.append(f"Stairs ({total_stairs} count) must be avoided due to mobility support (crutches/braces).")
            score -= 60
        # 2. Slope penalty
        if max_slope > 4.0:
            score -= 15
            reasons.append(f"Slope of {max_slope}% is demanding for injured travelers.")
        # 3. Barrier rejection
        if barriers_count > 0:
            hard_rejected = True
            rejection_reasons.append("Rerouted: Route segment contains a reported barrier.")
            score = 0

    # Ensure score stays in bounds
    score = max(0.0, min(100.0, score))
    
    # Format edge schemas to return
    route_edges_response = []
    for edge in edges_in_route:
        route_edges_response.append(
            RouteEdge(
                id=edge["id"],
                source=edge["source"],
                target=edge["target"],
                distance=edge["distance"],
                stairs_count=edge["stairs_count"],
                ramp_available=edge["ramp_available"],
                lift_available=edge["lift_available"],
                slope_pct=edge["slope_pct"],
                surface_type=edge["surface_type"],
                path_width=edge["path_width"],
                lighting_level=edge["lighting_level"],
                temp_barrier_status=edge["temp_barrier_status"],
                last_verified=edge["last_verified"],
                confidence_score=edge["confidence_score"],
                notes=edge.get("notes")
            )
        )
        
    # Build coordinates array from graph nodes
    coordinates = [DEFAULT_NODES[node]["coordinates"] for node in path_nodes]
    
    # Assemble guidance steps with profile focus
    guidance_steps = []
    for step in route_def["guidance_template"]:
        visual_desc = step["visual"]
        # Modify voice instruction slightly based on profile
        voice_instruction = step["instruction"]
        if profile_id == "low_vision":
            voice_instruction = f"Caution for low vision. {voice_instruction} Use high contrast markers."
        elif profile_id == "hearing":
            visual_desc = f"[VISUAL ALERT] {visual_desc}"
            
        guidance_steps.append(
            GuidanceStep(
                instruction=voice_instruction,
                visual_alert=visual_desc,
                distance_to_next=step["distance"]
            )
        )
        
    # Base status determination
    if hard_rejected:
        status = "Rejected"
        all_reasons = rejection_reasons
    else:
        # Confidence logic details: older timestamps or medium/low confidence flags caution the route
        if overall_confidence in ["Medium", "Low"]:
            status = "Suitable with Caution"
            all_reasons = [f"Confidence level is {overall_confidence}. Information last verified on {datetime.fromisoformat(edges_in_route[0]['last_verified'].replace('Z', '')).strftime('%d %B %Y')}."] + reasons
        else:
            status = "Recommended"
            all_reasons = ["Step-free accessible route with verified pathway details."] + reasons

    if not all_reasons:
        all_reasons = ["Route meets standard criteria."]
        
    # Get last verified time (oldest edge timestamp)
    last_verified_str = min(e["last_verified"] for e in edges_in_route)
    
    return RouteInfo(
        route_id=route_def["id"],
        name=route_def["name"],
        path=path_nodes,
        coordinates=coordinates,
        distance_m=total_distance,
        duration_mins=duration_mins,
        accessibility_score=score,
        stairs_count=total_stairs,
        ramp_available=has_ramp,
        max_slope_pct=max_slope,
        min_width_m=min_width,
        surface_condition=surface_condition,
        lighting=overall_lighting,
        barriers_count=barriers_count,
        last_verified=last_verified_str,
        confidence=overall_confidence,
        status=status,
        reasons=all_reasons,
        edges=route_edges_response,
        guidance=guidance_steps
    )

def compare_routes_for_profile(profile_id: str, destination_id: str) -> List[RouteInfo]:
    """Evaluates all candidate routes and returns them, sorting Recommended first."""
    evaluated = []
    for r_def in CANDIDATE_ROUTES:
        evaluated_route = evaluate_route(r_def, profile_id)
        evaluated.append(evaluated_route)
        
    # To determine dynamic recommendations:
    # If the user is a wheelchair user, and Route B is not rejected, Route B should be Recommended,
    # and Route C should be Suitable with Caution (due to lower confidence / dim lighting).
    # If Route B IS rejected (because the ramp is blocked), Route C becomes Recommended.
    # Route A (stairs) is always Rejected for wheelchair users.
    
    # We sort: Recommended first, then Suitable with Caution, then Rejected
    status_order = {"Recommended": 0, "Suitable with Caution": 1, "Rejected": 2}
    evaluated.sort(key=lambda r: status_order.get(r.status, 3))
    
    return evaluated
