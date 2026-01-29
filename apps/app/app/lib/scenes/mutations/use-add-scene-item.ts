import type { Node, Transform } from "../../core";
import { sceneItemsCollection } from "../collections";

export interface UseAddSceneItemOptions {
  nodes: Record<string, Node>;
  getProjectDimensions: () => { width: number; height: number };
  getCurrentSceneId: () => string | null;
  getVideoDimensions: (
    node: Node,
    properties: Record<string, unknown>,
  ) => Promise<{ width: number; height: number } | null>;
}

export function useAddSceneItem(options: UseAddSceneItemOptions) {
  async function add(nodeTypeId: string) {
    const sceneId = options.getCurrentSceneId();
    if (!sceneId) {
      throw new Error("No scene selected");
    }

    const node = options.nodes[nodeTypeId];
    if (!node) {
      throw new Error(`Node ${nodeTypeId} not found`);
    }

    const properties: Record<string, unknown> = {};
    for (const [propId, prop] of Object.entries(node.properties)) {
      if (prop.type === "select") {
        const result = await prop.options();
        properties[propId] = result.default;
      }
      if (prop.type === "text") {
        properties[propId] = prop.default ?? "";
      }
    }

    const id = crypto.randomUUID();

    let transform: Transform | null = null;

    if (node.type === "video") {
      const dims = await options.getVideoDimensions(node, properties);

      if (dims) {
        const projectDims = options.getProjectDimensions();
        transform = {
          x: (projectDims.width - dims.width) / 2,
          y: (projectDims.height - dims.height) / 2,
          width: dims.width,
          height: dims.height,
          rotation: 0,
        };
      }
    } else if (node.type === "image") {
      const projectDims = options.getProjectDimensions();
      
      const defaultWidth = projectDims.width / 4;

      transform = {
        x: (projectDims.width - defaultWidth) / 2,
        y: (projectDims.height - defaultWidth) / 2,
        width: defaultWidth,
        height: defaultWidth,
        rotation: 0,
      };
    }

    sceneItemsCollection.insert({
      id,
      sceneId,
      nodeTypeId,
      label: node.label,
      properties,
      transform,
    });
  }

  return {
    add,
  };
}
