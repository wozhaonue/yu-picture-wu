<template>
  <div id="admin-picture-page">
    <a-flex justify="space-between" style="margin-bottom: 16px;">
      <h2>图片管理</h2>
      <a-button type="primary" href="/add_picture" target="_blank"><PlusOutlined />创建图片</a-button>
    </a-flex>
    <a-form class="search-form" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介中搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-select v-model:value="searchParams.category" placeholder="请选择分类" :options="categoryList" allow-clear />
      </a-form-item>
      <a-form-item class="form-item-tags" label="标签" name="tags">
        <a-select
          mode="tags"
          v-model:value="searchParams.tags"
          placeholder="请输入标签"
          allowClear
          :options="tagsList"
        />
      </a-form-item>
      <!-- reviewStatus -->
       <a-form-item class="form-item-tags" label="审核状态" name="reviewStatus">
        <a-select
          v-model:value="searchParams.reviewStatus"
          placeholder="请选择审核状态"
          allowClear
          :options="PIC_REVIEW_STATUS_OPTIONS"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-table
      sticky
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
      bordered
      :scroll="{x: 'max-content', y: 600}"
    >
      >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="70" />
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <!-- 图片信息 -->
        <template v-else-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <template v-else-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：<a-tag>{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</a-tag></div>
          <div>审核信息：{{ record.reviewMessage ?? '-'}}</div>
          <div>审核人：{{ record.reviewerId ?? '-' }}</div>
        </template>
        <template v-if="column.dataIndex === 'category'">
          <a-tag color="green">{{ record.category }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag color="blue" v-for="tag in JSON.parse(record.tags) || []" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>
        <template v-else-if="column.key === 'operation'">
         <a-space>
          <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS" @click="handleReview(record,PIC_REVIEW_STATUS_ENUM.PASS)" type="link">通过</a-button>
          <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT" @click="handleReview(record,PIC_REVIEW_STATUS_ENUM.REJECT)" type="link" danger>拒绝</a-button>

           <a-popconfirm
            title="你是否要删除"
            ok-text="是"
            cancel-text="否"
            @confirm="confirm(record.id)"
            @cancel="cancel"
          >
            <a-button type="link" danger>删除</a-button>
          </a-popconfirm>
          <a-button @click="editPicture(record.id)" type="link">编辑</a-button>
         </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import {PlusOutlined} from '@ant-design/icons-vue'
import { deletePictureUsingPost, doPictureReviewUsingPost, listPictureByPageUsingPost, listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PIC_REVIEW_STATUS_ENUM, PIC_REVIEW_STATUS_MAP, PIC_REVIEW_STATUS_OPTIONS } from '@/constants/picture'
const router = useRouter()
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 100,
    fixed: 'left',
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 80,
    fixed: 'left',
  },
  {
    title: '名称',
    width: 100,
    dataIndex: 'name',
    fixed: 'left',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    width: 100,
    fixed: 'left',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 120,
    fixed: 'left',
  },
   {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    width: 150,
    fixed: 'left',
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 80,
  },
  {
    title: '标签',
    width: 200,
    dataIndex: 'tags',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 120,
  },
  {
    title: '创建时间',
    width: 100,
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    width: 100,
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    width: 100,
    key: 'operation',
    fixed: 'right'
  },
]
type options = {
  label: string;
  value: string;
}
const categoryList = ref<options[]>([]);
const tagsList = ref<options[]>([]);
// 获取标签和分类数据
const getTagsAndCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  // 如果请求成功，则赋值给两个选项数据
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = res.data.data.categoryList ? res.data.data.categoryList.map((item) => {
      return{
        label: item,
        value: item,
      }
    }) : []
    // tagsList
    tagsList.value = res.data.data.tagList ? res.data.data.tagList.map((item) => {
      return{
        label: item,
        value: item,
      }
    }) : []
  }
}
// 定义数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data && res.data.code === 0) {
    message.success('获取数据成功')

    dataList.value = res.data.data.records ?? []
    total.value = Number(res.data.data.total) ?? 0
  } else {
    message.error(res.data.message ?? '获取数据失败')
    console.error('获取列表信息失败')
  }
}
// 表格变化
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData() // 刷新数据
}
// 搜索条件变化
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}
// 删除用户数据操作
const confirm = async (id: string) => {
  // 如果id不存在，直接停止删除操作
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })

  if (res.data.code === 0) {
    message.success('删除图片成功')
    console.log('删除图片数据操作', id)
    fetchData() // 刷新数据
  } else {
    message.error(res.data.message ?? '删除用户失败')
    console.log('删除图片数据操作失败', id)
  }
}
// 编辑图片数据操作
const editPicture = (id: string) => {
  console.log('编辑图片数据操作', id)
  // 跳转到编辑页面
  router.push({ path: '/add_picture', query: { id: id } })
}
const cancel = () => {
  console.log('取消删除图片数据操作')
}
// 审核函数
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage = reviewStatus === 1 ? '管理员通过审核' : '管理员操作拒绝';
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewMessage,
    reviewStatus,
  })
  if(res.data.code === 0){
    message.success('审核操作成功');
    // 重新拉取表格数据
    fetchData();
  }else {
    message.error('审核操作失败');
    console.error('审核操作失败',res.data.message);
  }
}

onMounted(() => {
  fetchData()
  getTagsAndCategoryOptions()
})
</script>
<style scoped>
#admin-picture-page {
  width: 90%;
  min-width: 360px;
  margin: 0 auto;
}
#admin-picture-page .search-form {
  margin-bottom: 16px;
}
#admin-picture-page .form-item-tags {
  min-width: 200px;
}
#admin-picture-page .search-form .ant-form-inline .ant-form-item {
  margin-bottom: 16px; /* 根据需要调整此值 */
}
</style>
