<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import HeroDiagram from "./components/HeroDiagram.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <HeroDiagram />
    </template>
  </Layout>
</template>
