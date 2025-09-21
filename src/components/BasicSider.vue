<template>
  <div id="basic-sider" v-if="useLoginStore.loginUser.id">
    <a-layout-sider
      class="sider"
      v-model:collapsed="collapsed"
      :defaultCollapsed="true"
      collapsible
    >
      <a-menu
        v-model:selectedKeys="selectedKeys"
        @click="doMenuClick"
        theme="light"
        mode="inline"
        :items="menuItems"
      />
    </a-layout-sider>
  </div>
</template>

<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import router from '@/router'
import { useLoginUserStore } from '../stores/user'

// 定义props和emit
const props = defineProps<{
  collapsed?: boolean
}>()

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
}>()

// 本地collapsed状态，与父组件同步
const collapsed = ref(props.collapsed ?? true)

// 监听props变化
watch(() => props.collapsed, (newVal) => {
  if (newVal !== undefined) {
    collapsed.value = newVal
  }
})

// 监听本地状态变化，通知父组件
watch(collapsed, (newVal) => {
  emit('update:collapsed', newVal)
})
// 菜单列表
const menuItems = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
]
const selectedKeys = ref<string[]>([''])
const route = useRouter()
// 监听路由变化，更新当前选中菜单
route.afterEach((to) => {
  selectedKeys.value = [to.path]
})

//点击菜单进行跳转
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}



const useLoginStore = useLoginUserStore()
</script>

<style scoped>
#basic-sider .title-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px;
}
#basic-sider .title-bar img {
  height: 32px;
  width: auto;
}
#basic-sider .title-bar .title {
  color: #000;
  font-size: 18px;
}
#basic-sider .sider {
  background-color: #fff;
}
#basic-sider {
  background: #fff;
}
#basic-sider :deep(.ant-layout-sider-trigger) {
  background: #fff;
}
#basic-sider :deep(.anticon) {
  color: black !important;
}
</style>
