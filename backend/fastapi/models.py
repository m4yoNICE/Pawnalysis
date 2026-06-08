from pydantic import BaseModel
from typing import List, Literal, Optional


class Evaluation(BaseModel):
    type: Literal["cp", "mate"]
    value: int

class TopMove(BaseModel):
    Move: str
    Centipawn: Optional[int]
    Mate: Optional[int]

class MoveAnalysis(BaseModel):
    fen: str
    best_move: Optional[str] = None
    evaluation: Evaluation
    top_moves: List[TopMove]
    classification: str
    symbol: str
    commentary: Optional[str] = ""

#================================
class AnalyzeRequest(BaseModel):
    pgn: str
    depth: int = 15

class AnalyzeResponse(BaseModel):
    status: str
    analysis: List[MoveAnalysis]
    summary: str

