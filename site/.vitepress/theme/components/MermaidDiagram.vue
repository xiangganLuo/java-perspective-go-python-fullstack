<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  code: string;
}>();

const svg = ref("");
const error = ref("");
const diagramId = `mermaid-${Math.random().toString(36).slice(2)}`;

function decodeDiagramCode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function renderDiagram() {
  if (typeof window === "undefined") return;

  const code = decodeDiagramCode(props.code);

  try {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "default",
      flowchart: {
        htmlLabels: false,
        curve: "basis"
      }
    });

    const rendered = await mermaid.render(diagramId, code);
    svg.value = rendered.svg;
    error.value = "";
  } catch (caught) {
    svg.value = "";
    error.value = caught instanceof Error ? caught.message : String(caught);
  }
}

onMounted(renderDiagram);
watch(() => props.code, renderDiagram);
</script>

<template>
  <div class="mermaid-diagram">
    <div v-if="svg" class="mermaid-diagram__canvas" v-html="svg" />
    <pre v-else-if="error" class="mermaid-diagram__error">{{ error }}</pre>
    <div v-else class="mermaid-diagram__loading">正在渲染图表...</div>
  </div>
</template>
