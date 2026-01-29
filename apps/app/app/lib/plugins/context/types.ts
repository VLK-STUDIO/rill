import type { Component, ComputedRef } from "vue";
import type { Scene, Transform, Node, ProjectSettings } from "../../core";
import type { StreamCache } from "../../media";

export interface PluginContext {
  project: {
    dimensions: ComputedRef<{ width: number; height: number }>;
    settings: ComputedRef<ProjectSettings>;
  };

  editor: {
    currentScene: ComputedRef<Scene | null>;
    setCurrentScene: (id: string) => void;
    clearCurrentScene: () => void;
  };

  program: {
    currentScene: ComputedRef<Scene | null>;
    transitionToScene: (scene: Scene) => void;
    clearCurrentScene: () => void;
  };

  scenes: {
    list: () => Scene[];
    create: () => void;
    delete: (id: string) => void;
    updateLabel: (id: string, label: string) => void;

    items: {
      add: (nodeTypeId: string) => Promise<void>;
      delete: (id: string) => void;
      updateTransform: (id: string, transform: Transform) => void;
      updateProperty: (id: string, propertyId: string, value: unknown) => void;
    };
  };

  media: {
    streamCache: StreamCache;
  };

  nodes: Readonly<Record<string, Node>>;
}

export interface Panel {
  label?: string;
  hideLabel?: boolean;
  icon: Component;
  component: Component<{ context: PluginContext }>;
}
