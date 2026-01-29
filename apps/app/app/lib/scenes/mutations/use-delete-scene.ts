import { scenesCollection, projectsCollection } from "../collections";

export interface UseDeleteSceneOptions {
  projectId: string;
}

export function useDeleteScene(options: UseDeleteSceneOptions) {
  function remove(sceneId: string) {
    scenesCollection.delete(sceneId);

    projectsCollection.update(options.projectId, (draft) => {
      if (draft.editedSceneId === sceneId) {
        draft.editedSceneId = null;
      }
    });
  }

  return {
    remove,
  };
}
