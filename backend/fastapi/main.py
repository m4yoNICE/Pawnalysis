from fastapi import FastAPI
from chesslib.parser import parse_pgn
from chesslib.engine import analyze_position, classify_move
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

    results = []

    initial_fen = positions[0]["board_before"].fen()
    current_analysis = analyze_position(initial_fen)

    for i, position in enumerate(positions):
        move_start = time.time()

        # Extract metadata from the position BEFORE the move occurred
        eval_before = current_analysis["evaluation"]
        top_moves_before = current_analysis["top_moves"]

        # 2. Run engine on the position AFTER the move occurred
        next_analysis = analyze_position(position["fen"])
        eval_after = next_analysis["evaluation"]

        # 3. Pass eval_before/eval_after straight through - real mate depth
        # is preserved, classify_move handles mate transitions itself.
        classification, symbol = classify_move(
            position["board_before"],
            position["move"],
            eval_before,
            eval_after,
            top_moves_before
        )

        # Raw eval in vs classification out - for eyeballing accuracy.
        mover = "White" if position["board_before"].turn else "Black"
        logger.info(
            f"Move {i+1} [{mover}] {position['move'].uci()} | "
            f"before={eval_before} after={eval_after} | "
            f"-> {classification} {symbol}"
        )

        move_data = {
            "fen": position["fen"],
            "move": position["move"].uci(),
            "best_move": current_analysis["best_move"],
            "evaluation": eval_after,
            "classification": classification,
            "symbol": symbol,
            "top_moves": next_analysis["top_moves"]
        }
        results.append(move_data)

        current_analysis = next_analysis
        logger.info(f"Move {i+1} done in {time.time() - move_start:.2f}s")

    stockfish_done = time.time()
    logger.info(f"Stockfish total: {stockfish_done - start:.2f}s")

    commentaries, summary = generate_commentary(results)
    logger.info(f"LLM total: {time.time() - stockfish_done:.2f}s")

    for i in range(len(results)):
        results[i]["commentary"] = commentaries[i]

    logger.info(f"Request complete in {time.time() - start:.2f}s")
    return {"status": "ok", "analysis": results, "summary": summary}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)