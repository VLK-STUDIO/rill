import { computed, ref } from "vue";
import { useLiveQuery } from "@tanstack/vue-db";
import { projectsCollection } from "../scenes/collections";
import type { Project } from "../core";

export interface ProjectsApi {
  projects: import("vue").ComputedRef<Project[]>;
  currentProject: import("vue").ComputedRef<Project | null>;
  openProject: (id: string) => void;
  createProject: (name?: string, width?: number, height?: number) => string;
  deleteProject: (id: string) => void;
  setEditedSceneId: (projectId: string, sceneId: string | null) => void;
  setActiveSceneId: (projectId: string, sceneId: string | null) => void;
}

export function useProjects(): ProjectsApi {
  const { data } = useLiveQuery((q) =>
    q
      .from({ project: projectsCollection })
      .orderBy(({ project }) => project.createdAt, "asc"),
  );

  const projects = computed<Project[]>(() => data.value);

  const openedProjectId = ref<string | null>(null);

  const currentProject = computed<Project | null>(() => {
    if (!openedProjectId.value) {
      return null;
    }

    return projects.value.find((p) => p.id === openedProjectId.value) ?? null;
  });

  function openProject(id: string) {
    openedProjectId.value = id;
  }

  function createProject(
    name = "Untitled Project",
    width = 1920,
    height = 1080,
  ): string {
    const id = crypto.randomUUID();

    projectsCollection.insert({
      id,
      name,
      width,
      height,
      activeSceneId: null,
      editedSceneId: null,
    });

    return id;
  }

  function deleteProject(id: string) {
    projectsCollection.delete(id);

    if (openedProjectId.value === id) {
      openedProjectId.value = null;
    }
  }

  function setEditedSceneId(projectId: string, sceneId: string | null) {
    projectsCollection.update(projectId, (draft) => {
      draft.editedSceneId = sceneId;
    });
  }

  function setActiveSceneId(projectId: string, sceneId: string | null) {
    projectsCollection.update(projectId, (draft) => {
      draft.activeSceneId = sceneId;
    });
  }

  return {
    projects,
    currentProject,
    openProject,
    createProject,
    deleteProject,
    setEditedSceneId,
    setActiveSceneId,
  };
}
