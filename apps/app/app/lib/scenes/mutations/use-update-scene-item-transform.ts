import { sceneItemsCollection } from "../collections";
import type { Transform } from "../../core";

export function useUpdateSceneItemTransform() {
  function update(itemId: string, transform: Transform) {
    sceneItemsCollection.update(itemId, (draft) => {
      draft.transform = transform;
    });
  }

  return {
    update,
  };
}
