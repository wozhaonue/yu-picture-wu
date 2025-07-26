<template>
  <div id="homePage">
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6 }"
      :data-source="dataList"
      :loading="loading"
      :pagination="pagination"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-card :title="item.name">{{ item.name }}</a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { listPictureVoByPageUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'

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
    showSizeChanger: true,
    showQuickJumper: true,
    onchange: (page: number, pageSize: number) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})
// 获取数据
const fetchData = async () => {
  const res = await listPictureVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data && res.data.code === 0) {
    message.success('获取数据成功')
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error(res.data.message ?? '获取数据失败')
    console.error('获取列表信息失败')
  }
}
onMounted(() => {
  fetchData()
})
</script>

<style scoped></style>
