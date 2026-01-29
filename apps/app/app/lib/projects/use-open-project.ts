import { computed, toValue } from "vue";
import { useLiveQuery, eq } from "@tanstack/vue-db";
import { projectsCollection } from "../scenes/collections";
import type { Project } from "../core";

export interface UseOpenProjectOptions {
  projectId: import("vue").MaybeRefOrGetter<string | null>;
}

export function useOpenProject(options: UseOpenProjectOptions) {
  const projectId = computed(() => toValue(options.projectId));

  const { data } = useLiveQuery((q) => {
    const id = projectId.value;

    if (!id) {
      return q
        .from({ project: projectsCollection })
        .where(({ project }) => eq(project.id, "__none__"));
    }

    return q
      .from({ project: projectsCollection })
      .where(({ project }) => eq(project.id, id));
  });

  const project = computed<Project | null>(() => data.value[0] ?? null);

  return {
    project,
  };
}
