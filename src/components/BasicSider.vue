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
import { computed, h, ref, watch, watchEffect } from 'vue'
import { PictureOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import router from '@/router'
import { useLoginUserStore } from '../stores/user'
import { SPACE_TYPE_ENUM } from '@/constants/teamSpace'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController'
import { message } from 'ant-design-vue'

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
watch(
  () => props.collapsed,
  (newVal) => {
    if (newVal !== undefined) {
      collapsed.value = newVal
    }
  },
)

// 监听本地状态变化，通知父组件
watch(collapsed, (newVal) => {
  emit('update:collapsed', newVal)
})
// 菜单列表
const originalMenuItems = [
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
  {
    key: '/add_space?spaceType=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]
const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  if (teamSpaceList.value.length < 1) {
    return originalMenuItems
  }
  const childrenItem = teamSpaceList.value
    .map((spaceUser) => {
      if (spaceUser?.space) {
        return {
          key: '/space/' + spaceUser.spaceId,
          label: spaceUser.space?.spaceName,
        }
      }
    })
    .filter((item) => {
      if (item) {
        return true
      }
      return false
    })
  const teamSpaceItem = {
    type: 'group',
    key: 'teamSpace',
    label: '我的团队',
    children: childrenItem,
  }
  return [...originalMenuItems, teamSpaceItem]
})
const selectedKeys = ref<string[]>([''])
const route = useRouter()
// 监听路由变化，更新当前选中菜单
route.afterEach((to) => {
  selectedKeys.value = [to.path]
})

//点击菜单进行跳转
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

// 获取团队详情
const fetchTeamDetail = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('未获得足够权限')
    console.error('无法获得我的团队详情', res.data.message)
  }
}
const useLoginStore = useLoginUserStore()
watchEffect(() => {
  if (useLoginStore.loginUser.id) {
    fetchTeamDetail()
  }
})
</script>

<style lang="scss" scoped>
@import '../styles/variable.module.scss';
@import '../styles/mixins.scss';
#basic-sider {
  .title-bar {
    @include flex-center;
    gap: $spacing-xs;
    margin: $spacing-lg;

    img {
      height: 32px;
      width: auto;
    }

    .title {
      @include theme-text;
      font-size: $font-size-lg;
    }
  }

  .sider {
    @include theme-background;

    :deep(.ant-menu) {
      @include theme-background;
    }
  }

  :deep(.ant-layout-sider-trigger) {
    @include theme-background;
  }

  :deep(.anticon) {
    @include theme-text;
  }
}
</style>
