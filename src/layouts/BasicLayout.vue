<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <!-- 固定的头部 -->
      <a-layout-header class="header fixed-header"><BasicHeader></BasicHeader></a-layout-header>

      <a-layout class="main-layout">
        <!-- 固定的侧边栏 -->
        <div class="fixed-sider-wrapper">
          <BasicSider v-model:collapsed="collapsed" />
        </div>

        <!-- 主内容区域 -->
        <a-layout-content class="content scrollable-content" :class="{ 'sider-expanded': !collapsed }">
          <a-config-provider :locale="zhCN">
            <router-view></router-view>
          </a-config-provider>
          <br>
          <!-- 页脚移到内容区域内 -->
          <a-layout-footer class="footer">
            <a
              href="https://github.com/wozhaonue/yu-picture-wu"
              target="_blank"
              rel="noopener noreferrer"
            >
              相关代码仓库
            </a>
            |
            <span>其他</span>
          </a-layout-footer>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasicHeader from '@/components/BasicHeader.vue'
import BasicSider from '@/components/BasicSider.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

// 侧边栏折叠状态
const collapsed = ref(true)
</script>

<style scoped>
/* 固定头部样式 */
#basicLayout .fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 2px 8px rgba(177, 177, 177, 0.1);
  padding-left: 0;
  z-index: 1000;
  border-bottom: 1px solid #f0f0f0;
  height: 64px; /* Ant Design 默认 header 高度 */
}

/* 主布局区域 */
#basicLayout .main-layout {
  margin-top: 64px; /* 为固定头部预留空间 */
  height: calc(100vh - 64px);
}

/* 固定侧边栏包装器 */
#basicLayout .fixed-sider-wrapper {
  position: fixed;
  left: 0;
  top: 64px; /* 位于固定头部下方 */
  bottom: 0;
  z-index: 999;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* 可滚动的内容区域 */
#basicLayout .scrollable-content {
  margin-left: 80px; /* 为折叠状态的侧边栏预留空间 */
  background: linear-gradient(to right, #fefefe, #fff);
  padding: 20px;
  min-height: calc(100vh - 64px);
  overflow-y: auto;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.02);
}

/* 页脚样式 */
#basicLayout .footer {
   /* 为了使页脚始终固定在页面底部 */
  position: sticky;
  top: 100vh;
  bottom: auto;
  left: 0;
  right: 0;
  text-align: center;
  background-color: #fff;
  font-size: 14px;
  padding: 16px;
  border-top: 1px solid #9d9d9d;
  margin-top: auto;
}

#basicLayout .footer a {
  color: #666;
  transition: color 0.3s ease;
}

#basicLayout .footer a:hover {
  color: #222;
}

/* 当侧边栏展开时，调整内容区域的左边距 */
#basicLayout .scrollable-content.sider-expanded {
  margin-left: 200px; /* 展开状态的侧边栏宽度 */
  transition: margin-left 0.3s ease;
}
</style>
