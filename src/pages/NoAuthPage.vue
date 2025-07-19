<template>
  <div id="no-auth-page">
     <a-result status="403" title="403" sub-title="抱歉，您没有权限访问此页面">
    <template #extra>
      <a-button type="primary" @click="backLastPage">返回上一个页面</a-button>
    </template>
  </a-result>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';

const backLastPage = () => {
 router.go(-1);
}
</script>

<style scoped>

</style>
