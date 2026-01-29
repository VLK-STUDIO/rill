import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { eq, useLiveQuery } from "@tanstack/vue-db";
import { scenesCollection, sceneItemsCollection } from "./collections";
import type { Scene } from "../core";

export interface UseScenesOptions {
  projectId: MaybeRefOrGetter<string>;
}

export function useScenes(options: UseScenesOptions) {
  const { data } = useLiveQuery((q) => {
    return q
      .from({
        scene: scenesCollection,
      })
      .where(({ scene }) => eq(scene.projectId, toValue(options.projectId)))
      .leftJoin({ item: sceneItemsCollection }, ({ scene, item }) =>
        eq(scene.id, item.sceneId),
      )
      .orderBy(({ scene }) => scene.createdAt, "asc")
      .orderBy(({ item }) => item?.createdAt, "asc");
  });

  const scenes = computed<Scene[]>(() =>
    Object.values(
      data.value.reduce(
        (acc, row) => {
          const scene = row.scene;
          const item = row.item;

          if (!item) {
            return {
              ...acc,
              [scene.id]: {
                ...scene,
                items: acc[scene.id]?.items ?? [],
              },
            };
          }

          acc[scene.id] = {
            ...scene,
            items: [...(acc[scene.id]?.items ?? []), item],
          };

          return acc;
        },
        {} as Record<string, Scene>,
      ),
    ),
  );

  return {
    scenes,
  };
}
