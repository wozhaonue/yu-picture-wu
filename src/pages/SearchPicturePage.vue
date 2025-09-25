<template>
  <div id="search-picture-page">
    <div class="head-background">
      <img
        v-if="oldPicture?.url"
        :src="oldPicture?.url"
        alt=""
        style="height: 200px; width: 200px; object-fit: cover"
      />
      <a-skeleton-image v-else />
    </div>
    <div class="search-picture-container">
      <a-alert
        v-if="dataList.length === 0 && loading === false"
        style="margin: 0 80px;"
        message="搜索异常"
        description="该功能异常，请通知维护者，受到通知我们将尽快恢复该功能"
        type="error"
        show-icon
      />
      <a-alert
        v-else
        style="margin: 0 80px;"
        class="search-tip"
        message="搜索成功"
        description="以下为与搜索图片相似的图片，点击即可复制图片url"
        type="info"
        show-icon
      >
        <template #icon><smile-outlined /></template>
      </a-alert>
      <h2 style="text-align: center"></h2>
      <div class="custom-picture-grid">
        <div v-if="loading" class="loading-contaienr">
          <div class="loading-spinner">加载中...</div>
        </div>
        <div v-else-if="loading === false && dataList.length !== 0" class="picture-grid">
          <div
            v-for="picture in dataList"
            :key="picture.id"
            @click="copyPictureUrl(picture)"
            class="picture-card"
          >
            <!-- 图片封面 -->
            <div class="picture-cover">
              <img :src="picture.thumbUrl" />
              <div class="picture-overlay"></div>
            </div>
          </div>
        </div>
        <div v-else class="empty-container">
          <a-empty></a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPictureVoByIdUsingGet, searchPictureByPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { SmileOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const loading = ref<boolean>(false)
const route = useRoute()
// 获取url路径上的id
const pictureId = computed(() => {
  return route.query?.pictureId
})
// 获取老图片数据
const oldPicture = ref<API.PictureVO>()
/**
 * 获取老图片信息
 */
const getOldPicture = async () => {
  if (pictureId.value) {
    // 获取id参数并转换为number类型，符合后端请求参数需求
    const numberid = Number(pictureId.value)
    console.log(numberid)

    // 如果不是有效数字，则进行返回
    if (isNaN(numberid)) {
      message.error('搜索异常')
      console.error('参数错误,该id不是有效数字')
      return
    } else {
      const res = await getPictureVoByIdUsingGet({
        id: pictureId.value,
      })
      // 如果请求成功，则进行赋值
      if (res.data.code === 0 && res.data.data) {
        message.success('获取成功')
        const data = res.data.data
        oldPicture.value = data
      } else {
        message.error('获取失败')
        console.error(res.data.message)
      }
    }
  } else {
    message.error('图片id异常')
    console.error('图片id异常,pictureId不存在')
  }
}
onMounted(() => {
  getOldPicture()
})
// 搜索相似并返回列表用封装的图片列表组件进行展示
const dataList = ref<API.ImageSearchResult[]>([])
const fetchData = async () => {
  loading.value = true
  const res = await searchPictureByPictureUsingPost({
    pictureId: pictureId.value,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('搜索失败')
    console.error('找相似api--searchPictureByPictureUsingPost出错', res.data.message)
  }
  loading.value = false
}

//点击图片复制缩略图url
const copyPictureUrl = async(picture: API.ImageSearchResult) => {
  const copyUrl = picture?.thumbUrl ?? '';
  if(copyUrl === ''){
    message.error('图片url复制失败')
    return
  }
  try{
    await navigator.clipboard.writeText(copyUrl)
    message.success('图片url复制成功');
  }catch(error){
    message.error('图片url复制失败')
    console.error('图片url复制失败',error);

  }
}
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#search-picture-page .search-picture-container {
  margin-top: 100px;
}
#search-picture-page .head-background {
  background-color: #4f4f4f;
  height: 160px;
  position: relative;
}
#search-picture-page .head-background img {
  position: absolute;
  bottom: -60px;
  left: 100px;
}
/* 纯css的新的图片列表的样式 */
/* 保持水平居中 */
#search-picture-page .custom-picture-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
/* 包裹加载状态的父容器将加载状态本身设置为flex
    并将其设置为水平和垂直居中 */
#search-picture-page .loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
/* text-align将文本设置为水平居中 */
#search-picture-page .loading-spinner {
  font-size: 24px;
  text-align: center;
  color: #666;
}
/* 图片网格布局 */
/* grid-template-columns设置为每列的弹性宽度以及列数需要怎么增减 */
#search-picture-page .picture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}
/* 关于移动端调整的响应式布局 */
@media (max-width: 768px) {
  #search-picture-page .picture-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
@media (max-width: 480px) {
  #search-picture-page .picture-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* 图片卡片 */
#search-picture-page .picture-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 240px;
  display: flex;
  flex-direction: column;
}
/* 鼠标悬停时使得卡片向上缓慢移动形成动销，并增加阴影来体现悬停后的聚焦效果 */
#search-picture-page .picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 图片封面区域 */
/* position为relative为了让悬浮遮罩能够据其进行定位 */
#search-picture-page .picture-cover {
  position: relative;
  height: 240px;
  overflow: hidden;
  flex-shrink: 0;
}
/* object-cover让图片的展示更好 */
#search-picture-page .picture-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* 悬停时图片变大为原本的1.05倍 */
#search-picture-page .picture-card:hover .picture-cover img {
  transform: scale(1.05);
}

/* 悬浮遮罩 */
#search-picture-page .picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  justify-content: end;
  flex-direction: column;
  padding: 20px;
}

/* 悬停时通过不透明度调整到最大来让遮罩中的内容显示 */
#search-picture-page .picture-card:hover .picture-overlay {
  opacity: 1;
}
#search-picture-page .overlay-content {
  color: rgba(255, 255, 255, 0.8);
}
#search-picture-page .showop-button {
  margin-top: 16px;
}
#search-picture-page .picture-title {
  margin: 0;
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 600;
}
</style>
