<template>
  <div id="basicHeader">
    <a-row :wrap="false">
      <a-col flex="200px" style="margin-left: 16px;">
        <router-link to="/">
          <div class="title-bar">
            <img src="@images/favicon.ico" alt="网站logo" />
            <span class="title">智能协同云图库</span>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto" style="margin-left: -24px;">
        <a-menu
          @click="doMenuClick"
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
        />
      </a-col>
      <a-col flex="100px">
          <ThemeSwitch/>
      </a-col>
      <a-col flex="100px">
        <div class="login-place">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a class="ant-dropdown-link" @click.prevent>
                <a-space>
                  <a-avatar :size="40" :src="loginUserStore.loginUser.userAvatar" />
                  {{ loginUserStore.loginUser.userName ?? '无名' }}
                </a-space>
                <DownOutlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <a-space> <BlockOutlined /><a @click="goToMySpace">个人空间</a></a-space>
                  </a-menu-item>
                  <a-menu-item>
                    <a-space> <AuditOutlined /><a @click="gotoProfile">个人中心</a> </a-space>
                  </a-menu-item>
                  <a-menu-item>
                    <a-space> <LogoutOutlined /><a @click="doLoginOut">退出登录</a> </a-space>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import ThemeSwitch from './ThemeSwitch/ThemeSwitch.vue'
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined, AuditOutlined,BlockOutlined } from '@ant-design/icons-vue'
import { message, type MenuProps } from 'ant-design-vue'
import { type RouteRecordRaw } from 'vue-router'
import router from '@/router'
//引入登录状态
import { useLoginUserStore } from '@/stores/user'
import { userLogoutUsingPost } from '@/api/userController'
import checkAccess from '@/access/checkAccess'
import { useAppStore } from '@/stores/app'

const app = useAppStore();
const loginUserStore = useLoginUserStore()
//远程获取登录状态
loginUserStore.getLoginUser()
const loginUser = computed(() => loginUserStore.loginUser)
// 原始菜单项
const originalItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/add_picture',
    label: '图片创建',
    title: '图片创建',
  },
  {
    key: '/add_space',
    label: '空间创建',
    title: '空间创建',
  },
  {
    key: '/others',
    label: h('a', { href: 'https://www.codefather.cn', target: '_blank' }, '编程导航'),
    title: '编程导航',
  },
]

/**
 * 将菜单项转换为路由项
 */
const menuToItem = (item: any): RouteRecordRaw | undefined => {
  // 获取所有路由
  const routes = router.getRoutes()
  // 查找与菜单项key相同的路由
  const route = routes.find((route) => route.path === item.key)
  // 如果找到了路由，返回路由项
  return route
}

// 定义一个过滤菜单项的函数
const filterMenuItems = (menuItems = [] as MenuProps['items']) => {
  return menuItems?.filter((item) => {
    const routeItem = menuToItem(item)
    // 如果不属于路由中的path，直接通过
    if (!routeItem) {
      console.log('不属于自身路由')
      return true
    }
    // 如果路由中hideInMenu为true，进行隐藏
    if (routeItem.meta && routeItem.meta?.hideInMenu) {
      console.log('隐藏路由', routeItem.path)
      return false
    }
    console.log(routeItem.path, checkAccess(loginUser.value, routeItem.meta?.access as string))
    return checkAccess(loginUser.value, routeItem.meta?.access as string)
  })
}

const items = computed<MenuProps['items']>(() => {
  return filterMenuItems(originalItems)
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}
//调整高亮的判断逻辑
const current = ref<string[]>([])
router.afterEach((to) => {
  current.value = [to.path]
})
//退出登录
const doLoginOut = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    router.replace('/user/login')
  } else {
    message.error('退出登录失败,' + res.data.message)
  }
}
//个人中心
const gotoProfile = () => {
  router.push({
    path: '/user/profile'
  })
}
//个人空间
const goToMySpace = () => {
  router.push({
    path: '/my_space',
  })
}
</script>
<style scoped>
#basicHeader img {
  width: 40px;
  height: auto;
}
#basicHeader .title {
  margin-left: 10px;
  font-size: 16px;
  color: #111111;
}
#basicHeader .header-menu {
  padding-inline: 20px;
}
</style>
