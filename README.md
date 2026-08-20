# AccessPath

**Accessible route guidance for travelers with disabilities**

AccessPath is our proposed software solution for **Omnikon National Hackathon 2026** under problem statement **Omni_Tourism_7 – Accessible Navigation for Travelers with Disabilities**.

## Problem

Travelers with disabilities often cannot find reliable and updated accessibility information at tourist destinations. Regular navigation applications usually recommend the shortest route without considering stairs, steep slopes, narrow paths, uneven surfaces, broken lifts, blocked ramps, or temporary barriers.

## Proposed Solution

AccessPath recommends a suitable route based on the traveler’s selected accessibility profile and recently verified pathway information.

The application is designed for:

* Wheelchair users
* Travelers with low vision
* Travelers with hearing impairment
* Elderly travelers
* People with temporary injuries

## Key Features

* Profile-based accessible route recommendation
* Different routes for different accessibility needs
* Explainable route acceptance and rejection
* Last-verified timestamps and confidence indicators
* Crowd-sourced barrier reporting
* Automatic rerouting when a ramp, lift, or path becomes unavailable
* Voice, high-contrast visual, and vibration guidance
* Camera-based obstacle warning as an advisory Phase-2 feature

## Example

A 250-metre route containing stairs may be the shortest route, but it is rejected in Wheelchair Mode. AccessPath can instead recommend a 310-metre route containing a ramp and wide, flat pathways, while clearly explaining the reason for its decision.

## Proposed Technology Stack

* **Frontend:** React.js Progressive Web Application
* **Maps:** Leaflet with OpenStreetMap
* **Backend:** FastAPI using Python
* **Database:** Supabase PostgreSQL with PostGIS
* **Routing:** Custom Dijkstra or A* with accessibility constraints
* **Deployment:** Vercel and Render
* **Advisory Camera Feature:** Lightweight object detection

## Prototype Scope

The initial prototype will focus on one tourist destination or campus. Accessibility information for the pilot location will be manually surveyed and verified. The first development priority is accessible routing, live barrier reporting, and automatic rerouting. The camera warning feature will be implemented only after the core workflow is functional.

## Planned Demonstration

1. Select Wheelchair Mode.
2. Choose a destination.
3. Compare available routes.
4. Reject a shorter route containing stairs.
5. Recommend a slightly longer accessible route.
6. Report a blocked ramp.
7. Automatically calculate an alternative route.
8. Update voice and visual guidance.

## System Limitation

Route guidance depends on available and recently verified accessibility data. Camera-based obstacle alerts are advisory and do not guarantee safety.

## Team INNOVISION

* Thanushree M
* Akepati Spurthi

## Current Status

This repository currently documents our Phase 1 idea submission. Prototype development and source-code updates will be added during the subsequent hackathon stages.
