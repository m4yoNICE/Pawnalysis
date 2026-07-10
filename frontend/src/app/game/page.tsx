"use client";

import { useState } from "react";
import { Chess } from "chess.js";

import Header from "@/components/Header";
import Board from "@/components/chess/Board";
import MoveList from "@/components/chess/MoveList";
import PgnInput from "@/components/chess/PgnInput";
import Summary from "@/components/chess/Summary";
import Commentary from "@/components/chess/Commentary";

import { parsePgn, getMoves, getFens } from "@/lib/utils/pgn";
import {
  createRoot,
  buildTreeFromPgn,
  findNode,
  attachAnalysisByFen,
  addMoveImmutable,
} from "@/lib/utils/tree";
import Api from "@/lib/services/Api";
import { AnalyzeResponse, MoveNode, BoardMove } from "@/lib/Types";

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function GamePage() {
  const [pgn, setPgn] = useState("");
  const [cleanPgn, setCleanPgn] = useState("");
  const [root, setRoot] = useState<MoveNode>(() => createRoot(DEFAULT_FEN));
  const [currentNodeId, setCurrentNodeId] = useState<string>(root.id);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentNode = findNode(root, currentNodeId) ?? root;

  function handlePgnChange(value: string) {
    setPgn(value);
    if (!value.trim()) return;
    try {
      const newRoot = buildTreeFromPgn(
        DEFAULT_FEN,
        getMoves(value),
        getFens(value),
      );
      setRoot(newRoot);
      setCurrentNodeId(newRoot.id);
    } catch {
      // invalid PGN mid-paste, ignore
    }
  }

  async function handleAnalyze() {
    try {
      const formatted = parsePgn(pgn);
      setCleanPgn(formatted);

      const newRoot = buildTreeFromPgn(DEFAULT_FEN, getMoves(pgn), getFens(pgn));
      setRoot(newRoot);
      setCurrentNodeId(newRoot.id);

      setIsLoading(true);
      const result: AnalyzeResponse = await Api.analyzeGame(formatted);

      setRoot((currentRoot) => attachAnalysisByFen(currentRoot, result.analysis));
      setSummary(result.summary);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  } 

function handleBoardMove(move: BoardMove): boolean {
  if (move.from === move.to) return false;

  const chess = new Chess(currentNode.fen);

  let result;
  try {
    result = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion ?? "q",
    });
  } catch {
    return false; 
  }

  const { root: updatedRoot, newNode } = addMoveImmutable(
    root,
    currentNode.id,
    result.san,
    chess.fen(),
  );

  setRoot(updatedRoot);
  setCurrentNodeId(newNode.id);

  return true;
}

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* Page heading — same scoresheet-header motif as the landing hero */}
        <div>
          <p className="font-mono text-xs tracking-wide text-[#B3ABC9]">
            [Event &quot;Post-game review&quot;]
          </p>
          <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-[#1A1A1A] sm:text-3xl">
            Analyze a game
          </h1>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[560px_1fr]">
          {/* Board + PGN input */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-lg border border-[#E7E0F3] shadow-sm">
              <Board fen={currentNode.fen} onMove={handleBoardMove} />
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/50">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                  <p className="text-sm font-semibold text-white">
                    Analyzing...
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 rounded-lg border border-[#E7E0F3] bg-[#FBFAFE] p-4">
              <PgnInput
                pgn={pgn}
                onChange={handlePgnChange}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Moves, commentary, summary */}
          <div className="flex min-w-0 flex-col gap-4">
            <div>
              <p className="font-mono text-xs tracking-wide text-[#B3ABC9]">
                [Moves]
              </p>
              <div className="mt-2 overflow-hidden rounded-lg border border-[#E7E0F3] shadow-sm">
                <MoveList
                  root={root}
                  currentNodeId={currentNodeId}
                  onNodeClick={setCurrentNodeId}
                />
              </div>
            </div>

            {currentNode.analysis?.commentary && (
              <div className="rounded-lg border border-[#E7E0F3] bg-[#FBFAFE] p-4">
                <Commentary commentary={currentNode.analysis.commentary} />
              </div>
            )}

            {summary && <Summary summary={summary} />}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E7E0F3]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <span className="font-mono text-sm font-semibold text-[#1A1A1A]">
            Pawn<span className="text-[#7B6FA0]">alysis</span>
          </span>
          <p className="text-xs text-[#9B9B9B]">
            Built with Stockfish &amp; AI commentary.
          </p>
        </div>
      </footer>
    </div>
  );
}