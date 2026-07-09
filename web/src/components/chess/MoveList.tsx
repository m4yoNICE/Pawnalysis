"use client";

import { MoveListProps, MoveNode } from "@/lib/Types";
import { getPath, getMoveNumber } from "@/lib/utils/tree";
import { getClassificationColor } from "@/lib/utils/classifications";

function MoveButton({
  node,
  isActive,
  onClick,
}: {
  node: MoveNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-1.5 py-0.5 rounded font-medium transition-colors select-none text-[15px] ${
        isActive
          ? "bg-[#575068] text-white font-semibold"
          : "text-[#1A1A1A] hover:bg-[#E1D8EF]"
      }`}
    >
      {node.san}
      {node.analysis?.symbol && (
        <span
          className="ml-0.5 text-xs font-bold"
          style={{
            color: getClassificationColor(node.analysis.classification),
          }}
        >
          {node.analysis.symbol}
        </span>
      )}
    </button>
  );
}

interface FlattenedMove {
  node: MoveNode;
  moveNumber: number;
  isWhite: boolean;
}

function flattenMainline(startMove: MoveNode, root: MoveNode): FlattenedMove[] {
  const result: FlattenedMove[] = [];
  let current: MoveNode | undefined = startMove;

  while (current) {
    const path = getPath(root, current.id);
    const ply = path.length - 1;
    const isWhite = ply % 2 === 1;
    const moveNumber = getMoveNumber(path);
    result.push({ node: current, moveNumber, isWhite });
    current = current.children[0];
  }
  return result;
}

// One variation as a flat, unboxed line: "1... Nf6 2.f3 ..." — recurses
// into nested sub-variations as additional lines beneath it.
function VariationLine({
  node,
  root,
  currentNodeId,
  onNodeClick,
  depth,
}: {
  node: MoveNode;
  root: MoveNode;
  currentNodeId: string;
  onNodeClick: (id: string) => void;
  depth: number;
}) {
  const line = flattenMainline(node, root);

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-x-1 text-[13px] py-0.5"
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {line.map((m, i) => (
          <span key={m.node.id} className="inline-flex items-center gap-1">
            <span className="text-[#6B6B6B]">
              {i === 0
                ? `${m.moveNumber}${m.isWhite ? "." : "..."}`
                : m.isWhite
                  ? `${m.moveNumber}.`
                  : ""}
            </span>
            <MoveButton
              node={m.node}
              isActive={m.node.id === currentNodeId}
              onClick={() => onNodeClick(m.node.id)}
            />
          </span>
        ))}
      </div>
      {line.flatMap((m) =>
        m.node.children
          .slice(1)
          .map((v) => (
            <VariationLine
              key={v.id}
              node={v}
              root={root}
              currentNodeId={currentNodeId}
              onNodeClick={onNodeClick}
              depth={depth + 1}
            />
          )),
      )}
    </>
  );
}

export default function MoveList({
  root,
  currentNodeId,
  onNodeClick,
}: MoveListProps) {
  if (root.children.length === 0) {
    return (
      <div className="w-full bg-white border border-[#E5E5E5] rounded-lg p-4 text-center">
        <p className="text-sm text-[#6B6B6B]">
          Paste a PGN and click Analyze to see moves.
        </p>
      </div>
    );
  }

  const flatMoves = flattenMainline(root.children[0], root);

  const rows: {
    number: number;
    white?: FlattenedMove;
    black?: FlattenedMove;
  }[] = [];

  flatMoves.forEach((m) => {
    if (m.isWhite) {
      rows.push({ number: m.moveNumber, white: m });
    } else {
      const lastRow = rows[rows.length - 1];
      if (lastRow && lastRow.number === m.moveNumber) {
        lastRow.black = m;
      } else {
        rows.push({ number: m.moveNumber, black: m });
      }
    }
  });

  return (
    <div className="w-full max-h-[560px] overflow-y-auto bg-white rounded-lg text-sm font-sans border border-[#E5E5E5]">
      <div className="flex flex-col w-full">
        {rows.map((row, index) => {
          const variationNodes = [
            ...(row.white?.node.children.slice(1) ?? []),
            ...(row.black?.node.children.slice(1) ?? []),
          ];

          return (
            <div
              key={row.number}
              className={`flex flex-col ${
                index % 2 === 0 ? "bg-[#FBFAF8]" : "bg-white"
              } border-b border-[#E5E5E5]/60 last:border-0`}
            >
              <div className="flex items-center h-8 px-3">
                <div className="w-8 text-[#6B6B6B] font-semibold text-right pr-3 select-none text-xs">
                  {row.number}
                </div>
                <div className="flex-1 flex items-center">
                  {row.white && (
                    <MoveButton
                      node={row.white.node}
                      isActive={row.white.node.id === currentNodeId}
                      onClick={() => onNodeClick(row.white!.node.id)}
                    />
                  )}
                </div>
                <div className="flex-1 flex items-center">
                  {row.black && (
                    <MoveButton
                      node={row.black.node}
                      isActive={row.black.node.id === currentNodeId}
                      onClick={() => onNodeClick(row.black!.node.id)}
                    />
                  )}
                </div>
              </div>

              {variationNodes.map((v) => (
                <VariationLine
                  key={v.id}
                  node={v}
                  root={root}
                  currentNodeId={currentNodeId}
                  onNodeClick={onNodeClick}
                  depth={0}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}