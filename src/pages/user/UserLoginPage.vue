<template>
  <div id="user-login-page">
    <h2 class="login-title">鱼皮智能协同云图库 - 用户登录</h2>
    <div class="desc">企业级项目</div>
    <a-form
    :model="formState"
    autocomplete="off"
    @finish="dologinRequest"
  >
    <a-form-item
      name="userAccount"
      :rules="[{required: true, message: '该项必填', trigger: ['change', 'blur']}]"

    >
      <a-input v-model:value="formState.userAccount"  placeholder="请输入账号" />
    </a-form-item>

    <a-form-item
      name="userPassword"
      :rules="[ {
    required: true,
    message: '该项必填',
    trigger: ['change', 'blur']
  },
  {
    min: 9,
    message: '至少需要 9 个字符',
    trigger: ['change', 'blur']
  },
  {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/,
    message: '必须包含大小写字母、数字和其他字符',
    trigger: ['change', 'blur']
  }]"

    >
      <a-input-password v-model:value="formState.userPassword"  placeholder="请输入密码" />
    </a-form-item>
    <div class="tip">没有账号？
      <router-link to="/user/register">立即注册</router-link>
    </div>
    <a-form-item>
      <a-button class="login-btn" type="primary" html-type="submit">登录</a-button>
    </a-form-item>
  </a-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { userLoginUsingPost } from '@/api/userController';
import { useLoginUserStore } from '@/stores/user';
import { message } from 'ant-design-vue';
import { useRouter,useRoute } from 'vue-router';
const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
});
const router = useRouter();
const route = useRoute();
//全局登录态
const userLogin = useLoginUserStore();
//远程登录请求
const dologinRequest = async(values: API.UserLoginRequest) => {
  const res = await userLoginUsingPost(values);
  if(res.data.code === 0 && res.data.data){
    await userLogin.getLoginUser();
    message.success('登录成功');
    // 判断路径中是否存在重定向的redirect参数
    const redirect = route.query.redirect as string;
    if(redirect){
      router.replace(redirect);
      return;
    }
    router.replace('/');
  }else{
    message.error('登录失败，'+res.data.message);
  }
};
</script>
<style scoped>
#user-login-page {
  margin: 0 auto;
  padding: 32px;
  max-width: 500px;
}
#user-login-page .login-title {
  text-align: center;
  font-size: 22px;
  margin-bottom: 22px;
}
#user-login-page .desc {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 22px;
}
#user-login-page .login-btn {
  width: 100%;
}
#user-login-page .tip {
  text-align: right;
  margin-bottom: 16px;
}
</style>

