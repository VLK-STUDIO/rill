import { sceneItemsCollection } from "../collections";

export function useUpdateSceneItemProperty() {
  function update(itemId: string, propertyId: string, value: unknown) {
    sceneItemsCollection.update(itemId, (draft) => {
      draft.properties = {
        ...draft.properties,
        [propertyId]: value,
      };
    });
  }

  return {
    update,
  };
}
