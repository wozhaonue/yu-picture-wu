<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header"><BasicHeader></BasicHeader></a-layout-header>
      <a-layout>
        <BasicSider />
        <a-layout-content class="content">
          <a-config-provider :locale="zhCN">
            <router-view></router-view>
          </a-config-provider>
        </a-layout-content>
      </a-layout>
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
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import BasicHeader from '@/components/BasicHeader.vue'
import BasicSider from '@/components/BasicSider.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<style scoped>
#basicLayout .footer {
  text-align: center;
  background-color: #fff;
  font-size: 14px;
  /* 为了使页脚始终固定在页面底部 */
  position: sticky;
  top: 100vh;
  bottom: auto;
  left: 0;
  right: 0;
  padding: 16px;
  border-top: 1px solid #9d9d9d;
  border-radius: 0px;
  margin-top: auto;
}
#basicLayout .footer a {
  color: #666;
  transition: color 0.3s ease;
}
#basicLayout .footer a:hover {
  color: #222;
}
#basicLayout .header {
  background-color: white;
  /* 添加阴影效果，创建层次感 */
  box-shadow: 0 2px 8px rgba(177, 177, 177, 0.1);
  /* 设置相对定位，确保阴影显示在内容区域上方 */
  position: relative;
  padding-left: 0;
  z-index: 10;
  /* 可选：添加底部边框增强层次感 */
  border-bottom: 1px solid #f0f0f0;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  padding: 20px;
  /* 添加顶部内边距，为阴影留出空间 */
  padding-top: 24px;
  /* 可选：添加微妙的内阴影效果 */
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.02);
}
</style>
