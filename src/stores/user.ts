import {defineStore} from 'pinia'
import { ref } from 'vue'

export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser =  ref<any>({
    userNam: '未登录',
  })
  //getters 获取登录状态
  async function getLoginUser() {
    // return loginUser.value
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
});