<template>
  <div id="app">
    <a-config-provider :theme="app.themeConfig">
      <BasicLayout />
    </a-config-provider>
  </div>
</template>
<script setup lang="ts">
import BasicLayout from './layouts/BasicLayout.vue';
import { useAppStore } from './stores/app';
const app = useAppStore();
</script>
<style scoped>

</style>
