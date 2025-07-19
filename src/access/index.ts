import router from "@/router";
import { useLoginUserStore } from "@/stores/user";
import ACCESS_ENUM from "./accessEnum";
import checkAccess from "./checkAccess";
import { message } from "ant-design-vue";
// 通过此变量来判断是否为第一次获取登录用户信息
let firstFetch = true;
router.beforeEach(async(to,from,next) => {
  const loginUserStore = useLoginUserStore();
  let loginUser = loginUserStore.loginUser;
  console.log("登录用户信息",loginUser);
  if(firstFetch){
    await loginUserStore.getLoginUser();
    loginUser = loginUserStore.loginUser;
    firstFetch = false;
  }
  const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;

  // 要跳转的页面必须登录
  if(needAccess !== ACCESS_ENUM.NOT_LOGIN){
    // 如果未登录，则跳转到登录页面，并利用重定向在登录后回到该页面
    if(loginUser.userName === '未登录') {
      message.error('请登录');
      next(`/user/login?redirect=${to.fullPath}`);
      console.log("重定向");
      return;
    }
    // 如果登录了，但权限不足
    if(!checkAccess(loginUser,needAccess)) {
      message.error('无权限');
      next('/noAuth');
      return;
    }
  }
  // 其他页面正常放行
  next();

})
