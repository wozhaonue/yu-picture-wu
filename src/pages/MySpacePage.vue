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
import { SPACE_TYPE_ENUM } from '@/constants/teamSpace';

const LoginUserStore = useLoginUserStore();
//重定向函数 -- 判断用户是否存在个人空间等来决定跳转页面
const checkUserSpace = async() => {
  const loginuser = LoginUserStore.loginUser;
  // 如果用户未登录，则重定向到登录页
  if(!loginuser?.id){
    router.replace('/user/login');
    return;
  }
  // 获取用户空间信息
  const res = await listSpaceVoByPageUsingPost({
    userId: loginuser.id,
    current: 1,
    pageSize: 1,
    spaceType: SPACE_TYPE_ENUM.PRIVATE,
  })
  if(res.data.code === 0){
    console.log(res.data);
    const records = res.data.data?.records || [];
    // 如果存在空间，则跳转到空间详情页
    if(records.length > 0){
      const space = records[0];
      router.replace(`/space/${space.id}`);
    } else { // 否则跳转到创建空间页
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
