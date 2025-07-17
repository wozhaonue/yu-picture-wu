<template>
  <div id="user-profile-page">
    <div class="container">
      <h1 style="margin-bottom: 24px;">个人信息</h1>
      <a-form layout="vertical" :model="personData">
        <a-form-item label="用户名">
          <a-input :bordered="false" disabled="true" v-model:value="personData.userName"></a-input>
        </a-form-item>
        <a-form-item label="个人简介">
          <a-input :bordered="false" disabled="true" v-model:value="personData.userProfile"></a-input>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
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
  }
}

onMounted(fetchData);

</script>
<style scoped>
#user-profile-page{
  display: flex;
  justify-content: center;
}
#user-profile-page .container{
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 650px;
  margin: 20px 0; /* 上下留白，左右自动 */
  text-align: center;
}
</style>

