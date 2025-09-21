import router from '../router/index';
<template>
  <!-- 作为中间页 -->
  <div id="my-space-page">
    <a-skeleton active />
    <a-skeleton active />
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { useLoginUserStore} from '../stores/user';
import { listSpaceVoByPageUsingPost } from '@/api/spaceController';
import { message } from 'ant-design-vue';
import { onMounted } from 'vue';

const LoginUserStore = useLoginUserStore();
//重定向函数 -- 判断用户是否存在个人空间等来决定跳转页面
const checkUserSpace = async() => {
  const loginuser = LoginUserStore.loginUser;
  if(!loginuser?.id){
    router.replace('/user/login');
    return;
  }
  // 获取用户空间信息
  const res = await listSpaceVoByPageUsingPost({
    userId: loginuser.id,
    current: 1,
    pageSize: 1,
  })
  if(res.data.code === 0){
    console.log(res.data);

    if(res.data.data?.records.length > 0){
      const space = res.data.data.records[0];
      router.replace(`/space/${space.id}`);
    } else {
      router.replace('/add_space');
      message.warn('请先创建空间');
    }
  }else {
    message.error('网络异常');
    console.error('加载用户空间列表异常',res.data.message);
    router.back();
  }
}
onMounted(() => {
  checkUserSpace();
})
</script>

<style scoped>
</style>
