<template>
  <div id="add-picture-batch-page">
    <h2 style="margin-bottom: 32px; text-align: left">
      批量创建图片
    </h2>
    <a-form
      layout="vertical"
      :model="formData"
      @finish="handleSubmit"
    >
      <a-form-item label="关键词" name="searchText">
        <a-input v-model:value="formData.searchText" placeholder="请输入关键词" />
      </a-form-item>
      <a-form-item label="抓取数量" name="count">
        <a-input-number v-model:value="formData.count" style="min-width: 180px; width: 100%;" :min="1" :max="30" allow-clear placeholder="请输入抓取数量"/>
      </a-form-item>
      <a-form-item label="名称前缀" name="namePrefix">
      <a-input v-model:value="formData.namePrefix" placeholder="请输入名称前缀，会自动补充序号" />
    </a-form-item>
     <a-form-item>
      <a-button type="primary" html-type="submit" style="width: 100%; margin-top: 16px;" :loading="loading">
        执行任务
      </a-button>
    </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { uploadPictureByBatchUsingPost } from '@/api/pictureController';
import router from '@/router';
import { message } from 'ant-design-vue';
import { onMounted, reactive, ref } from 'vue'


const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
})
const loading = ref<boolean>(false)



/**
 * 批量创建图片
 * @param value 图片表单信息
 */
const handleSubmit = async () => {
  // 首先判断是否存在picture。id，因为不存在，则代表是新建图片，无法修改
  loading.value = true;
  try{
    const res = await uploadPictureByBatchUsingPost({
      ...formData
    })
    if(res.data.code === 0 && res.data.data){
      message.success(`创建成功，共${res.data.data}条`);
      router.push({
        path: '/'
      })
    }else{
      message.error('创建失败');
      console.error('图片批量创建失败',res.data.message);
    }
  }catch(error){
    console.error("批量创建图片失败",error);
  }finally{
    loading.value = false;
  }
}

onMounted(() => {
})
</script>

<style scoped>
#add-picture-batch-page {
  max-width: 800px;
  margin: 0 auto;
}
#add-picture-batch-page .submit-button {
  width: 100%;
}
</style>
