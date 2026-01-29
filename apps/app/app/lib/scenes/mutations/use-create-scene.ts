import { scenesCollection, projectsCollection } from "../collections";

export interface UseCreateSceneOptions {
  projectId: string;
}

export function useCreateScene(options: UseCreateSceneOptions) {
  function create(label = "Untitled Scene") {
    const id = crypto.randomUUID();

    scenesCollection.insert({
      id,
      projectId: options.projectId,
      label,
    });

    projectsCollection.update(options.projectId, (draft) => {
      draft.editedSceneId = id;
    });

    return id;
  }

  function createWithoutEditing(label = "Untitled Scene") {
    const id = crypto.randomUUID();

    scenesCollection.insert({
      id,
      projectId: options.projectId,
      label,
    });

    return id;
  }

  return {
    create,
    createWithoutEditing,
  };
}
