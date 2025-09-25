<template>
  <div id="add-space-page">
    <h2 style="margin-bottom: 32px; text-align: left">{{route.query.id ? '空间编辑':'空间创建'}}</h2>
    <!-- 提示用户空间的选择 -->
    <a-alert
      style="margin-bottom: 8px"
      message="系统提示"
      :description="description"
      type="warning"
      closable
      show-icon
    />
    <a-alert
      style="margin-bottom: 32px"
      message="空间级别介绍"
      type="warning"
      closable
      show-icon
    >
      <template #description>
        <div v-for="item in spaceLevelList" :key="item.value">
          {{ item.text }}：大小 {{formatSize(item.maxSize)}}， 数量 {{ item.maxCount }}
        </div>
      </template>
    </a-alert>
    <!-- 表单来提供创建空间的选项 -->
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="formData.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请选择空间级别"
        />
      </a-form-item>
      <a-form-item label="空间名字" name="spaceName">
        <a-input v-model:value="formData.spaceName" placeholder="请输入空间名字" />
      </a-form-item>
      <!-- <a-form-item label="空间类型" name="spaceType">
      <a-input v-model:value="formData.spaceType" placeholder="请输入空间类型" />
    </a-form-item> -->
      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          style="width: 100%; margin-top: 16px"
          :loading="loading"
        >
         {{route.query.id ? '空间编辑':'空间创建'}}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { addSpaceUsingPost, getSpaceVoByIdUsingGet, listSpaceLevelUsingGet, updateSpaceUsingPost } from '@/api/spaceController'
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import router from '@/router'
import { formatSize } from '@/utils'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

// 提示信息变量
const description = '* 目前仅支持开通普通版，如需升级空间，请联系weixin：lsm307';
const formData = reactive<API.SpaceAddRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})
const loading = ref<boolean>(false);
const spaceLevelList = ref<API.SpaceLevel[]>([]);

/**
 * 创建或编辑空间
 */
const handleSubmit = async () => {
  loading.value = true;
  let res;
  if(route.query?.id){
    const id = route.query.id;
    res = await updateSpaceUsingPost({
      id: id,
      ...formData,
    })

  }else{
  res = await addSpaceUsingPost({
    ...formData,
  })
}
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    // 创建或修改成功则跳转到对应的空间详情页
    router.push({
      path: `/space/${route.query?.id ?? res.data.data}`,
    })
  } else {
    message.error('操作失败')
    console.error('操作失败', res.data.message)
  }
  loading.value = false
}
// 请求空间级别列表
const fetchSpaceLevel = async () => {
  const res = await listSpaceLevelUsingGet();
  if(res.data.code === 0 && res.data.data){
    spaceLevelList.value = res.data.data;
    console.log(spaceLevelList.value);
  }else {
    console.error('请求空间级别列表',res.data.message);
  }
}
const route = useRoute();
/**
 * 获取空间信息 -- 如果url上有id
 */
const getOldSpaceInfo = async() => {
  if(route.query?.id){
    const id = route.query.id as string;
    const numberId = Number(id);
    console.log(numberId);
    if(isNaN(numberId)){
      message.error('服务器异常');
      console.error('编辑旧空间的id异常',numberId);
      return;
    } else {
      const res = await getSpaceVoByIdUsingGet({
        id: id,
      })
      if(res.data.code == 0 && res.data.data){
        formData.spaceLevel = res.data.data.spaceLevel;
        formData.spaceName = res.data.data.spaceName;
      } else{
        console.error('获取旧空间数据失败',res.data.message);

      }
    }
  }
}

onMounted(() => {
  fetchSpaceLevel();
  getOldSpaceInfo();
})
</script>

<style scoped>
#add-space-page {
  max-width: 800px;
  margin: 0 auto;
}
#add-space-page .submit-button {
  width: 100%;
}
</style>
