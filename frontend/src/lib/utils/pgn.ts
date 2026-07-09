import { Chess } from "chess.js";

export function parsePgn(pgn: string): string {
  const chess = new Chess();
  chess.loadPgn(pgn);
  return chess.pgn();
}

export function getLastFen(pgn: string): string {
  const chess = new Chess();
  chess.loadPgn(pgn);
  return chess.fen();
}

export function getMoves(pgn: string): string[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  return chess.history();
}

export function getFens(pgn: string): string[] {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const moves = chess.history();
  const fens: string[] = [];
  const replay = new Chess();
  for (const move of moves) {
    replay.move(move);
    fens.push(replay.fen());
  }
  return fens;
}
 