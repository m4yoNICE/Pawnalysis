from stockfish import Stockfish
import chess
import math
import os

STOCKFISH_PATH = os.getenv("STOCKFISH_PATH", "stockfish/stockfish-windows-x86-64-avx2.exe")

engine = Stockfish(
    path=STOCKFISH_PATH,
    depth=12,
    parameters={
        "Threads": 4,
        "Hash": 128,
        "Skill Level": 20
    }
)

def set_position(fen):
    engine.set_fen_position(fen)

def get_top_moves():
    return engine.get_top_moves(3)

PIECE_VALUES = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9}

def get_material_score(board, color):
    return sum(len(board.pieces(pt, color)) * val for pt, val in PIECE_VALUES.items())

def cp_to_win_prob(cp, is_mate=False):
    """Lichess-aligned win probability formula (always relative to White)."""
    if is_mate:
        return 1.0 if cp > 0 else 0.0
    if cp is None:
        return 0.5
    # Cap extreme centipawns to prevent exponential overflow
    cp = max(min(cp, 2000), -2000)
    return (50 + 50 * (2 / (1 + math.exp(-0.00368208 * cp)) - 1)) / 100

def classify_move(board_before, move, cp_best, is_mate_before, cp_after, is_mate_after, top_moves_before):
    # 1. Calculate Expected Points (EP) from White's perspective
    ep_before = cp_to_win_prob(cp_best, is_mate_before)
    ep_after = cp_to_win_prob(cp_after, is_mate_after)
    
    # 2. Compute true EP loss based on whose turn it actually was
    if board_before.turn == chess.WHITE:
        ep_loss = max(0.0, ep_before - ep_after)
    else:
        ep_loss = max(0.0, ep_after - ep_before)

    # 3. Check for "Only Move" (Great Move !) using the options BEFORE the move
    if len(top_moves_before) > 1:
        m0_cp, m0_mate = top_moves_before[0].get('Centipawn'), top_moves_before[0].get('Mate')
        m1_cp, m1_mate = top_moves_before[1].get('Centipawn'), top_moves_before[1].get('Mate')
        
        sign_before = 1 if board_before.turn == chess.WHITE else -1
        m0_val = 30000 if m0_mate and m0_mate > 0 else (-30000 if m0_mate else (m0_cp or 0) * sign_before)
        m1_val = 30000 if m1_mate and m1_mate > 0 else (-30000 if m1_mate else (m1_cp or 0) * sign_before)
        
        ep_m0 = cp_to_win_prob(m0_val, m0_mate is not None)
        ep_m1 = cp_to_win_prob(m1_val, m1_mate is not None)
        
        gap = (ep_m0 - ep_m1) if board_before.turn == chess.WHITE else (ep_m1 - ep_m0)
        if gap > 0.15 and ep_loss < 0.02:
            return "great", "!"

    # 4. Check for Sacrifice (Brilliant Move !!)
    mat_before = get_material_score(board_before, board_before.turn)
    board_after = board_before.copy()
    board_after.push(move)
    mat_after = get_material_score(board_after, board_before.turn)

    if mat_after < mat_before and ep_loss < 0.02:
        active_player_ep_before = ep_before if board_before.turn == chess.WHITE else (1.0 - ep_before)
        if active_player_ep_before < 0.95:
            return "brilliant", "!!"

    # 5. Standard Lichess Classifications
    if ep_loss >= 0.30: return "blunder", "??"
    if ep_loss >= 0.20: return "mistake", "?"
    if ep_loss >= 0.10: return "inaccuracy", "?!"
    if ep_loss < 0.02: return "best", ""

    return "good", ""

def analyze_position(fen):
    set_position(fen)
    top_moves = get_top_moves()

    if not top_moves:
        return {"best_move": None, "evaluation": {"type": "cp", "value": 0}, "top_moves": []}

    board = chess.Board(fen)
    sign = 1 if board.turn == chess.WHITE else -1

    raw_cp = top_moves[0]["Centipawn"]
    raw_mate = top_moves[0]["Mate"]

    if raw_mate is not None:
        eval_type = "mate"
        value = raw_mate * sign
    else:
        eval_type = "cp"
        value = (raw_cp or 0) * sign

    return {
        "best_move": top_moves[0]["Move"],
        "evaluation": {"type": eval_type, "value": value},
        "top_moves": top_moves
    }