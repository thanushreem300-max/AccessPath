# Sample Data & Verification Limitations — AccessPath

AccessPath is designed as a software-only route optimizer using physical constraints. To protect traveler safety and represent the prototype's current stage honestly, the following limitations are documented.

## 1. Simulated Sample Dataset
All coordinates, distance metrics, stair counts, slope gradients, and path width metrics mapped for the Cubbon Park pilot are **simulated sample data**.
- Coordinates are centered around realistic park gates but are not high-precision geodetic data.
- Elevation gradients (slope percentages) are simulated to test Dijkstra cost weighting.
- Barriers are mocked to prove rerouting capabilities.

> [!WARNING]
> This prototype must not be used for real-world navigation. Field verification is pending.

## 2. Dynamic Data Freshness & Confidence Rules
Our routing engine assigns confidence ratings to route recommendations. This prevents travelers from trusting stale information:

| Level | Freshness Threshold | Rationale / Rule |
| :--- | :--- | :--- |
| **High** | Verified within 24 hours | Structural pathways verified by official surveyors or recent crowd reports with high validation count. |
| **Medium** | Verified within 7 days | Standard pathways with no active barrier reports. Low structural degradation. |
| **Low** | Verified > 7 days ago | Stale information. The system displays a caution prompt asking the traveler to verify conditions manually. |

In the backend, if any edge's `last_verified` timestamp is older than 7 days, the route's overall confidence drops to `Medium` or `Low`, causing the status to degrade from `Recommended` to `Suitable with Caution`, even if no active barrier exists.

## 3. Future Field Verification Protocols
In Phase 3, we plan to implement:
1. **Official Survey Portal:** Integration with local tourism boards to log structural metadata (concrete quality, tactile paving, ramp slopes) with high-confidence timestamps.
2. **Double-Reporter Verification:** Crowdsourced barriers will require upvotes from at least three independent users before altering public base maps, preventing accidental or malicious route blockages.
3. **Advisory Camera Verification:** Light object-detection models on mobile device cameras to report immediate pavement obstacles (like scooters, vehicles, or trash bins) to local servers in real-time.
