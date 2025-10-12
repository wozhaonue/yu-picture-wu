<template>
  <div id="user-register-page">
    <div class="form-container">
      <h2 class="register-title">智能协同云图库 - 用户注册</h2>
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
      <a-form-item
        name="checkPassword"
        :rules="[ {
      required: true,
      message: '该项必填',
      trigger: ['change', 'blur']
    }]"

      >
        <a-input-password v-model:value="formState.checkPassword"  placeholder="请输入确认密码" />
      </a-form-item>
      <div class="tip">已有账号？
        <router-link to="/user/login">立即登录</router-link>
      </div>
      <a-form-item>
        <a-button class="register-btn" type="primary" html-type="submit">注册</a-button>
      </a-form-item>
    </a-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { userRegisterUsingPost } from '@/api/userController';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
const formState = reactive<API.UserRegisterRequest>({
  checkPassword: '',
  userAccount: '',
  userPassword: '',
});
const router = useRouter();
//远程注册请求
const dologinRequest = async(values: API.UserRegisterRequest) => {
  //判断两次输入的密码是否一致
  if(values.userPassword !== values.checkPassword){
    message.error('两次输入的密码不一致');
    return;
    }
  //发送请求
  const res = await userRegisterUsingPost(values);
  if(res.data.code === 0 && res.data.data){
    message.success('注册成功');
    router.replace('/user/login');
  }else{
    message.error('注册失败，'+res.data.message);
  }
};
</script>
<style lang="scss" scoped>
@import '../../styles/variable.module.scss';
@import '../../styles/mixins.scss';

#user-register-page {
  margin: 0 auto;
  margin-top: $spacing-xxl;
  padding: $spacing-lg;
  max-width: 500px;

  .register-title {
    @include center-text($font-size-title, $spacing-sm);
    @include theme-text;
  }

  .desc {
    @include center-text($font-size-sm, $spacing-sm);
    color: $text-color-secondary;
  }

  .form-container {
    padding: $spacing-md;
    border-radius: $border-radius-base;
    transition: all 0.3s ease;
    @include theme-card;
  }

  .register-btn {
    width: 100%;
  }

  .tip {
    text-align: right;
    margin-bottom: $spacing-xs;
  }
}
</style>

