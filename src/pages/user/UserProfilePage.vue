<template>
  <div id="user-profile-page">
    <div class="container">
      <h1 style="margin-bottom: 24px; font-weight: bolder; color: #8FBC8F;">个人信息</h1>
      <p class="prompt">用户名</p>
      <p class="person-data">{{ personData.userName }}</p>
      <hr style="width: 35%;">
      <p class="prompt">个人简介</p>
      <p class="person-data">{{ personData.userProfile }}</p>
      <a-button @click="doEdit" shape="round" type="primary">编辑</a-button>
      <!-- <a-form layout="vertical" :model="personData">
        <a-form-item label="用户名">
          <a-input :bordered="false" disabled="true" v-model:value="personData.userName"></a-input>
        </a-form-item>
        <a-form-item label="个人简介">
          <a-input :bordered="false" disabled="true" v-model:value="personData.userProfile"></a-input>
        </a-form-item>
      </a-form> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import router from '@/router';
import { useLoginUserStore } from '@/stores/user';
import { message } from 'ant-design-vue';
import { onMounted, reactive } from 'vue';

const loginStore = useLoginUserStore();
const loginUser = loginStore.loginUser;
const personData = reactive<API.UserVO>({
  // userAvatar: "https://www.codefather.cn/logo.png",
  userName: "无名",
  userProfile: "暂无",
})
// 获取个人数据信息
const fetchData = () => {
  if(loginUser.id){ // 进入此条件证明登录态有效
    // 判断头像能够有效获取再赋值
    // personData.value.userAvatar = loginUser.userAvatar;
    personData.userName = loginUser.userName;
    personData.userProfile = loginUser.userProfile ?? '暂无';

  }else{
    message.error("无法获取个人信息");
    console.error("获取个人信息失败，无法获取到用户ID");
    router.back();
  }
}

// 编辑函数
const doEdit = () => {
  message.info('正在开发中');
}
onMounted(fetchData);

</script>
<style lang="scss" scoped>
@use '../../styles/variable.module' as *;
@use '../../styles/mixins' as *;
#user-profile-page {
  height: 80vh;
  @include flex-center();
  
  html[data-dark='light'] & {
    background: radial-gradient(circle, #e0e0e0 0%, $bg-color-light 50%);
  }
  html[data-dark='dark'] & {
    background: radial-gradient(circle, #000000 0%, #181c20 50%);
  }

  .container {
    padding: $spacing-xl;
    border-radius: $spacing-md;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    width: 100%;
    max-width: 650px;
    text-align: center;
    z-index: 10;

    .prompt {
      font-size: $font-size-lg;
      font-weight: bold;
      @include theme-text(#666, $text-color-dark);
    }

    .person-data {
      font-size: $font-size-base;
      @include theme-text($text-color-light, $text-color-dark);
    }
  }
}
</style>

