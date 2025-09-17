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
    <div class="list-container">
      <a-list
        :grid="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
        :data-source="dataList"
        :loading="loading"
        :pagination="pagination"
        style="justify-content: c"
      >
        <template #renderItem="{ item: picture }">
          <div class="card-container" style="padding: 8px">
            <a-card
              size="default"
              hoverable
              style="width: 240px"
              :actions="getCardActions(picture.url)"
              @click="doClickPicture(picture)"
            >
              <template #cover>
                <img
                  :alt="picture.name"
                  :src="picture.url"
                  style="height: 180px; object-fit: cover"
                />
              </template>
              <a-card-meta :title="picture.name" style="height: 60px">
                <template #description>
                  <a-tag v-if="picture.category" color="green">{{ picture.category }}</a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">{{ tag }}</a-tag>
                </template>
              </a-card-meta>
            </a-card>
          </div>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DownloadOutlined,QuestionCircleOutlined,CopyOutlined } from '@ant-design/icons-vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { downloadFile } from '@/utils'
import { computed, onMounted, reactive, ref, h } from 'vue'
import { useRouter } from 'vue-router'
// import checkAccess from '../access/checkAccess';

const dataList = ref<API.PictureVO[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(false)

// 定义卡片操作按钮（动态生成，接收picture.url参数）
const getCardActions = (pictureUrl: string) => [
  h(DownloadOutlined, {
    key: 'downloadPicture',
    onClick: (e: Event) => handleCardAction(e, 'downloadPicture', pictureUrl)
  }),
  h(QuestionCircleOutlined, {
    key: 'pictureInfo',
  }),
  h(CopyOutlined, {
    key: 'copyPicture',
  }),
]

// 处理卡片操作按钮点击事件
const handleCardAction = async (e: Event, action: string, pictureUrl?: string) => {
  e.stopPropagation() // 阻止事件冒泡，避免触发卡片点击事件
  console.log(`点击了${action}按钮，图片URL: ${pictureUrl}`)
  // 这里可以根据不同的action执行不同的操作
  switch (action) {
    case 'downloadPicture':
      // 调用下载图片的方法，传入具体的图片URL
      if (pictureUrl) {
    const downloadSuccess = await downloadFile(pictureUrl)
    if (downloadSuccess) {
      message.success('图片下载已开始，请检查浏览器下载文件夹')
    } else {
      message.error('下载失败，图片资源可能不可用')
    }
  } else {
    message.error('下载失败，图片地址无效')
  }
      break
  }
}
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    onchange: (page: number, pageSize: number) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
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
  } else {
    message.error('网络异常')
    console.error(res, '获取列表信息失败')
  }
  loading.value = false
}
/**
 * 点击图片跳转到详情页
 * @param picture
 */
const router = useRouter()
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}
const doSearch = () => {
  searchParams.current = 1
  fetchData()
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
</style>
