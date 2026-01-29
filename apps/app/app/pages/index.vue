<script setup lang="ts">
import { useRouter } from "vue-router";
import { useProjects } from "../lib/projects";

const router = useRouter();
const projects = useProjects();

function createProject() {
  const id = projects.createProject();

  router.push(`/projects/${id}`);
}

function deleteProject(id: string) {
  projects.deleteProject(id);
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col justify-center items-center gap-8 bg-default p-8"
  >
    <h1 class="font-black text-muted">Rill Studio v0.0.1</h1>
    <section class="flex flex-col gap-2 max-w-xs w-full">
      <h2 class="font-medium text-muted text-xs">Recent projects</h2>
      <ul class="flex flex-col gap-2">
        <li
          v-for="project in projects.projects.value"
          :key="project.id"
          class="flex border border-default rounded-lg text-left"
        >
          <button
            variant="subtle"
            color="neutral"
            class="text-left grow flex flex-col py-1.5 px-2 hover:bg-muted/50"
            @click="router.push(`/projects/${project.id}`)"
          >
            <p class="font-medium text-sm">{{ project.name }}</p>

            <div class="flex flex-col text-xs">
              <span>Dimensions: {{ project.width }}x{{ project.height }}</span>
            </div>
          </button>
          <div class="border-l border-default flex flex-col p-1">
            <UButton
              icon="i-heroicons-trash"
              color="error"
              size="xs"
              variant="ghost"
              aria-label="Delete project"
              @click="deleteProject(project.id)"
            />
          </div>
        </li>
        <UButton
          variant="subtle"
          block
          trailing-icon="i-heroicons-plus"
          @click="createProject"
        >
          Create new project
        </UButton>
      </ul>
    </section>
  </div>
</template>
