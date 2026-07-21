from fastapi import FastAPI

import json

from chesslib.parser import parse_pgn
from chesslib.engine import analyze_game
from ai.llm import generate_commentary
from models import AnalyzeRequest, AnalyzeResponse

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import logging
import time
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    logger.info("Request received")
    start = time.time()

    positions = parse_pgn(request.pgn)
    if not positions:
        return {"status": "ok", "analysis": [], "summary": ""}

    results = analyze_game(positions)
    stockfish_done = time.time()
    logger.info(f"Stockfish total: {stockfish_done - start:.2f}s")

    summary = await generate_commentary(results)  # single string, not a tuple
    logger.info(f"LLM total: {time.time() - stockfish_done:.2f}s")

    response_data = {"status": "ok", "analysis": results, "summary": summary}
    logger.info(f"Full response:\n{json.dumps(response_data, indent=2)}")

    logger.info(f"Request complete in {time.time() - start:.2f}s")
    return response_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)