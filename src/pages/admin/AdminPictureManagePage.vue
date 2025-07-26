<template>
  <div id="admin-picture-page">
    <a-form class="search-form" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介中搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-input v-model:value="searchParams.category" placeholder="请输入分类" allow-clear />
      </a-form-item>
      <a-form-item class="form-item-tags" label="标签" name="tags">
        <a-select
          mode="tags"
          v-model:value="searchParams.tags"
          placeholder="请输入标签"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
      bordered
    >
      >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="50" />
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
        <template v-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in record.tags || []" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>
        <template v-else-if="column.key === 'action1'">
          <a-popconfirm
            title="你是否要删除"
            ok-text="是"
            cancel-text="否"
            @confirm="confirm(record.id)"
            @cancel="cancel"
          >
            <a-button type="link" danger>删除</a-button>
          </a-popconfirm>
        </template>
        <template v-else-if="column.key === 'action2'">
          <a-button @click="editPicture(record.id)" type="link">编辑</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { deletePictureUsingPost, listPictureVoByPageUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作1',
    key: 'action1',
  },
  {
    title: '操作2',
    key: 'action2',
  },
]

// 定义数据
const dataList = ref<API.PictureVO[]>([])
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

onMounted(() => {
  fetchData()
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
