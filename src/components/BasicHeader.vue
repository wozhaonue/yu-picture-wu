<template>
  <div id="basicHeader">
    <!-- 主题切换蒙版动画 -->
    <div
      class="theme-transition-overlay"
      :class="{
        'active': appStore.isThemeTransitioning,
        'to-dark': appStore.isThemeTransitioning && appStore.darkMode === 'light',
        'to-light': appStore.isThemeTransitioning && appStore.darkMode === 'dark'
      }"
    >
      <div class="transition-content">
        <div class="sun-moon-container">
          <!-- 太阳图标 -->
          <div class="sun-icon" :class="{ 'active': appStore.darkMode === 'light' }">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" fill="#FFD700"/>
              <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <!-- 月亮图标 -->
          <div class="moon-icon" :class="{ 'active': appStore.darkMode === 'dark' }">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 12.79A9 9 0 1 1 7.21 3 7 7 0 0 0 17 12.79Z" fill="#4A90E2"/>
              <circle cx="13" cy="8" r="0.8" fill="#FFF"/>
              <circle cx="15" cy="10.5" r="0.4" fill="#FFF"/>
              <circle cx="11" cy="9.5" r="0.4" fill="#FFF"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

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
                  <a-avatar v-if="loginUserStore.loginUser.userAvatar" :size="40" :src="loginUserStore.loginUser.userAvatar" />
                  <a-avatar v-else :size="40">
        <template #icon><UserOutlined /></template>
      </a-avatar>
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
import { UserOutlined } from '@ant-design/icons-vue';
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
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
      // console.log('不属于自身路由')
      return true
    }
    // 如果路由中hideInMenu为true，进行隐藏
    if (routeItem.meta && routeItem.meta?.hideInMenu) {
      // console.log('隐藏路由', routeItem.path)
      return false
    }
    // console.log(routeItem.path, checkAccess(loginUser.value, routeItem.meta?.access as string))
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
<style lang="scss" scoped>
@import '../styles/variable.module.scss';
@import '../styles/mixins.scss';

/* 主题切换蒙版动画样式 */
.theme-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;

  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.active {
    opacity: 1;
    pointer-events: auto;
  }

  &.to-dark {
    background: radial-gradient(circle at center,
      rgba(15, 15, 30, 0.98) 0%,
      rgba(10, 20, 40, 0.99) 50%,
      rgba(5, 25, 50, 1) 100%);
    animation: darkTransition 1.6s ease-in-out;
  }

  &.to-light {
    background: radial-gradient(circle at center,
      rgba(255, 240, 200, 0.98) 0%,
      rgba(255, 200, 0, 0.95) 50%,
      rgba(120, 180, 220, 1) 100%);
    animation: lightTransition 1.6s ease-in-out;
  }

  .transition-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .sun-moon-container {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .sun-icon, .moon-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: all 0.6s ease;

    &.active {
      opacity: 1;
      animation: iconGlow 1.6s ease-in-out;
    }
  }

  .sun-icon {
    svg {
      filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
    }
  }

  .moon-icon {
    svg {
      filter: drop-shadow(0 0 20px rgba(74, 144, 226, 0.8));
    }
  }
}

/* 切换到暗色主题的动画 */
@keyframes darkTransition {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 切换到亮色主题的动画 */
@keyframes lightTransition {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 图标发光动画 */
@keyframes iconGlow {
  0% {
    transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
    opacity: 0;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1) rotate(360deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8) rotate(540deg);
    opacity: 0;
  }
}

#basicHeader {
  img {
    width: 40px;
    height: auto;
  }

  .title {
    margin-left: 10px;
    font-size: 16px;
    font-weight: bold;
    html[data-dark='light'] & {
    color: #333;
    }
    html[data-dark='dark'] & {
      color: #dcdcdc;
    }
  }

  .header-menu {
    padding-inline: 20px;
  }
}
</style>
