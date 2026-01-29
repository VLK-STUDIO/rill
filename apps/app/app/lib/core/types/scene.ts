export interface Scene {
  id: string;
  label: string;
  items: SceneItem[];
}

export type SceneItem = {
  id: string;
  sceneId: string;
  nodeTypeId: string;
  label: string;
  transform: Transform | null;
  properties: Record<string, unknown>;
  createdAt: string;
};

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}
