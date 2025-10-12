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
<style>
/* 提升全局消息的层级，避免被导航条遮挡 */
.ant-message {
  z-index: 2000 !important;
}
</style>
