export interface PanelTreeLeaf {
  type: "leaf";
  panelTypeId: string;
  size: number;
}

export interface PanelTreeNode {
  type: "node";
  orientation: "horizontal" | "vertical";
  children: PanelTreeItem[];
  size: number;
}

export type PanelTreeItem = PanelTreeLeaf | PanelTreeNode;
