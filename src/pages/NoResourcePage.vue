<template>
  <div id="no-auth-page">
     <a-result status="404" title="404" sub-title="无此页面">
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
