import { nanoid } from "nanoid";
import { MoveNode, MoveAnalysis } from "../Types";

/**
 * Move tree utilities for representing chess games with variations.
 * A flat array can't represent "multiple possible next moves from the
 * same position" — a tree can. children[0] is mainline, other indices
 * are variations. Root is a real MoveNode, not a null special-case.
 * Lookups are a plain recursive walk (findNode) — no indexing, don't
 * add caching without a measured reason to.
 *
 * All mutation functions are immutable: they return a new root rather
 * than modifying the tree in place. Callers holding the tree in React
 * state should always use the returned root, not assume the input was
 * changed.
 */

export function createRoot(startFen: string): MoveNode {
  return {
    id: "root",
    san: "",
    fen: startFen,
    parentId: null,
    children: [],
  };
}

export function findNode(root: MoveNode, id: string): MoveNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function getPath(root: MoveNode, targetId: string): MoveNode[] {
  const path: MoveNode[] = [];

  function walk(node: MoveNode): boolean {
    path.push(node);
    if (node.id === targetId) return true;
    for (const child of node.children) {
      if (walk(child)) return true;
    }
    path.pop();
    return false;
  }

  walk(root);
  return path;
}

export function getMoveNumber(path: MoveNode[]): number {
  const ply = path.length - 1; // exclude root
  return Math.ceil(ply / 2);
}

export function addMoveImmutable(
  root: MoveNode,
  fromNodeId: string,
  san: string,
  fen: string,
): { root: MoveNode; newNode: MoveNode } {
  const path = getPath(root, fromNodeId);
  if (path.length === 0) {
    throw new Error(`addMoveImmutable: node ${fromNodeId} not found in tree`);
  }

  const existing = path[path.length - 1].children.find((c) => c.san === san);
  if (existing) return { root, newNode: existing };

  const newNode: MoveNode = {
    id: nanoid(),
    san,
    fen,
    parentId: fromNodeId,
    children: [],
  };

  let updatedChild: MoveNode = {
    ...path[path.length - 1],
    children: [...path[path.length - 1].children, newNode],
  };
  for (let i = path.length - 2; i >= 0; i--) {
    const parent = path[i];
    updatedChild = {
      ...parent,
      children: parent.children.map((c) =>
        c.id === updatedChild.id ? updatedChild : c,
      ),
    };
  }
  return { root: updatedChild, newNode };
}

export function buildTreeFromPgn(
  startFen: string,
  moves: string[],
  fens: string[],
): MoveNode {
  let root = createRoot(startFen);
  let currentId = root.id;

  for (let i = 0; i < moves.length; i++) {
    const { root: updatedRoot, newNode } = addMoveImmutable(
      root,
      currentId,
      moves[i],
      fens[i],
    );
    root = updatedRoot;
    currentId = newNode.id;
  }

  return root;
}

export function attachAnalysisByFen(
  root: MoveNode,
  analysisList: MoveAnalysis[],
): MoveNode {
  const fenMap = new Map(analysisList.map((a) => [a.fen, a]));

  function walk(node: MoveNode): MoveNode {
    return {
      ...node,
      analysis: fenMap.get(node.fen) ?? node.analysis,
      children: node.children.map(walk),
    };
  }

  return walk(root);
}