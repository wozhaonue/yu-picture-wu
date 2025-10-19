<template>
  <div id="user-login-page">
    <div class="form-container">
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
  }]"

    >
      <a-input-password v-model:value="formState.userPassword" autoComplete="current-password"  placeholder="请输入密码" />
    </a-form-item>
    <div class="tip">没有账号？
      <router-link to="/user/register">立即注册</router-link>
    </div>
    <a-form-item>
      <a-button class="login-btn" type="primary" html-type="submit">登录</a-button>
    </a-form-item>
  </a-form>
  </div>
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
    console.log('登录成功');
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
<style lang="scss" scoped>
@use '../../styles/variable.module' as *;
@use '../../styles/mixins' as *;
#user-login-page {
  @include page-container(500px, $spacing-lg, 50px);

  .login-title {
    @include center-text($font-size-title, $spacing-sm);
    @include theme-text($text-color-light, $text-color-dark);
  }

  .desc {
    @include center-text($font-size-sm, $spacing-sm);
    color: $text-color-secondary;
  }

  .form-container {
    @include form-container($spacing-md, $border-radius-base);
  }

  .login-btn {
    @include full-width-button();
  }

  .tip {
    text-align: right;
    margin-bottom: $spacing-sm;
  }
}
</style>

