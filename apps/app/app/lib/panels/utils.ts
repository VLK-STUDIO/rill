import type { PanelTreeItem, PanelTreeNode } from "./types";

export function generateDefaultPanelStructure(): PanelTreeNode {
  return {
    type: "node",
    orientation: "vertical",
    size: 100,
    children: [
      {
        type: "node",
        orientation: "horizontal",
        size: 60,
        children: [
          { type: "leaf", panelTypeId: "scenes", size: 20 },
          { type: "leaf", panelTypeId: "scene-editor", size: 80 },
        ],
      },
    ],
  };
}

export function splitNodeAtPath(
  node: PanelTreeItem,
  path: number[],
  orientation: "horizontal" | "vertical",
): PanelTreeNode {
  if (path.length === 0) {
    if (node.type !== "leaf") {
      throw new Error("Cannot split a split node directly");
    }

    return {
      type: "node",
      orientation,
      size: node.size,
      children: [
        { type: "leaf", panelTypeId: node.panelTypeId, size: 50 },
        { type: "leaf", panelTypeId: node.panelTypeId, size: 50 },
      ],
    };
  }

  if (node.type !== "node") {
    throw new Error(
      "Invalid path: encountered panel node before reaching target",
    );
  }

  const [index, ...rest] = path;

  return {
    ...node,
    children: node.children.map((child, i) =>
      i === index ? splitNodeAtPath(child, rest, orientation) : child,
    ),
  };
}

export function deleteNodeAtPath(
  node: PanelTreeItem,
  path: number[],
): PanelTreeNode {
  if (path.length === 0) {
    throw new Error("Cannot delete root node");
  }

  if (node.type !== "node") {
    throw new Error(
      "Invalid path: encountered leaf node before reaching target",
    );
  }

  if (path.length === 1) {
    const indexToDelete = path[0];
    const remaining = node.children.filter((_, i) => i !== indexToDelete);

    if (remaining.length === 0) {
      throw new Error("Cannot delete the last child");
    }

    return { ...node, children: remaining };
  }

  const [index, ...rest] = path;

  return {
    ...node,
    children: node.children.map((child, i) =>
      i === index ? deleteNodeAtPath(child, rest) : child,
    ),
  };
}

export function updatePanelTypeAtPath(
  node: PanelTreeItem,
  path: number[],
  panelTypeId: string,
): PanelTreeItem {
  if (path.length === 0) {
    if (node.type !== "leaf") {
      throw new Error("Cannot update panel type of a node");
    }

    return {
      ...node,
      panelTypeId,
    };
  }

  if (node.type !== "node") {
    throw new Error(
      "Invalid path: encountered leaf node before reaching target",
    );
  }

  const [index, ...rest] = path;

  return {
    ...node,
    children: node.children.map((child, i) =>
      i === index ? updatePanelTypeAtPath(child, rest, panelTypeId) : child,
    ),
  };
}
