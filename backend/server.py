from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

from recommendation import pm, gm, get_system_prompt, get_user_query_prompt

# --- FastAPI App Setup ---
app = FastAPI()

# Enable CORS (consider restricting origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class QueryRequest(BaseModel):
    user_query: str

# Response model
class RecommendationResponse(BaseModel):
    response: str

# --- Endpoint ---
@app.post("/recommend", response_model=RecommendationResponse)
def recommend_hospitals(request: QueryRequest):
    try:
        # Core logic
        hospital_metadata = pm.query_index(request.user_query)
        system_prompt = get_system_prompt(hospital_metadata)
        user_query_prompt = get_user_query_prompt(request.user_query)
        response = gm.get_answer(system_prompt, user_query_prompt)

        return RecommendationResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

# --- Run the app ---
if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8080, reload=True)  # reload=True for dev
