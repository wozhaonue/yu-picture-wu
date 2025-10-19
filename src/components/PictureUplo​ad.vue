<template>
   <div id="picture-upload">
     <a-upload
    list-type="picture-card"
    :show-upload-list="false"
    :custom-request="handleUpload"
    :before-upload="beforeUpload"
  >
    <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
    <div v-else>
      <loading-outlined v-if="loading"></loading-outlined>
      <plus-outlined v-else></plus-outlined>
      <div class="ant-upload-text">点击或拖拽上传图片</div>
    </div>
  </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { UploadProps } from 'ant-design-vue';
import { uploadPictureUsingPost } from '@/api/pictureController';

const editPictureRef = ref();
interface Props {
  picture?: API.PictureVO,
  onSuccess?: (newPicture: API.PictureVO) => void,
  spaceId?: string,
}
const props = defineProps<Props>();

const loading = ref<boolean>(false);
/**
 * 上传图片
 * @param file
 */
const handleUpload = async ({file}:any) => {
  loading.value = true;
  try{
    // 判断是否已经上传过图片本身来确定是否为更新图片
    const params = props.picture ? {id: props.picture.id} : {};
    if(props.spaceId){
      params.spaceId = props.spaceId;
    }
    // console.log(params); 测试id是否正确
    const res = await uploadPictureUsingPost(params,{},file);
    if(res.data.code === 0 && res.data.data){
      message.success("上传成功");
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data);
    }else{
      message.error(res.data.message)};
  }catch(error){
    console.log(error);
    message.error("上传失败")
  }finally{
    loading.value = false;
  }
}
/**
 *上传前的校验
 * @param file
 */
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐使用jpg或png格式的图片');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过2MB');
  }
  return isJpgOrPng && isLt2M;
};


</script>
<style lang="scss" scoped>
@use '../styles/variable.module' as *;
@use '../styles/mixins' as *;
#picture-upload {
  :deep(.ant-upload) {
    width: 100% !important;
    height: 100% !important;
    min-height: 152px;
    min-width: 152px;
  }

  img {
    max-width: 100%;
    max-height: 360px;
  }
}

.ant-upload-select-picture-card {
  i {
    font-size: $font-size-xl;
    color: $text-color-secondary;
  }

  .ant-upload-text {
    margin-top: $spacing-xs;
    color: $text-color-secondary;
  }
}
</style>

