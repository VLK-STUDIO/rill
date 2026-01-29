import { computed, onScopeDispose, toValue, type MaybeRefOrGetter } from "vue";
import { eq, useLiveQuery } from "@tanstack/vue-db";
import { useNodesRegistry } from "@/lib/nodes-registry";
import type { Node, Scene } from "@/lib/core";
import { streamCache } from "../../media";
import {
  projectsCollection,
  useProjectScenes,
  useCreateScene,
  useDeleteScene,
  useUpdateSceneLabel,
  useAddSceneItem,
  useDeleteSceneItem,
  useUpdateSceneItemTransform,
  useUpdateSceneItemProperty,
  sceneItemsCollection,
} from "../../scenes";
import type { PluginContext } from "./types";

export interface CreatePluginContextOptions {
  projectId: MaybeRefOrGetter<string>;
}

export function createPluginContext(
  options: CreatePluginContextOptions,
): PluginContext {
  const nodes = useNodesRegistry();

  const projectId = computed(() => toValue(options.projectId));

  const { data: projectRows } = useLiveQuery((q) =>
    q
      .from({ project: projectsCollection })
      .where(({ project }) => eq(project.id, projectId.value)),
  );

  const project = computed(() => projectRows.value[0] ?? null);

  const dimensions = computed(() => ({
    width: project.value?.width ?? 3840,
    height: project.value?.height ?? 2160,
  }));

  const { scenes } = useProjectScenes({ projectId });

  const currentScene = computed(() => {
    const editedSceneId = project.value?.editedSceneId ?? null;
    if (!editedSceneId) {
      return null;
    }

    return scenes.value.find((s) => s.id === editedSceneId) ?? null;
  });

  const programScene = computed(() => {
    const activeSceneId = project.value?.activeSceneId ?? null;
    if (!activeSceneId) {
      return null;
    }

    return scenes.value.find((s) => s.id === activeSceneId) ?? null;
  });

  async function getVideoDimensions(
    node: Node,
    properties: Record<string, unknown>,
  ): Promise<{ width: number; height: number } | null> {
    try {
      const media = await node.render(
        properties as Parameters<typeof node.render>[0],
        {
          streamCache,
          project: {
            width: dimensions.value.width,
            height: dimensions.value.height,
          },
        },
      );

      if (media instanceof HTMLVideoElement) {
        if (media.readyState >= 1) {
          return {
            width: media.videoWidth,
            height: media.videoHeight,
          };
        }

        return new Promise((resolve) => {
          media.addEventListener("loadedmetadata", () => {
            resolve({
              width: media.videoWidth,
              height: media.videoHeight,
            });
          });
        });
      }

      if (media instanceof HTMLImageElement) {
        if (media.complete && media.naturalWidth > 0) {
          return {
            width: media.naturalWidth,
            height: media.naturalHeight,
          };
        }

        return new Promise((resolve) => {
          media.addEventListener("load", () => {
            resolve({
              width: media.naturalWidth,
              height: media.naturalHeight,
            });
          });
        });
      }

      return null;
    } catch {
      return null;
    }
  }

  function setEditedSceneId(sceneId: string | null) {
    projectsCollection.update(projectId.value, (draft) => {
      draft.editedSceneId = sceneId;
    });
  }

  function setActiveSceneId(sceneId: string | null) {
    projectsCollection.update(projectId.value, (draft) => {
      draft.activeSceneId = sceneId;
    });
  }

  const createScene = useCreateScene({ projectId: projectId.value });
  const deleteScene = useDeleteScene({ projectId: projectId.value });
  const updateSceneLabel = useUpdateSceneLabel();

  function cloneScene(scene: Scene) {
    const nextSceneId = createScene.createWithoutEditing(
      `${scene.label} (Live)`,
    );

    for (const item of scene.items) {
      sceneItemsCollection.insert({
        ...item,
        id: crypto.randomUUID(),
        sceneId: nextSceneId,
        transform: item.transform ? { ...item.transform } : null,
        properties: { ...item.properties },
      });
    }

    return nextSceneId;
  }

  const addItem = useAddSceneItem({
    nodes,
    getProjectDimensions: () => dimensions.value,
    getCurrentSceneId: () => currentScene.value?.id ?? null,
    getVideoDimensions,
  });

  const deleteSceneItem = useDeleteSceneItem();
  const updateSceneItemTransform = useUpdateSceneItemTransform();
  const updateSceneItemProperty = useUpdateSceneItemProperty();

  const context: PluginContext = {
    project: {
      dimensions,
      settings: computed(() => ({
        width: dimensions.value.width,
        height: dimensions.value.height,
      })),
    },
    editor: {
      currentScene,
      setCurrentScene: (id) => {
        setEditedSceneId(id);
      },
      clearCurrentScene: () => {
        setEditedSceneId(null);
      },
    },
    program: {
      currentScene: programScene,
      transitionToScene: (scene) => {
        const nextSceneId = cloneScene(scene);
        setActiveSceneId(nextSceneId);
      },
      clearCurrentScene: () => {
        setActiveSceneId(null);
      },
    },
    scenes: {
      list: () => scenes.value,
      create: () => {
        createScene.create();
      },
      delete: (id) => {
        deleteScene.remove(id);
      },
      updateLabel: (id, label) => {
        updateSceneLabel.update(id, label);
      },
      items: {
        add: (nodeTypeId) => addItem.add(nodeTypeId),
        delete: (id) => {
          deleteSceneItem.remove(id);
        },
        updateTransform: (id, transform) => {
          updateSceneItemTransform.update(id, transform);
        },
        updateProperty: (id, propertyId, value) => {
          updateSceneItemProperty.update(id, propertyId, value);
        },
      },
    },
    media: {
      streamCache,
    },
    nodes: Object.freeze(nodes),
  };

  onScopeDispose(() => {
    streamCache.cleanup();
  });

  return context;
}
