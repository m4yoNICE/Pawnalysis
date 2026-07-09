import type { Square } from "chess.js";

export interface AnalyzeRequest {
  pgn: string;
  depth?: number;
}

export interface Evaluation {
  type: "cp" | "mate";
  value: number;
}

export interface TopMove {
  Move: string;
  Centipawn: number | null;
  Mate: number | null;
}

export interface MoveAnalysis {
  fen: string;
  best_move: string;
  evaluation: Evaluation;
  top_moves: TopMove[];
  classification: string;
  symbol: string;
  commentary: string;
}

export interface AnalyzeResponse {
  status: string;
  analysis: MoveAnalysis[];
  summary: string;
}

export interface BoardMove {
  from: Square;
  to: Square;
  promotion?: "q" | "r" | "b" | "n";
}

export interface BoardProps {
  fen: string;
  onMove: (move: BoardMove) => boolean;
}

export interface MoveListProps {
  root: MoveNode;
  currentNodeId: string;
  onNodeClick: (nodeId: string) => void;
}

export interface SummaryProps {
  summary: string;
}

export interface CommentaryProps {
  commentary: string;
}

export interface PgnInputProps {
  pgn: string;
  onChange: (pgn: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export interface MoveNode {
  id: string;
  san: string;
  fen: string;
  parentId: string | null;
  children: MoveNode[];
  analysis?: MoveAnalysis;
}
