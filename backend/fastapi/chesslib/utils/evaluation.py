import math
import chess

def cp_to_win_prob(cp, is_mate=False):
    """Lichess-aligned win probability formula (always relative to White)."""
    if is_mate:
        return 1.0 if cp > 0 else 0.0
    if cp is None:
        return 0.5
    cp = max(min(cp, 2000), -2000)
    return (50 + 50 * (2 / (1 + math.exp(-0.00368208 * cp)) - 1)) / 100


def analyze_position(engine, fen):
    board = chess.Board(fen)

    if board.is_checkmate():
        mate_sign = -1 if board.turn == chess.WHITE else 1
        return {
            "best_move": None,
            "evaluation": {"type": "mate", "value": mate_sign},
            "top_moves": []
        }

    if not any(board.legal_moves):
        return {"best_move": None, "evaluation": {"type": "cp", "value": 0}, "top_moves": []}

    engine.set_fen_position(fen)
    top_moves = engine.get_top_moves(3)

    if not top_moves:
        return {"best_move": None, "evaluation": {"type": "cp", "value": 0}, "top_moves": []}

    raw_cp = top_moves[0]["Centipawn"]
    raw_mate = top_moves[0]["Mate"]

    if raw_mate is not None:
        eval_type = "mate"
        value = raw_mate  
    else:
        eval_type = "cp"
        value = raw_cp or 0

    return {
        "best_move": top_moves[0]["Move"],
        "evaluation": {"type": eval_type, "value": value},
        "top_moves": top_moves
    }
