"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Chess } from "chess.js";

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
import { getEmail, clearSession } from "@/lib/auth";

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function GamePage() {
  const [pgn, setPgn] = useState("");
  const [cleanPgn, setCleanPgn] = useState("");
  const [root, setRoot] = useState<MoveNode>(() => createRoot(DEFAULT_FEN));
  const [currentNodeId, setCurrentNodeId] = useState<string>(root.id);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getEmail());
  }, []);

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
    <main className="min-h-screen bg-[#F8F7F4] flex flex-col items-center p-8 gap-4">
      <div className="w-full max-w-5xl flex justify-end items-center text-sm">
        {email ? (
          <div className="flex items-center gap-3">
            <span className="text-[#6B6B6B]">{email}</span>
            <button
              onClick={() => {
                clearSession();
                setEmail(null);
              }}
              className="text-[#575068] hover:underline"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link href="/login" className="text-[#575068] hover:underline">
            Log in to save games
          </Link>
        )}
      </div>
      <div className="flex gap-8 w-full max-w-5xl">
        <div className="flex flex-col gap-4 flex-shrink-0">
          <div className="rounded-lg overflow-hidden shadow-md">
            <Board fen={currentNode.fen} onMove={handleBoardMove} />
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 rounded-lg">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm font-semibold">Analyzing...</p>
              </div>
            )}
          </div>
          <PgnInput
            pgn={pgn}
            onChange={handlePgnChange}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        <div className="flex flex-col flex-1 gap-3">
          <h2 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-widest">
            Moves
          </h2>
          <div className="flex-1 rounded-lg overflow-hidden border border-[#E5E5E5] bg-white shadow-sm">
            <MoveList
              root={root}
              currentNodeId={currentNodeId}
              onNodeClick={setCurrentNodeId}
            />
          </div>

          {currentNode.analysis?.commentary && (
            <Commentary commentary={currentNode.analysis.commentary} />
          )}

          {summary && <Summary summary={summary} />}
        </div>
      </div>
    </main>
  );
}