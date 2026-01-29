import { scenesCollection } from "../collections";

export function useUpdateSceneLabel() {
  function update(sceneId: string, label: string) {
    scenesCollection.update(sceneId, (draft) => {
      draft.label = label;
    });
  }

  return {
    update,
  };
}
