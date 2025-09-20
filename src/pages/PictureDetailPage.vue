<template>
  <div id="picture-detail-page">
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :md="16" :lg="16" :xl="16">
        <a-card title="图片预览">
          <!-- 高清图片预览实现渐进加载 -->
          <a-image style="height: 480px" :src="pictureData.url">
            <template v-if="pictureData.thumbnailUrl" #placeholder>
              <a-image :src="pictureData.thumbnailUrl" style="height: 480px" :preview="false" />
            </template>
            <template v-else #placeholder>
              <div
                style="
                  background-color: #f0f0f0;
                  height: 480px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                <a-spin />
              </div>
            </template>
          </a-image>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="8" :lg="8" :xl="8">
        <a-card title="详细信息">
          <a-descriptions :title="pictureData.name" :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="pictureData.user?.userAvatar" />
                <div style="color: dodgerblue">{{ pictureData.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              <div style="color: darkgrey">{{ pictureData.introduction ?? '暂无' }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              <a-tag color="green">{{ pictureData.category ?? '默认' }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <div v-if="pictureData.tags?.length !== 0">
                <a-tag v-for="tag in pictureData.tags ?? []" :key="tag">{{ tag }}</a-tag>
              </div>
              <div v-else>
                <a-tag>暂无</a-tag>
              </div>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ pictureData.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ pictureData.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ pictureData.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ pictureData.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(pictureData.picSize) }}
            </a-descriptions-item>
          </a-descriptions>
          <a-space size="middle">
            <a-button v-if="isShowEditDelete()" type="primary" ghost @click="doEdit">编辑</a-button>
            <a-popconfirm
              v-if="isShowEditDelete()"
              title="你是否要删除"
              ok-text="是"
              cancel-text="否"
              @confirm="doDelete"
              @cancel="cancel"
            >
              <a-button danger>删除</a-button>
            </a-popconfirm>
            <a-button type="primary" @click="doDownLoad"><DownloadOutlined />免费下载</a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { DownloadOutlined } from '@ant-design/icons-vue'
import { downloadFile, formatSize } from '@/utils'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/user'

const pictureData = ref<API.PictureVO>({})
const props = defineProps<{ id: string | number }>()
const router = useRouter()
/**
 * 获取图片详情
 */
const getPictureDetail = async () => {
  // 如果没有接收到id
  if (!props?.id) {
    // 回退到上一个页面
    router.back()
    return
  }
  // 远程请求图片信息
  const res = await getPictureVoByIdUsingGet({
    id: props.id,
  })
  // 如果请求成功，则进行赋值
  if (res.data.code === 0 && res.data.data) {
    // message.success('获取成功')
    const data = res.data.data
    pictureData.value = data
    // console.log(pictureData.value)
  } else {
    // message.error('获取失败')
    console.error(res.data.message)
  }
}
const userLogin = useLoginUserStore()
/**
 * 展示编辑和删除按钮的权限校验函数
 */
const isShowEditDelete = () => {
  // 如果用户未登录
  if (!userLogin.loginUser?.id) {
    return false
  }
  return (
    userLogin.loginUser?.id === pictureData.value.user?.id ||
    userLogin.loginUser?.userRole === 'admin'
  )
}
/**
 * 编辑图片
 */
const doEdit = () => {
  router.push({
    path: '/add_picture',
    query: {
      // 设置搜索参数为id
      id: props.id,
    },
  })
}
/**
 * 删除图片
 */
const doDelete = async () => {
  console.log('删除图片数据操作')
  const res = await deletePictureUsingPost({
    id: props.id,
  })
  if (res.data?.code === 0 && res.data?.data) {
    message.success('删除成功')
    router.push('/home')
  } else {
    message.error(res.data.message)
  }
}
/**
 * 下载图片
 */
const doDownLoad = async () => {
  // 调用utils文件夹中的工具函数downloadFile
  // 传入图片的url，名字可传可不传
  if (pictureData.value.url) {
    const downloadSuccess = await downloadFile(pictureData.value.url)
    if (downloadSuccess) {
      message.success('图片下载已开始，请检查浏览器下载文件夹')
    } else {
      message.error('下载失败，图片资源可能不可用')
    }
  } else {
    message.error('下载失败，图片地址无效')
  }
}
const cancel = () => {
  console.log('取消删除图片数据操作')
}
onMounted(() => {
  getPictureDetail()
})
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
}
#homePage .search-input {
  max-width: 480px;
  margin: 0 auto 16px;
}
#homePage .tags-show {
  margin-bottom: 16px;
}
</style>
