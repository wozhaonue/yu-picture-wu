<template>
  <div id="homePage">
    <div class="search-input">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <div class="categorys-show">
      <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>
    </div>
    <div class="tags-show">
      <span style="margin-right: 4px; font-weight: bold">标签：</span>
      <a-space wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagsList"
          :key="tag"
          v-model:checked="selectedTags[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片列表 -->
    <PictureList :data-list="dataList" :loading="loading"/>
    <!-- 自定义分页组件 -->
    <div class="custom-pagination">
      <a-pagination
        v-model:value="searchParams.current"
        :pageSize="searchParams.pageSize"
        :total="total"
        @change="changePage"
        :showSizeChanger="false"
      ></a-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import PictureList from '@/components/PictureList/PictureList.vue'
import { message } from 'ant-design-vue'
import {  onMounted, reactive, ref } from 'vue'

const dataList = ref<API.PictureVO[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(false)
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
})
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagsList = ref<string[]>([])
const selectedTags = ref<boolean[]>([])
// 获取标签和分类数据
const getTagsAndCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  // 如果请求成功，则赋值给两个选项数据
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = res.data.data.categoryList ?? []
    tagsList.value = res.data.data.tagList ?? []
  }
}
// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换数据
  const category = selectedCategory.value === 'all' ? '' : selectedCategory.value
  const params = {
    ...searchParams,
    category,
    tags: [] as string[],
  }
  // 遍历selectedTags，如果为true，则将对应的tagsList[index]添加到params.tags中
  selectedTags.value.forEach((useTags, index) => {
    if (useTags) {
      params.tags.push(tagsList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data && res.data.code === 0) {
    // message.success('获取数据成功')
    console.log('获取数据成功')
    dataList.value = res.data.data.records ?? []
    total.value = Number(res.data.data.total) ? Number(res.data.data.total) : 0
    // 数据加载完成
  } else {
    message.error('网络异常')
    console.error(res, '获取列表信息失败')
  }
  loading.value = false
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 已移除未生效的懒加载逻辑，页面功能保持不变
/**
 * 分页器的change事件的回调函数
 */
const changePage = (current: number, pageSize: number) => {
  searchParams.current = current
  searchParams.pageSize = pageSize
  fetchData()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
onMounted(() => {
  fetchData()
  getTagsAndCategoryOptions()
})
</script>

<style scoped>
#homePage .search-input {
  max-width: 480px;
  margin: 0 auto 16px;
}
#homePage .overlay-name {
  font-weight: bold;
}
#homePage .tags-show {
  margin: 0 auto 16px;
}
#homePage .tags-show span {
  font-size: 0.85rem;
}
#homePage .categorys-show {
  margin: 0 auto;
}

/* 纯css的新的图片列表的样式 */
/* 保持水平居中 */
#homePage .custom-picture-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}
/* 包裹加载状态的父容器将加载状态本身设置为flex
    并将其设置为水平和垂直居中 */
#homePage .loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}
/* text-align将文本设置为水平居中 */
#homePage .loading-spinner {
  font-size: 24px;
  text-align: center;
  color: #666;
}

/* 图片网格布局 */
/* grid-template-columns设置为每列的弹性宽度以及列数需要怎么增减 */
#homePage .picture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}
/* 关于移动端调整的响应式布局 */
@media (max-width: 768px) {
  #homePage .picture-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
@media (max-width: 480px) {
  #homePage .picture-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* 图片卡片 */
#homePage .picture-card {
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
#homePage .picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 图片封面区域 */
/* position为relative为了让悬浮遮罩能够据其进行定位 */
#homePage .picture-cover {
  position: relative;
  height: 240px;
  overflow: hidden;
  flex-shrink: 0;
}
/* object-cover让图片的展示更好 */
#homePage .picture-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* 悬停时图片变大为原本的1.05倍 */
#homePage .picture-card:hover .picture-cover img {
  transform: scale(1.05);
}

/* 悬浮遮罩 */
#homePage .picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 20px;
}

/* 悬停时通过不透明度调整到最大来让遮罩中的内容显示 */
#homePage .picture-card:hover .picture-overlay {
  opacity: 1;
}
#homePage .overlay-content {
  color: rgba(255, 255, 255, 0.8);
}
#homePage .picture-title {
  margin: 0;
  margin-bottom: 24px;
  font-size: 16px;
  font-weight: 600;
}
/* 标签样式 */
#homePage .picture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

#homePage .tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
  border: 1px solid #e0e0e0;
}

#homePage .category-tag {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}
#homePage .custom-pagination :deep(.ant-pagination){
  margin: 0 auto;
  width: 400px;
  text-align: center;
}
</style>
