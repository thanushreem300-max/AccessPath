# AccessPath Backend API Service

This is the FastAPI backend service for **AccessPath**. It contains the pilot destination coordinates, custom Dijkstra routing algorithms, dynamic barrier report stores, and explainable decision builders.

## Key Features

1. **In-Memory Mock Database:** Restores clean states for Cubbon Park graph nodes and edges, allowing dynamic barrier modifications without complex database connection strings during the hackathon demo.
2. **Dijkstra Routing Engine:** Dynamically calculates routing weights based on profile restrictions. For example, wheelchair users automatically bypass segments containing steps or active barriers.
3. **Decision Builder:** Evaluates path parameters and outputs explainable text reasons like: *"Rejected: contains 12 steps."* or *"Recommended: step-free concrete walkway."*
4. **Automated Pytest Suite:** Standard test coverage testing profile constraints, scoring, health statuses, and dynamic rerouting.

## Installation & Setup

1. Make sure you have Python 3.10+ installed.
2. Navigate to this directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic pytest httpx
   ```
4. Start the FastAPI server (runs on `http://localhost:8000`):
   ```bash
   uvicorn app.main:app --reload
   ```

## Running Automated Tests

Run pytest inside the `backend` directory to run the suite:
```bash
python -m pytest tests/test_backend.py
```
