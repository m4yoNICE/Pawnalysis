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

def _mate_transition_result(board_before, eval_before, eval_after):
    """
    Lichess-aligned mate transition handling (Advice.scala MateAdvice), kept
    structurally separate from the win%-delta CpAdvice path. Only invoked
    when mate is present on either side of the move. Returns a
    (classification, symbol) tuple, or None if this is a pure cp-vs-cp
    transition that should fall through to the normal win%-delta logic.

    All *_mover values below are in the MOVING PLAYER's perspective
    (positive = good for the player who just moved), not White's.
    """
    before_is_mate = eval_before["type"] == "mate"
    after_is_mate = eval_after["type"] == "mate"
    if not before_is_mate and not after_is_mate:
        return None

    sign = 1 if board_before.turn == chess.WHITE else -1
    before_val_mover = eval_before["value"] * sign
    after_val_mover = eval_after["value"] * sign

    if before_is_mate and after_is_mate:
        before_mate_for_mover = before_val_mover > 0
        after_mate_for_mover = after_val_mover > 0
        if before_mate_for_mover and not after_mate_for_mover:
            # MateLost, flipped straight to the opponent's forced mate.
            return ("blunder", "??")
        # Mate persists (same side) or opponent already had mate and still
        # does: lichess emits no advice at all for these. Our app always
        # classifies every move, so the closest honest equivalent is "best"
        # (i.e. explicitly NOT flagged as a mistake of any size).
        return ("best", "")

    if not before_is_mate and after_is_mate:
        # MateCreated: only a loss if the new mate is against the mover.
        if after_val_mover >= 0:
            # Mover just forced mate themselves - good news, not a loss.
            return ("best", "")
        prev_cp_mover = before_val_mover
        if prev_cp_mover < -999:
            return ("inaccuracy", "?!")
        if prev_cp_mover < -700:
            return ("mistake", "?")
        return ("blunder", "??")

    # before_is_mate and not after_is_mate: MateLost (or mate escaped).
    if before_val_mover > 0:
        next_cp_mover = after_val_mover
        if next_cp_mover > 999:
            return ("inaccuracy", "?!")
        if next_cp_mover > 700:
            return ("mistake", "?")
        return ("blunder", "??")
    # Opponent had the mate, mover escaped it - good news, not a loss.
    return ("best", "")


def classify_move(board_before, move, eval_before, eval_after, top_moves_before):
    """
    eval_before / eval_after: {"type": "cp"|"mate", "value": <signed, White's
    perspective>} - the same dicts analyze_position() returns. Real mate
    depth is preserved all the way through; no flattening happens upstream
    in main.py anymore.
    """
    # 0. Mate-transition cases are handled on a completely separate path
    #    from the win%-delta classifier, matching lichess's
    #    CpAdvice orElse MateAdvice structure.
    mate_result = _mate_transition_result(board_before, eval_before, eval_after)
    if mate_result is not None:
        return mate_result

    # 1. Both positions are plain cp evals - normal win%-delta path.
    ep_before = cp_to_win_prob(eval_before["value"])
    ep_after = cp_to_win_prob(eval_after["value"])

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