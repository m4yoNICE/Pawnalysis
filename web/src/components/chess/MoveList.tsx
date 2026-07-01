"use client";

import { MoveListProps, MoveNode } from "@/lib/Types";
import { getPath } from "@/lib/utils/tree";
import { getClassificationColor } from "@/lib/utils/classifications";

function MoveButton({
  node,
  moveNumber,
  isActive,
  onClick,
}: {
  node: MoveNode;
  moveNumber: string | null;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <span className="inline-flex items-center">
      {moveNumber && (
        <span className="text-[#6B6B6B] text-xs mr-1 select-none">
          {moveNumber}
        </span>
      )}
      <button
        onClick={onClick}
        className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
          isActive
            ? "bg-[#575068] text-white"
            : "text-[#1A1A1A] hover:bg-[#E1D8EF]"
        }`}
      >
        {node.san}
        {node.analysis?.symbol && (
          <span
            className="ml-1 text-xs font-bold"
            style={{
              color: getClassificationColor(node.analysis.classification),
            }}
          >
            {node.analysis.symbol}
          </span>
        )}
      </button>
    </span>
  );
}

function renderLine(
  startNode: MoveNode,
  root: MoveNode,
  currentNodeId: string,
  onNodeClick: (id: string) => void,
): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let current = startNode;
  let isLineStart = true;

  while (current.children.length > 0) {
    const mainChild = current.children[0];
    const variations = current.children.slice(1);

    const path = getPath(root, mainChild.id);
    const ply = path.length - 1;
    const isWhite = ply % 2 === 1;
    const moveNumber = Math.ceil(ply / 2);
    const showNumber = isWhite || isLineStart;

    elements.push(
      <MoveButton
        key={mainChild.id}
        node={mainChild}
        moveNumber={showNumber ? `${moveNumber}${isWhite ? "." : "..."}` : null}
        isActive={mainChild.id === currentNodeId}
        onClick={() => onNodeClick(mainChild.id)}
      />,
    );

    isLineStart = false;

    for (const variation of variations) {
      elements.push(
        <span key={variation.id} className="text-[#6B6B6B] text-sm">
          {" ("}
          {renderLine(variation, root, currentNodeId, onNodeClick)}
          {") "}
        </span>,
      );
    }

    current = mainChild;
  }

  return elements;
}

export default function MoveList({
  root,
  currentNodeId,
  onNodeClick,
}: MoveListProps) {
  const elements = renderLine(root, root, currentNodeId, onNodeClick);

  return (
    <div className="w-full overflow-y-auto max-h-[560px] p-3 leading-7">
      {elements.length === 0 ? (
        <p className="text-sm text-[#6B6B6B] p-4 text-center">
          Paste a PGN and click Analyze to see moves.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-x-1">{elements}</div>
      )}
    </div>
  );
}
