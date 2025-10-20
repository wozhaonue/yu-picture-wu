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
        <a-layout-content
          class="content scrollable-content"
          :class="{ 'sider-expanded': !collapsed }"
        >
          <a-config-provider :locale="zhCN">
            <router-view :key="route.fullPath"></router-view>
          </a-config-provider>
          <br />
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
import { useRoute } from 'vue-router'
import BasicHeader from '@/components/BasicHeader.vue'
import BasicSider from '@/components/BasicSider.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const route = useRoute()
// 侧边栏折叠状态
const collapsed = ref(true)
</script>

<style lang="scss" scoped>
@use '../styles/variable.module' as *;
@use '../styles/mixins' as *;
#basicLayout {
  .fixed-header {
    @include fixed-header($header-height, $z-index-fixed);
    padding-left: 0;
    @include theme-background;
    @include theme-border;
    border-bottom: 1px solid;
  }

  .main-layout {
    margin-top: $header-height;
    height: calc(100vh - #{$header-height});
  }

  .fixed-sider-wrapper {
    @include fixed-sider($header-height, $z-index-dropdown);
    @include theme-background;
    @include box-shadow(2px, 0, 8px);
  }

  .scrollable-content {
    margin-left: $sider-collapsed-width;
    padding: $spacing-md;
    min-height: calc(100vh - #{$header-height});
    overflow-y: auto;
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.02);
    transition: margin-left 0.3s ease;

    html[data-dark='light'] & {
      background: linear-gradient(to right, #fefefe, $bg-color-light);
    }
    html[data-dark='dark'] & {
      background: $bg-color-card-dark;
    }

    &.sider-expanded {
      margin-left: $sider-width;
    }
  }

  .footer {
    position: sticky;
    top: 100vh;
    bottom: auto;
    left: 0;
    right: 0;
    text-align: center;
    font-size: $font-size-sm;
    padding: $spacing-sm;
    margin-top: auto;

    @include theme-background;
    
    html[data-dark='light'] & {
      border-top: 1px solid #9d9d9d;
    }
    html[data-dark='dark'] & {
      border-top: 1px solid #656565;
    }

    a {
      color: #666;
      transition: color 0.3s ease;

      &:hover {
        @include theme-text(#222, $text-color-dark);
      }
    }
  }
}
</style>
