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
    <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
      <a-tag-pane key="all" tab="全部" />
      <a-tag-pane v-for="category in categoryList" :key="category" :tab="category" />
    </a-tabs>
    <div class="tags-show">
      <span style="margin-right: 8px">标签：</span>
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
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }"
      :data-source="dataList"
      :loading="loading"
      :pagination="pagination"
    >
      <template #renderItem="{ item: picture }">
        <a-card hoverable style="width: 240px" @click="doClickPicture(picture)">
          <template #cover>
            <img :alt="picture.name" :src="picture.url" style="height: 180px; object-fit: cover" />
          </template>
          <a-card-meta :title="picture.name">
            <template #description>
              <a-tag color="green">{{ picture.category ?? '默认' }}</a-tag>
              <a-tag v-for="tag in picture.tags" :key="tag">{{ tag }}</a-tag>
            </template>
          </a-card-meta>
        </a-card>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const dataList = ref<API.PictureVO[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(false)
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
  const category = selectedCategory.value === 'all' ? '' : selectedCategory.value;
  const params = {
    ...searchParams,
    category,
    tags: [] as string[],
  }
  // 遍历selectedTags，如果为true，则将对应的tagsList[index]添加到params.tags中
  selectedTags.value.forEach((useTags,index) => {
    if (useTags) {
      params.tags.push(tagsList.value[index]);
    }
  })
  const res = await listPictureVoByPageUsingPost(params);
  if (res.data.data && res.data.code === 0) {
    message.success('获取数据成功')
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error(res.data.message ?? '获取数据失败')
    console.error('获取列表信息失败')
  }
  loading.value = false
}
/**
 * 点击图片跳转到详情页
 * @param picture
 */
const router = useRouter();
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
