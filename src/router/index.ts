import { createRouter, createWebHistory } from 'vue-router'
import ACCESS_ENUM from '@/access/accessEnum'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
      meta:{
       hideInMenu: false,
      }
    },
    {
      path: '/user/login',
      name: 'login',
      component: () => import('@/pages/user/UserLoginPage.vue'),
    },
    {
      path: '/user/register',
      name: 'register',
      component: () => import('@/pages/user/UserRegisterPage.vue'),
    },
    {
      path: '/admin/userManage',
      name: 'userManage',
      component: () => import('@/pages/admin/AdminUserManagePage.vue'),
      meta:{
        access: ACCESS_ENUM.ADMIN,
      }
    },
    {
      path: '/user/profile',
      name: 'profile',
      component: () => import('@/pages/user/UserProfilePage.vue'),
      meta:{
        access: ACCESS_ENUM.USER,
        hideInMenu: true,
      }
    },
    {
      path: '/noAuth',
      component: () => import('@/pages/NoAuthPage.vue'),
      meta:{
        hideInMenu: true,
      }
    },
    {
      path: '/noResource',
      component: () => import('@/pages/NoResourcePage.vue'),
      meta:{
        hideInMenu: true,
      }
    },
    {
      path: '/add_picture',
      component: () => import('@/pages/AddPicturePage.vue'),
      meta:{
        access: ACCESS_ENUM.USER,
      }
    },
    {
      path: '/add_space',
      component: () => import('@/pages/AddSpacePage.vue'),
      meta:{
        access: ACCESS_ENUM.USER,
      }
    },
    {
      path: '/my_space',
      name: '我的空间',
      component: () => import('@/pages/MySpacePage.vue'),
    },
    {
      path: '/addBatch_picture',
      component: () => import('@/pages/AddPictureBatchPage.vue'),
      name: '批量创建图片',
      meta: {
        access: ACCESS_ENUM.USER,
      }
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: () => import('@/pages/admin/AdminPictureManagePage.vue'),
      meta: {
        access: ACCESS_ENUM.ADMIN,
      }
    },
    {
      path: '/admin/spaceManage',
      name: '空间管理',
      component: () => import('@/pages/admin/AdminSpaceManagePage.vue'),
      meta: {
        access: ACCESS_ENUM.ADMIN,
      }
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: () => import('@/pages/PictureDetailPage.vue'),
      props: true
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: () => import('@/pages/SpaceDetail.vue'),
      props: true
    },
    {
      path: '/spaceUserManage/:id',
      name: '空间成员管理',
      component: () => import('@/pages/SpaceUserManagePage.vue'),
      props: true
    },
    {
      path: '/search_picture',
      name: '图片找相似',
      component: () => import('@/pages/SearchPicturePage.vue'),
    },
    {
      path: '/user/spaceAnalysis',
      name: '图片分析',
      component: () => import('@/pages/user/SpaceAnalysis.vue'),
    },
    // 404 通配符路由 - 必须放在所有路由的最后
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/noResource',
      meta: {
        hideInMenu: true,
      }
    },
  ],
})

// 全局捕获路由加载错误（如动态导入 chunk 失败），自动刷新重试
router.onError((error) => {
  const msg = String(error?.message || '')
  const isChunkFail =
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('ChunkLoadError') ||
    /dynamic import/i.test(msg)

  if (isChunkFail) {
    console.warn('动态模块加载失败，准备强制刷新以重试。', error)
    // 刷新当前页面，重新拉取最新资源
    window.location.reload()
  }
})

export default router
