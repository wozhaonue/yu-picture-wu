<template>
  <div id="space-detail">
    <a-flex justify="space-between">
      <h2>{{ spaceData.spaceName }} {{ spaceData?.spaceLevel ? SPACE_LEVEL_MAP[spaceData?.spaceLevel] : SPACE_LEVEL_MAP[0] }}<span style="color: #263b81"> 私有空间</span></h2>
      <a-space>
        <a-button type="primary" ghost :href="`/user/spaceAnalysis?spaceId=${id}&queryAll=${false}&queryPublic=${false}`">空间分析</a-button>
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank"
        >+ 创建图片</a-button
      >
      </a-space>
    </a-flex>
    <br />
    <PictureSearchForm :onSearch="onSearch" />
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <colorPicker format="hex" @pureColorChange="onColorchange" />
    </a-form-item>
    <a-button :icon="h(EditOutlined)" type="primary" @click="doBatchEdit">批量处理</a-button>
    <BatchEditPicture
      ref="batchEditPictureRef"
      :picture-list="dataList"
      :space-id="id"
      :onSuccess="fetchData"
    />
    <br />
    <PictureList :data-list="dataList" :loading="loading" :showop="true" :onReload="fetchData" />
    <!-- 自定义分页组件 -->
    <div class="custom-pagination">
      <a-pagination
        v-model:value="searchParams.current"
        :pageSize="searchParams.pageSize"
        :total="total"
        @change="changePage"
      ></a-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import BatchEditPicture from '@/components/BatchEditPicture/BatchEditPicture.vue'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import PictureList from '@/components/PictureList/PictureList.vue'
import { message } from 'ant-design-vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import { h, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { SPACE_LEVEL_MAP } from '../constants/space';
const batchEditPictureRef = ref()
const spaceData = ref<API.SpaceVO>({})
const props = defineProps<{ id: string | number }>()
const router = useRouter()
/**
 * 获取空间详情
 */
const getSpaceDetail = async () => {
  // 如果没有接收到id
  if (!props?.id) {
    // 回退到上一个页面
    router.back()
    return
  }
  // 远程请求图片信息
  const res = await getSpaceVoByIdUsingGet({
    id: props.id,
  })
  // 如果请求成功，则进行赋值
  if (res.data.code === 0 && res.data.data) {
    // message.success('获取成功')
    const data = res.data.data
    spaceData.value = data
    // console.log(pictureData.value)
  } else {
    // message.error('获取失败')
    console.error(res.data.message)
  }
}
onMounted(() => {
  getSpaceDetail()
})

const dataList = ref<API.PictureVO[]>([])
const total = ref<number>(0)
const loading = ref<boolean>(false)
// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换数据
  const params = {
    spaceId: props.id,
    ...searchParams.value,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data && res.data.code === 0) {
    // message.success('获取数据成功')
    console.log('获取数据成功')
    dataList.value = res.data.data.records ?? []
    total.value = Number(res.data.data.total) ? Number(res.data.data.total) : 0
    // 数据加载完成后，等待DOM更新再执行懒加载 确保懒加载时可以获取到懒加载的image的dom元素
    nextTick(() => {
      lazyLoading()
    })
  } else {
    message.error('网络异常')
    console.error(res, '获取列表信息失败')
  }
  loading.value = false
}

// 懒加载图片数据 通过提前存储url，之后再赋值给url属性来实现
const lazyLoading = () => {
  const lazyImageList = document.querySelectorAll('.lazy-image')
  console.log('找到懒加载图片数量:', lazyImageList.length)

  // 让图片提前50%开始加载
  const option = { rootMargin: '0px 0px 30% 0px' }

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.getAttribute('data-src')
          // console.log('开始加载图片:', src)
          if (src) {
            img.src = src
            img.onload = () => {
              // console.log('图片加载完成:', src)
            }
            img.onerror = () => {
              console.error('图片加载失败:', src)
            }
            observer.unobserve(img)
          }
        }
      })
    }, option)

    lazyImageList.forEach((lazyImage) => {
      imageObserver.observe(lazyImage)
    })
  } else {
    console.log('IntersectionObserver 不被支持，无法实现懒加载。')
  }
}
/**
 * 分页器的change事件的回调函数
 */
const changePage = (current: number, pageSize: number) => {
  searchParams.value.current = current
  searchParams.value.pageSize = pageSize
  fetchData()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
/**
 * 搜索函数
 */
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}
/**
 * 按颜色搜索
 */
const onColorchange = async (color: string) => {
  loading.value = true
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
    total.value = res.data.data.length
  } else {
    message.error('搜索失败')
    console.error('搜索失败', res.data.message)
  }
  loading.value = false
}

// 批量处理
const doBatchEdit = () => {
  if (batchEditPictureRef.value) {
    batchEditPictureRef.value.openModal()
  }
}
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#space-detail {
  padding: 16px;
}
#space-detail .custom-pagination :deep(.ant-pagination) {
  margin: 0 auto;
  width: 400px;
  text-align: center;
}
</style>
