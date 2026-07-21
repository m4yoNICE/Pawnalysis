import chess
from .evaluation import cp_to_win_prob
from .material import get_material_score

def classify_move(board_before, move, cp_best, is_mate_before, cp_after, is_mate_after, top_moves_before):
    ep_before = cp_to_win_prob(cp_best, is_mate_before)
    ep_after = cp_to_win_prob(cp_after, is_mate_after)

    if board_before.turn == chess.WHITE:
        ep_loss = max(0.0, ep_before - ep_after)
    else:
        ep_loss = max(0.0, ep_after - ep_before)

    if len(top_moves_before) > 1:
        m0_cp, m0_mate = top_moves_before[0].get('Centipawn'), top_moves_before[0].get('Mate')
        m1_cp, m1_mate = top_moves_before[1].get('Centipawn'), top_moves_before[1].get('Mate')

        m0_val = 30000 if (m0_mate is not None and m0_mate > 0) else (-30000 if m0_mate is not None else (m0_cp or 0))
        m1_val = 30000 if (m1_mate is not None and m1_mate > 0) else (-30000 if m1_mate is not None else (m1_cp or 0))

        ep_m0 = cp_to_win_prob(m0_val, m0_mate is not None)
        ep_m1 = cp_to_win_prob(m1_val, m1_mate is not None)

        gap = (ep_m0 - ep_m1) if board_before.turn == chess.WHITE else (ep_m1 - ep_m0)
        if gap > 0.15 and ep_loss < 0.02:
            return "great", "!"

    mat_before = get_material_score(board_before, board_before.turn)
    board_after = board_before.copy()
    board_after.push(move)
    mat_after = get_material_score(board_after, board_before.turn)

    if mat_after < mat_before and ep_loss < 0.02:
        active_player_ep_before = ep_before if board_before.turn == chess.WHITE else (1.0 - ep_before)
        if active_player_ep_before < 0.95:
            return "brilliant", "!!"

    if ep_loss >= 0.30: return "blunder", "??"
    if ep_loss >= 0.20: return "mistake", "?"
    if ep_loss >= 0.10: return "inaccuracy", "?!"
    if ep_loss < 0.02: return "best", ""

    return "good", ""
