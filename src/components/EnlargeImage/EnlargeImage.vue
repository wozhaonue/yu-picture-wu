<template>
  <a-modal
    class="ai-enlarge-space"
    title="AI扩图"
    :footer="false"
    v-model:visible="visible"
    @cancel="closeModal"
  >
    <a-row :gutter="16">
      <a-col :span="12">
        <h4>原始照片</h4>
        <img :src="imgUrl" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col :span="12">
        <h4>扩图照片</h4>
        <img
          v-if="resultImageUrl"
          :src="resultImageUrl"
          :alt="picture?.name"
          style="max-width: 100%"
        />
        <a-skeleton-image v-else style="max-width: 100%" />
      </a-col>
    </a-row>
    <br />
    <div class="img-cropper-button">
      <a-flex size="large" justify="center" :gap="16">
        <a-button type="primary" :loading="!!taskId" :icon="h(ToolOutlined)" @click="createTask"
          >生成图片</a-button
        >
        <a-button
          v-if="resultImageUrl"
          type="primary"
          :loading="loading"
          :icon="h(CloudDownloadOutlined)"
          @click="handleUpload"
          >应用结果</a-button
        >
      </a-flex>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { h, onUnmounted } from 'vue'
import { ref } from 'vue'
import { ToolOutlined, CloudDownloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController'
//编辑器组件的引用
const loading = ref(false)
const resultImageUrl = ref<string>()
// eslint-disable-next-line prefer-const
let taskId = ref<string>()
interface Props {
  imgUrl?: string // 改为可选属性，因为初始时可能为空
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
/**
 * url上传图片
 */
const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: resultImageUrl.value }
    if (props.picture) {
      params.id = props.picture.id
    }
    if (props.spaceId) {
      params.spaceId = props.spaceId
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0) {
      message.success('上传成功')
      // 将上传成功的图片数据传给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error('上传失败')
      console.error('图片上传失败', res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('网络异常')
  } finally {
    loading.value = false
  }
}

// 创建任务
const createTask = async () => {
  if (!props.imgUrl) {
    message.error('网络异常')
    console.error('ai扩图时没有原始图片url', props.imgUrl)
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    parameters: {
      xScale: 2,
      yScale: 2,
    },
    pictureId: props.picture?.id,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，请耐心等待图片生成，不要退出界面')
    const data = res.data.data
    taskId.value = data.output?.taskId
    // 开启轮询
    startPolling()
  } else {
    message.error('网络异常')
    console.error('接口调用失败:createPictureOutPaintingTaskUsingPost', res.data.message)
  }
}
// 轮询定时器
let pollingTimer: NodeJS.Timeout = null
//清除定时器
const clearPollTimer = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}
// 轮询请求函数
const startPolling = () => {
  if (!taskId.value) {
    return
  }
  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const data = res.data.data
        if (data.output?.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务成功')
          resultImageUrl.value = data.output.outputImageUrl
          clearPollTimer()
        } else if (data?.output?.taskStatus === 'FAILED') {
          message.error('扩图任务失败')
          clearPollTimer()
          console.error('扩图任务失败', res.data.message)
        }
      }
    } catch (error) {
      console.error('轮询任务失败', error)
      message.error('检测任务失败，请稍后重试')
      clearPollTimer()
    }
  }, 3000) // 每隔3秒轮询一次
}

// 清除定时器，避免内存泄露
onUnmounted(() => {
  clearPollTimer()
})
</script>

<style lang="scss" scoped>
@import '../../styles/variable.module.scss';
@import '../../styles/mixins.scss';
.ai-enlarge-space {
  @include center-text;
}
</style>
