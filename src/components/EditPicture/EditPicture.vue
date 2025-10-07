<template>
  <a-modal
    class="edit-space"
    title="编辑图片"
    :footer="false"
    v-model:visible="visible"
    @cancel="closeModal"
  >
    <vueCropper
      style="height: 400px"
      v-if="props.imgUrl"
      ref="cropper"
      :img="editImgUrl"
      :outputSize="1"
      outputType="png"
      :autoCrop="true"
      :fixedBox="false"
      :centerBox="true"
      :info="true"
    ></vueCropper>
    <br />
    <div v-if="isTeamSpace" class="image-edit-button">
      <a-space size="large">
        <a-button v-if="!canEdit" type="primary" disabled>正在编辑</a-button>
        <a-button @click="enterEdit" v-if="canEnterEdit" type="primary">进入编辑</a-button>
        <a-button @click="exitEdit" v-if="canExitEdit" type="primary">退出编辑</a-button>
      </a-space>
    </div>
    <br>
    <div class="img-cropper-button">
      <a-space size="large">
        <a-button
          :disabled="!canEdit"
          type="primary"
          ghost
          @click="rotateLeft"
          :icon="h(ArrowLeftOutlined)"
        ></a-button>
        <a-button
          :disabled="!canEdit"
          type="primary"
          ghost
          @click="rotateRight"
          :icon="h(ArrowRightOutlined)"
        ></a-button>
        <a-button
          :disabled="!canEdit"
          type="primary"
          ghost
          @click="changeScale(1)"
          :icon="h(ArrowsAltOutlined)"
        ></a-button>
        <a-button
          :disabled="!canEdit"
          type="primary"
          ghost
          @click="changeScale(-1)"
          :icon="h(ShrinkOutlined)"
        ></a-button>
        <a-button :disabled="!canEdit" type="primary" :loading="loading" @click="handleConfirm"
          >确认</a-button
        >
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, watchEffect } from 'vue'
import { ref } from 'vue'

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'
import { useLoginUserStore } from '@/stores/user'
import PictureEditWebSocket from '@/utils'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/picture'
import { SPACE_TYPE_ENUM } from '@/constants/teamSpace'
//编辑器组件的引用
const cropper = ref()
const loading = ref(false)
const editImgUrl = ref<string>('');
interface Props {
  imgUrl?: string // 改为可选属性，因为初始时可能为空
  picture?: API.PictureVO
  spaceId?: number
  space?: API.SpaceVO
  onSuccess: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()
const visible = ref(false)

//打开弹窗
const openModal = () => {
  visible.value = true
  // console.log(props.space);
  // console.log(isTeamSpace.value);
    if(props.imgUrl){
      editImgUrl.value = props.imgUrl
  }

}
//暴露打开弹窗的函数给父组件调用
defineExpose({
  openModal,
})

//向左旋转
const rotateLeft = () => {
  cropper.value.rotateLeft()
  editPicture(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}
// 向右旋转
const rotateRight = () => {
  cropper.value.rotateRight()
  editPicture(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)

}
// 放大缩小
const changeScale = (size: number) => {
  cropper.value.changeScale(size)
  if(size > 0){
    editPicture(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
    return
  }
  editPicture(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)

}
//确认裁剪
const handleConfirm = () => {
  cropper.value.getCropBlob((blob: Blob) => {
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    handleUpload({ file })
  })
}
/**
 * 上传图片
 * @param file
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    // 判断是否已经上传过图片本身来确定是否为更新图片
    const params = props.picture ? { id: props.picture.id } : {}
    if (props.spaceId) {
      params.spaceId = props.spaceId
    }
    // console.log(params); 测试id是否正确
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      message.success('上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    console.log(error)
    message.error('上传失败')
  } finally {
    loading.value = false
    closeModal()
  }
}

// 协同编辑操作
const userStore = useLoginUserStore()
const loginUser = computed(() => {
  return userStore.loginUser
})
const editUser = ref<API.UserVO | null>()
// 没有用户正在编辑中，可进入编辑
const canEnterEdit = computed(() => {
  return !editUser.value
})
// 正在编辑的是本人，可退出编辑
const canExitEdit = computed(() => {
  return editUser.value?.id === loginUser.value.id
})
// 可以编辑
const canEdit = computed(() => {
  if(!isTeamSpace.value){
    return true;
  }
  return editUser.value?.id === loginUser.value.id
})
// 是否为团队空间
const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})


// 初始化WebSocket
let websocket: PictureEditWebSocket | null
const initWebSocket = () => {
  const pictureId = props.picture?.id;
  if(!pictureId || !visible.value){
    return;
  }
  if(websocket){
    websocket.disconnect();
  }
  websocket = new PictureEditWebSocket(pictureId);
  websocket.connect();
  // 监听通知信息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO,(msg) => {
    message.info(msg.message);
    console.log('收到通知消息',msg);
  })
  // 监听错误信息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR,(msg) => {
    message.info(msg.message);
    console.log('收到错误消息',msg);
  })
  // 监听进入编辑状态信息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,(msg) => {
    message.info(msg.message);
    console.log('收到进入编辑状态信息',msg);
    editUser.value = msg.user;
  })
  // 监听各种编辑操作
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,(msg) => {
    console.log('收到编辑操作信息',msg);
    message.info(msg.message);
    switch(msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        changeScale(-1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        rotateRight()
        break
    }
  })
  // 监听退出编辑状态的信息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,(msg) => {
    message.info(msg.message)
    console.log('收到退出编辑状态信息',msg)
    editUser.value = null
  })
}

// 发送webSocket信息的函数
const enterEdit = () => {
  if(websocket){
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT
    })
  }
}
const exitEdit = () => {
  if(websocket){
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT
    })
  }
}
// 编辑图片操作
const editPicture = (action: string) => {
  if(websocket){
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}
watchEffect(() => {
  if(isTeamSpace.value){
    initWebSocket()
  }
})
onUnmounted(() => {
  if(websocket){
    websocket.disconnect()
  }
  editUser.value = null
})
// 关闭弹窗
const closeModal = () => {
  if(websocket){
    websocket.disconnect()
  }
  editUser.value = null
  visible.value = false
}
</script>

<style scoped>
.edit-space {
  text-align: center;
}
</style>
