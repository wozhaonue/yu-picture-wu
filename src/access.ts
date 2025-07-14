import { message } from "ant-design-vue";
import router from "./router";
import { useLoginUserStore } from "./stores/user";
// 是否为第一次获取登录态
let isFirstGetLoginState = true;
// 路由守卫 每次切换页面都会进行权限校验
router.beforeEach(async(to, from, next) => {
  const loginUserStore = useLoginUserStore();
  let loginUser = loginUserStore.loginUser;
  // 确保页面刷新后，首次加载会进行获取登陆态赋值，后面则取消这个操作避免重复进行不必要的网络请求
  if (isFirstGetLoginState) {
    await loginUserStore.getLoginUser();
    loginUser = loginUserStore.loginUser;
    isFirstGetLoginState = false;
  }
  const toURl = to.fullPath;
  // 可以自己定义权限校验规则
  if(toURl.startsWith('/admin')){ //如果是admin页面，则需要登录以及管理员权限
    if(!loginUser || loginUser.userRole !== 'admin' ){
      message.error('没有权限访问该页面');
      next('/user/login');
      return;
  }
}
  if(toURl.startsWith('/user/profile')){ //如果是个人信息页面，则需要登录
    if(!loginUser.id){
      message.error('没有权限访问该页面');
      next('/user/login');
      return;
  }
}
// 其他页面则直接放行
next();
})
