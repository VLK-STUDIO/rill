import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/vue-db";
import { z } from "zod";

export const projectsCollection = createCollection(
  localStorageCollectionOptions({
    id: "projects",
    storageKey: "projects",
    getKey: (project) => project.id,
    schema: z.object({
      id: z.string(),
      name: z.string(),
      width: z.number(),
      height: z.number(),
      activeSceneId: z.string().nullable(),
      editedSceneId: z.string().nullable(),
      createdAt: z.string().default(() => new Date().toISOString()),
    }),
  }),
);

export const scenesCollection = createCollection(
  localStorageCollectionOptions({
    id: "scenes",
    storageKey: "scenes",
    getKey: (scene) => scene.id,
    schema: z.object({
      id: z.string(),
      projectId: z.string(),
      label: z.string(),
      createdAt: z.string().default(() => new Date().toISOString()),
    }),
  }),
);

export const sceneItemsCollection = createCollection(
  localStorageCollectionOptions({
    id: "scene_items",
    storageKey: "scene_items",
    getKey: (item) => item.id,
    schema: z.object({
      id: z.string(),
      sceneId: z.string(),
      nodeTypeId: z.string(),
      label: z.string(),
      transform: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          rotation: z.number(),
        })
        .nullable(),
      properties: z.record(z.string(), z.unknown().optional()),
      createdAt: z.string().default(() => new Date().toISOString()),
    }),
  }),
);
