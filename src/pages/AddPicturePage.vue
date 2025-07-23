<template>
  <div id="add-picture-page">
    <h2 style="margin-bottom: 16px; text-align: center;">图片创建</h2>
    <PictureUpload :picture="picture" :onSuccess="onSuccess"/>
     <a-form
     layout="vertical"
    :model="pictureForm"
    autocomplete="off"
    @finish="handleSubmit"
  >
    <a-form-item
      label="图片名称"
      name="name"
    >
      <a-input v-model:value="pictureForm.name"  placeholder="请输入图片名称" />
    </a-form-item>

    <a-form-item
      label="简介"
      name="introduction">
      <a-textarea :autosize="{minRows: 2, maxRows: 6}" v-model:value="pictureForm.introduction"  placeholder="请输入简介" />
    </a-form-item>
    <a-form-item
    label="分类"
    name="category">
    <a-auto-complete v-model:value="pictureForm.category" placeholder="请输入分类"/>
    </a-form-item>
    <a-form-item
    label="标签"
    name="tags">
    <a-select mode="tags" v-model:value="pictureForm.tags" placeholder="请输入标签"/>
    </a-form-item>
    <a-form-item>
      <a-button class="submit-button" type="primary" html-type="submit">创建</a-button>
    </a-form-item>
  </a-form>
  </div>
</template>

<script setup lang="ts">
import { editPictureUsingPost } from '@/api/pictureController';
import PictureUpload from '@/components/PictureUplo​ad.vue';
import { message } from 'ant-design-vue';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const pictureForm = reactive<API.PictureEditRequest>({}as API.PictureEditRequest);
const picture = ref<API.PictureVO>();
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture;
  pictureForm.name = newPicture.name;
}

/**
 * 修改图片信息
 * @param value 图片表单信息
 */
const handleSubmit = async (value: API.PictureEditRequest) => {
  // 首先判断是否存在picture。id，因为不存在，则代表是新建图片，无法修改
  if(!picture.value){
    message.error('图片不存在，无法创建');
    return;
  }
  // 调用修改请求，然后赋值给表单model的数据
  const res = await editPictureUsingPost({
    id: picture.value.id,
    ...value,
  });
  if(res.data.code === 0 && res.data.data){
    message.success('创建成功');
    router.push('/picture/${picture.value.id}');
  }else{
    message.error('创建失败');
    console.error(res.data.message);
  }
}



</script>

<style scoped>
#add-picture-page {
  max-width: 600px;
  margin: 0 auto;
}
#add-picture-page .submit-button {
  width: 100%;
}
</style>
