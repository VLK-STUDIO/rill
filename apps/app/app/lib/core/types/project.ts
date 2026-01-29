export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  activeSceneId: string | null;
  editedSceneId: string | null;
}

export interface ProjectSettings {
  width: number;
  height: number;
}
