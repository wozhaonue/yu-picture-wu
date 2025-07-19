import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import AdminUserManagePage from '@/pages/admin/AdminUserManagePage.vue'
import UserProfilePage from '@/pages/user/UserProfilePage.vue'
import NoAuthPage from '@/pages/NoAuthPage.vue'
import ACCESS_ENUM from '@/access/accessEnum'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta:{
       hideInMenu: false,
      }
    },
    {
      path: '/user/login',
      name: 'login',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: 'register',
      component: UserRegisterPage,
    },
    {
      path: '/admin/userManage',
      name: 'userManage',
      component: AdminUserManagePage,
      meta:{
        access: ACCESS_ENUM.ADMIN,
      }
    },
    {
      path: '/user/profile',
      name: 'profile',
      component: UserProfilePage,
      meta:{
        access: ACCESS_ENUM.USER,
        hideInMenu: true,
      }
    },
    {
      path: '/noAuth',
      component: NoAuthPage,
      meta:{
        hideInMenu: true,
      }
    }
  ],
})

export default router
