<template>
    <a-modal class="edit-space" title="编辑图片" :footer="false" v-model:visible="visible" @cancel="closeModal">
        <vueCropper
          style="height: 400px;"
          v-if="props.imgUrl"
          ref="cropper"
          :img="props?.imgUrl"
          :outputSize="1"
          outputType="png"
          :autoCrop="true"
          :fixedBox="false"
          :centerBox="true"
          :info="true"
        ></vueCropper>
      <br>
      <div class="img-cropper-button">
        <a-space size="large">
          <a-button type="primary" ghost @click="rotateLeft" :icon="h(ArrowLeftOutlined)"></a-button>
          <a-button type="primary" ghost @click="rotateRight" :icon="h(ArrowRightOutlined)"></a-button>
          <a-button type="primary" ghost @click="changeScale(1)" :icon="h(ArrowsAltOutlined)"></a-button>
          <a-button type="primary" ghost @click="changeScale(-1)" :icon="h(ShrinkOutlined)"></a-button>
          <a-button type="primary" :loading="loading" @click="handleConfirm">确认</a-button>
        </a-space>
      </div>
    </a-modal>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { ref } from 'vue'

import {ArrowLeftOutlined, ArrowRightOutlined, ShrinkOutlined,ArrowsAltOutlined} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { uploadPictureUsingPost } from '@/api/pictureController';
//编辑器组件的引用
const cropper = ref();
const loading = ref(false);
interface Props {
  imgUrl?: string  // 改为可选属性，因为初始时可能为空
  picture?: API.PictureVO
  spaceId?: number
  onSuccess: (newPicture: API.PictureVO) => void

}
const props = defineProps<Props>()
const visible = ref(false)

//打开弹窗
const openModal = () => {
  visible.value = true
}
//暴露打开弹窗的函数给父组件调用
defineExpose({
  openModal,
})
// 关闭弹窗
const closeModal = () => {
  visible.value = false
}
//向左旋转
const rotateLeft = () => {
  cropper.value.rotateLeft();
}
// 向右旋转
const rotateRight = () => {
  cropper.value.rotateRight();
}
// 放大缩小
const changeScale = (size: number) => {
  cropper.value.changeScale(size);
}
//确认裁剪
const handleConfirm = () => {
  cropper.value.getCropBlob((blob: Blob) => {
    const fileName = (props.picture?.name || 'image') + '.png';
    const file = new File([blob],fileName,{type:blob.type});
    handleUpload({file});
  })
}
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
    closeModal();
  }
}
</script>

<style scoped>
.edit-space {
  text-align: center;
}
</style>
