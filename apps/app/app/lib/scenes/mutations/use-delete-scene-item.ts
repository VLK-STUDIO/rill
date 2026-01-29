import { sceneItemsCollection } from "../collections";

export function useDeleteSceneItem() {
  function remove(itemId: string) {
    sceneItemsCollection.delete(itemId);
  }

  return {
    remove,
  };
}
