<template>
  <div id="url-picture-upload">
    <a-input-group compact  style="width: 100%; margin: 16px 0;">
      <a-input v-model:value="firlUrl" style="width: 90%" placeholder="请输入想上传的图片url" />
      <a-button style="width: 10%;" type="primary" :loading="loading" @click="handleUpload">上传</a-button>
    </a-input-group>
    <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
  </div>
</template>

<script setup lang="ts">
import { uploadPictureByUrlUsingPost } from '@/api/pictureController';
import { message } from 'ant-design-vue';
import { ref } from 'vue';

const loading = ref<boolean>(false)
const firlUrl = ref<string>('')
interface Props {
  picture?: API.PictureVO
  spaceId?: string,
  onSuccess?: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()
const handleUpload = async() => {
  loading.value = true;
  try{
    const params: API.PictureUploadRequest = {fileUrl:firlUrl.value,}
    if(props.picture){
      params.id = props.picture.id;
    }
    if(props.spaceId){
      params.spaceId = props.spaceId;
    }
    const res = await uploadPictureByUrlUsingPost(params);
    if(res.data.code === 0){
      message.success('上传成功');
      // 将上传成功的图片数据传给父组件
      props.onSuccess?.(res.data.data);
    }else{
      message.error('上传失败');
      console.error("图片上传失败",res.data.message);

    }
  }catch(error){
    console.error('图片上传失败',error);
    message.error('网络异常');
  }finally{
  loading.value = false;
  }
}

</script>

<style scoped>
#url-picture-upload img {
  width: 100%;
  max-height: 360px;
  margin: 0 auto;
  object-fit: contain;
}
</style>
