from fastapi import FastAPI
from chesslib.parser import parse_pgn
from chesslib.engine import analyze_position, classify_move
from ai.llm import generate_commentary
from models import AnalyzeRequest, AnalyzeResponse

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

# logging purposes
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
    
    # 1. Establish the baseline evaluation using the starting position FEN
    initial_fen = positions[0]["board_before"].fen()
    current_analysis = analyze_position(initial_fen)
    
    for i, position in enumerate(positions):
        move_start = time.time()
        
        # Extract metadata from the position BEFORE the move occurred
        eval_before = current_analysis["evaluation"]
        is_mate_before = eval_before["type"] == "mate"
        cp_best = 30000 if is_mate_before and eval_before["value"] > 0 else (-30000 if is_mate_before else eval_before["value"])
        top_moves_before = current_analysis["top_moves"]
        
        # 2. Run engine on the position AFTER the move occurred
        next_analysis = analyze_position(position["fen"])
        eval_after = next_analysis["evaluation"]
        is_mate_after = eval_after["type"] == "mate"
        cp_after = 30000 if is_mate_after and eval_after["value"] > 0 else (-30000 if is_mate_after else eval_after["value"])
        
        # 3. Safely pass both context layers to the classifier
        classification, symbol = classify_move(
            position["board_before"],
            position["move"],
            cp_best,
            is_mate_before,
            cp_after,
            is_mate_after,
            top_moves_before
        )
        
        # Build payload structure cleanly
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
        
        # Shift reference frame forward for next iteration
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