from stockfish import Stockfish
import os

from .utils.evaluation import analyze_position
from .utils.classification import classify_move

STOCKFISH_PATH = os.getenv("STOCKFISH_PATH", "stockfish/stockfish-windows-x86-64-avx2.exe")

def create_engine():
    return Stockfish(
        path=STOCKFISH_PATH,
        depth=18,
        parameters={"Threads": 4, "Hash": 128, "Skill Level": 20}
    )

def analyze_game(positions):
    """
    positions: output of parse_pgn(), a list of dicts each containing
    'board_before' (chess.Board), 'move' (chess.Move), and 'fen' (str, position after the move).
    """
    if not positions:
        return []

    engine = create_engine()
    results = []

    initial_fen = positions[0]["board_before"].fen()
    current_analysis = analyze_position(engine, initial_fen)

    for position in positions:
        eval_before = current_analysis["evaluation"]
        is_mate_before = eval_before["type"] == "mate"
        cp_best = eval_before["value"]
        top_moves_before = current_analysis["top_moves"]

        next_analysis = analyze_position(engine, position["fen"])
        eval_after = next_analysis["evaluation"]
        is_mate_after = eval_after["type"] == "mate"
        cp_after = eval_after["value"]

        classification, symbol = classify_move(
            position["board_before"],
            position["move"],
            cp_best,
            is_mate_before,
            cp_after,
            is_mate_after,
            top_moves_before
        )

        results.append({
            "fen": position["fen"],
            "move": position["move"].uci(),
            "best_move": current_analysis["best_move"],
            "evaluation": eval_after,
            "classification": classification,
            "symbol": symbol,
            "top_moves": next_analysis["top_moves"]
        })

        current_analysis = next_analysis

    return results