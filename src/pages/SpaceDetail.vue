<template>
  <div id="space-detail">
    <a-flex justify="space-between">
      <h2>
        {{ spaceData.spaceName }}
        {{ spaceData?.spaceLevel ? SPACE_LEVEL_MAP[spaceData?.spaceLevel] : SPACE_LEVEL_MAP[0]
        }}<a-tag size="big" color="green" >{{ SPACE_TYPE_MAP[spaceType] }}</a-tag>
      </h2>
      <a-space>
         <a-button
          v-if="canManagerSpaceUser && !isPrivateSpacce"
          type="primary"
          ghost
          :href="`/spaceUserManage/${id}`"
          target="_blank"
          >成员管理</a-button
        >
        <a-button
          type="primary"
          ghost
          :href="`/user/spaceAnalysis?spaceId=${id}&queryAll=${false}&queryPublic=${false}`"
          >空间分析</a-button
        >
        <a-button v-if="canUploadPicture" type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank"
          >+ 创建图片</a-button
        >
      </a-space>
    </a-flex>
    <br />
    <PictureSearchForm :onSearch="onSearch" />
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <colorPicker format="hex" @pureColorChange="onColorchange" />
    </a-form-item>
    <a-button v-if="canEditPicture" :icon="h(EditOutlined)" type="primary" @click="doBatchEdit">批量处理</a-button>
    <BatchEditPicture
      ref="batchEditPictureRef"
      :picture-list="dataList"
      :space-id="id"
      :onSuccess="fetchData"
    />
    <br />
    <PictureList :can-delete="canDeletePicture" :can-edit="canEditPicture" :data-list="dataList" :loading="loading" :showop="true" :onReload="fetchData" />
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
import { computed, h, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { EditOutlined } from '@ant-design/icons-vue'
import { SPACE_LEVEL_MAP } from '../constants/space'
import { useLoginUserStore } from '@/stores/user'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/teamSpace'
// 获取用户信息
const userStore = useLoginUserStore()
const userId = userStore.loginUser.id
const batchEditPictureRef = ref()
const spaceData = ref<API.SpaceVO>({})
const props = defineProps<{ id: string | number }>()
const router = useRouter()
const spaceType = computed(() => {
  return spaceData.value.spaceType ?? SPACE_TYPE_ENUM.PRIVATE;
})
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
  // 远程请求空间信息
  const res = await getSpaceVoByIdUsingGet({
    id: props.id,
  })
  // 如果请求成功，则进行赋值
  if (res.data.code === 0 && res.data.data) {
    // message.success('获取成功')
    const data = res.data.data
    // 判断当前用户是否为该私有空间的人
    if (userId === data.user?.id || data.spaceType === SPACE_TYPE_ENUM.TEAM) {
      spaceData.value = data
    } else {
      message.error('没有访问权限')
      router.push('/')
    }

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
    // 数据加载完成
  } else {
    message.error('服务器异常')
    console.error(res, '获取列表信息失败')
    router.push('/')
  }
  loading.value = false
}

// 已移除未生效的懒加载逻辑，页面功能保持不变
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
// 监听路由参数变化，当从一个空间详情页跳转到另一个空间详情页时重新加载数据
watch(() => props.id, (newSpaceId) => {
  if (newSpaceId) {
    getSpaceDetail();
    fetchData();
  }
}, { immediate: false })
// 通用权限检查函数
const creatPermissionCheck = (permission: string) => {
  return (spaceData.value.permissionList ?? []).includes(permission);
}
// 定义权限检查
const canManagerSpaceUser = computed(() => creatPermissionCheck(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE));
const canUploadPicture =  computed(() => creatPermissionCheck(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD));
const canEditPicture =  computed(() => creatPermissionCheck(SPACE_PERMISSION_ENUM.PICTURE_EDIT));
const canDeletePicture =  computed(() => creatPermissionCheck(SPACE_PERMISSION_ENUM.PICTURE_DELETE));
const isPrivateSpacce = computed(() => spaceData.value.spaceType === SPACE_TYPE_ENUM.PRIVATE  )
onMounted(() => {
  // 判断当前登录用户是否为对应的用户
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
