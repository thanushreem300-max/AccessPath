# Hackathon Demonstration Script — AccessPath Phase 2

This script guides judges through the core product demonstration for the Omnikon National Hackathon.

## Objective
Demonstrate how AccessPath customizes route calculations based on accessibility profiles, explains its routing decisions in plain English, and handles dynamic barrier reports with real-time automatic rerouting.

---

## Prerequisites
1. Start the FastAPI backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
2. Start the Vite React development server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Open a browser tab to `http://localhost:5173`.

---

## Step-by-Step Demo Guide

| Step | Action | Expected Behavior | Verification Point |
| :--- | :--- | :--- | :--- |
| **1** | Open the application page. | Displays the Welcome page with the wordmark, tagline, and value proposition cards. | Confirm the prototype notice is visible. |
| **2** | Click **Plan an Accessible Route** or click the **Profile Selection** tab. | Navigates to the Profile Selection screen. | Verify that five cards (Wheelchair, Low Vision, Hearing, Elderly, Injury) are rendered. |
| **3** | Click **Wheelchair Mode** and press **Continue**. | Selection is saved to LocalStorage. You are routed to the Destination page. | Confirm the Wheelchair Mode label is updated in the upper right. |
| **4** | Click the **Cubbon Park** card and click **Plan Route**. | Renders the leafet map of Cubbon Park, Bengalru. Fetches compared routes. | Observe the map plotting green and red start/end markers. |
| **5** | Compare **Route A** and **Route B** in the alternatives table. | **Route A (Shortest)** is marked **Rejected** (red). **Route B (Accessible)** is marked **Recommended** (teal). | Read the decision: *"Rejected for Wheelchair Mode: this route includes 12 stairs."* |
| **6** | Select **Route B** in the list or on the map. | Route B polyline is highlighted in thick teal. The step guidance panel appears. | Notice Route B's score is high (e.g. 90/100). |
| **7** | Click the speaker icon to enable Speech and click **Next Step**. | Voice synthesis reads the directions out loud. Direction prompts show visual status. | Verify voice plays (if browser volume is on) and progress bar moves. |
| **8** | Locate the **Report Barrier** form on the right sidebar. | Select **Blocked Ramp**, input landmark *“Bamboo Grove Entrance”*, and write description *“Fallen branch blocks ramp”*. Select **High Severity**. | Alternatively, click the **"Simulate Blocked Ramp"** button in the top yellow Demo Mode bar. |
| **9** | Submit the form or click the simulator button. | The map refreshes. A yellow hazard marker `⚠️` appears at the Bamboo Grove ramp. Route B is recalculated. | Screen reader speaks: *"Alert: Barrier reported. Accessible routes recalculated."* |
| **10** | Inspect the updated Route Alternatives table. | **Route B** is now marked **Rejected** (Reason: *“Route is blocked by an active temporary barrier”*). **Route C (Outer Loop)** is now **Recommended**. | Confirm Route C is selected as the active path. Start step guidance to see instructions update. |

---

## Post-Demo Cleanup
Click the **Reset Demo** button on the yellow banner. This deletes simulated barriers from backend memory, restoring default route recommendations.
