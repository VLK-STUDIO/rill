import { computed, toValue } from "vue";
import { eq, useLiveQuery } from "@tanstack/vue-db";
import { scenesCollection, sceneItemsCollection } from "./collections";
import type { Scene } from "../core";

export interface UseProjectScenesOptions {
  projectId: import("vue").MaybeRefOrGetter<string | null>;
}

export function useProjectScenes(options: UseProjectScenesOptions) {
  const projectId = computed(() => toValue(options.projectId));

  const { data } = useLiveQuery((q) =>
    q
      .from({ scene: scenesCollection })
      .where(({ scene }) => eq(scene.projectId, projectId.value ?? "__none__"))
      .leftJoin({ item: sceneItemsCollection }, ({ scene, item }) =>
        eq(scene.id, item.sceneId),
      )
      .orderBy(({ scene }) => scene.createdAt, "asc")
      .orderBy(({ item }) => item?.createdAt, "asc"),
  );

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
