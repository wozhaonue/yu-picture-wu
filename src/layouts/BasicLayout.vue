<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh;">
      <a-layout-header class="header"><BasicHeader></BasicHeader></a-layout-header>
      <a-layout-content class="content">
         <a-config-provider :locale="zhCN">
        <router-view></router-view>
         </a-config-provider>
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://www.codefather.cn/" target="_blank" rel="noopener noreferrer">
          编程导航by鱼皮
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import BasicHeader from '@/components/BasicHeader.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>

<style scoped>
#basicLayout .footer {
  background-color: #efefef;
  text-align: center;
  font-size: 16px;
  /* 为了使页脚始终固定在页面底部 */
  position: fixed; 
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
}
#basicLayout .header {
  background-color: #fff;
  margin-bottom: 16px;
}
#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  padding: 20px;
  margin-bottom: 28px;
}
</style>