import { getLoginUserUsingGet } from '@/api/userController';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser =  ref<API.LoginUserVO>({
    userName: '未登录',
  })
  //getters 获取登录状态
  async function getLoginUser() {
    //远程请求获取登录状态
    const res = await getLoginUserUsingGet();
    if(res.data.code === 0 && res.data.data){
      loginUser.value = res.data.data;
    }
  }
  //setters 设置登录状态
  async function setLoginUser(user: any) {
    loginUser.value = user
  }
  return {
    loginUser,
    getLoginUser,
    setLoginUser
  }
},{persist: true});
