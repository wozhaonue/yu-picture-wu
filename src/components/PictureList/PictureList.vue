<template>
  <div id="picture-list">
    <div class="custom-picture-grid">
      <div v-if="loading" class="loading-contaienr">
        <div class="loading-spinner">加载中...</div>
      </div>
      <div v-else-if="loading === false && dataList.length !== 0" class="picture-grid">
        <div
          v-for="picture in dataList"
          :key="picture.id"
          @click="doClickPicture(picture)"
          class="picture-card"
        >
          <!-- 图片封面 -->
          <div class="picture-cover">
            <img :src="picture.thumbnailUrl" />
            <div class="picture-overlay">
              <div class="overlay-content">
                <h3 class="picture-title">{{ picture.name }}</h3>
                <div class="picture-tags">
                  <span v-if="picture.category" class="tag category-tag">
                    {{ picture.category }}
                  </span>
                  <span v-for="tag in picture.tags" class="tag" :key="tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div v-if="showop" class="showop-button">
                <a-space>
                  <a-button size="small" shape="round" @click="(e:MouseEvent) => doEdit(picture, e)" ghost
                    >编辑</a-button
                  >
                  <a-button size="small" shape="round" @click="(e:MouseEvent) => doDelete( e)" ghost
                    >删除</a-button
                  >
                  <a-button size="small" shape="round" @click="(e:MouseEvent) => doSearchSimilar(picture, e)" ghost
                    >找相似</a-button
                  >
                  <a-button size="small" shape="round" @click="(e:MouseEvent) => doShare(picture, e)" ghost
                    >分享</a-button
                  >
                </a-space>
                <a-modal v-model:open="open" title="是否确认删除" @ok="handleOk(picture)">
                </a-modal>
              </div>
            </div>
          </div>
        </div>
        <ShareModal ref="shareModalRef" :link="shareLink"/>
      </div>
      <div v-else class="empty-container">
        <a-empty></a-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShareModal from '../ShareModal/ShareModal.vue'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showop?: boolean
  onReload?: () => void
}
const shareModalRef = ref()
const shareLink = ref<string>('')
const open = ref<boolean>(false)
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showop: false,
})
console.log(props.showop)

const router = useRouter()
// 跳转至图片详情页
const doClickPicture = (picture) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}
const doEdit = (picture, e: MouseEvent) => {
  e.stopPropagation()
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}
// 找相似按钮函数
const doSearchSimilar = (picture, e: MouseEvent) => {
  e.stopPropagation()
  window.open(`/search_picture?pictureId=${picture.id}`)
}
const doDelete = async ( e: MouseEvent) => {
  e.stopPropagation()
  open.value = true

}
// 分享按钮函数
const doShare = (picture, e: MouseEvent) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if(shareModalRef.value){
    shareModalRef.value.openModal()
  }
}
const handleOk = async(picture) => {
  const id = picture.id
  if (!id) {
    open.value = false;
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 让外层刷新
    props?.onReload()
  } else {
    message.error('删除失败')
    console.error('图片删除失败', res.data.message)
  }
  open.value = false;
}
</script>

<style scoped>
#picture-list .custom-picture-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
/* 包裹加载状态的父容器将加载状态本身设置为flex
    并将其设置为水平和垂直居中 */
#picture-list .loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
/* text-align将文本设置为水平居中 */
#picture-list .loading-spinner {
  font-size: 24px;
  text-align: center;
  color: #666;
}

/* 图片网格布局 */
/* grid-template-columns设置为每列的弹性宽度以及列数需要怎么增减 */
#picture-list .picture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}
/* 关于移动端调整的响应式布局 */
@media (max-width: 768px) {
  #picture-list .picture-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
@media (max-width: 480px) {
  #picture-list .picture-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* 图片卡片 */
#picture-list .picture-card {
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
#picture-list .picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 图片封面区域 */
/* position为relative为了让悬浮遮罩能够据其进行定位 */
#picture-list .picture-cover {
  position: relative;
  height: 240px;
  overflow: hidden;
  flex-shrink: 0;
}
/* object-cover让图片的展示更好 */
#picture-list .picture-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* 悬停时图片变大为原本的1.05倍 */
#picture-list .picture-card:hover .picture-cover img {
  transform: scale(1.05);
}

/* 悬浮遮罩 */
#picture-list .picture-overlay {
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
#picture-list .picture-card:hover .picture-overlay {
  opacity: 1;
}
#picture-list .overlay-content {
  color: rgba(255, 255, 255, 0.8);
}
#picture-list .showop-button {
  margin-top: 16px;
}
#picture-list .picture-title {
  margin: 0;
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 600;
}
/* 标签样式 */
#picture-list .picture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

#picture-list .tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
  border: 1px solid #e0e0e0;
}

#picture-list .category-tag {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}
</style>
