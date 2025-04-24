<template>
  <div id="basicHeader">
    <a-row :wrap="false">
    <a-col flex="200px">
     <router-link to="/">
      <div class="title-bar">
        <img src="@images/favicon.ico" alt="网站logo">
        <span class="title">智能协同云图库</span>
      </div>
     </router-link>
    </a-col>
    <a-col flex="auto">
      <a-menu @click="doMenuClick" v-model:selectedKeys="current" mode="horizontal" :items="items" />
    </a-col>
    <a-col flex="100px">
      <div class="login-place">
       <div v-if="loginUserStore.loginUser.id">
       <a-dropdown>
    <a class="ant-dropdown-link" @click.prevent>
      <a-space>
        <a-avatar :size="40" :src="loginUserStore.loginUser.userAvatar"/>
          {{ loginUserStore.loginUser.userName ?? '无名'}}
       </a-space>
      <DownOutlined />
    </a>
    <template #overlay>
      <a-menu>
        <a-menu-item>
         <a-space>
          <LogoutOutlined /><a @click="doLoginOut">退出登录</a>
         </a-space>
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
import { h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { message, type MenuProps } from 'ant-design-vue'
import { useRouter } from "vue-router";
//引入登录状态
import { useLoginUserStore } from '@/stores/user';
import { userLogoutUsingPost } from '@/api/userController';
const loginUserStore = useLoginUserStore();
//远程获取登录状态
loginUserStore.getLoginUser();
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    label: '关于',
    title: '关于',
  },
  {
    key: '/others',
    label: h('a', { href: 'https://www.codefather.cn', target: '_blank' }, '编程导航'),
    title: '编程导航',
  },
])

const router = useRouter();
// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  });
};
//调整高亮的判断逻辑
const current = ref<string[]>([])
router.afterEach( to => {
  current.value = [to.path];
})
//退出登录
const doLoginOut = async() => {
  const res = await userLogoutUsingPost();
  if(res.data.code === 0){
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功');
    router.replace('/user/login');
  } else {
    message.error('退出登录失败,' + res.data.message);
  }
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