<template>
  <div id="space-manage-page">
    <a-flex justify="space-between" style="margin-bottom: 16px;">
      <h2>空间管理</h2>
      <a-space>
        <a-button type="primary" ghost :href="`/user/spaceAnalysis?queryAll=true`" target="_blank">全部空间分析</a-button>
        <a-button type="primary" ghost :href="`/user/spaceAnalysis?queryPublic=true`" target="_blank">公共空间分析</a-button>
        <a-button type="primary" href="/add_space" target="_blank"><PlusOutlined />创建图片</a-button>
      </a-space>
    </a-flex>
    <a-form class="search-form" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="空间名称" name="spaceName">
        <a-input
          v-model:value="searchParams.spaceName"
          placeholder="请输入空间名称"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="用户ID" name="userId">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户"  allow-clear />
      </a-form-item>
       <a-form-item class="form-item-tags" label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="searchParams.spaceLevel"
          placeholder="请选择空间级别"
          allowClear
          :options="SPACE_LEVEL_OPTIONS"
        />
      </a-form-item>
      <a-form-item class="form-item-tags" label="空间类型 " name="spaceType">
        <a-select
          v-model:value="searchParams.spaceType"
          placeholder="请选择空间级别"
          allowClear
          :options="SPACE_TYPE_OPTIONS"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-table
      sticky
      size="large"
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
      bordered
      :scroll="{x: 'max-content', y: 600}"
    >
      >
      <template #bodyCell="{ column, record }">
  <!-- 空间级别 -->
  <template v-if="column.dataIndex === 'spaceLevel'">
    <a-tag color="blue">{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
  </template>
   <template v-if="column.dataIndex === 'spaceType'">
    <a-tag color="green">{{ SPACE_TYPE_MAP[record.spaceType] }}</a-tag>
  </template>
  <!-- 使用情况 -->
  <template v-if="column.dataIndex === 'spaceUseInfo'">
    <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
    <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
  </template>
  <template v-else-if="column.dataIndex === 'createTime'">
    {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
  </template>
  <template v-else-if="column.dataIndex === 'editTime'">
    {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
  </template>
  <template v-else-if="column.key === 'action'">
    <a-space wrap>
      <a-button type="link" :href="`/user/spaceAnalysis?spaceId=${record.id}`" target="_blank">
        分析
      </a-button>
      <a-button type="link" :href="`/add_space?id=${record.id}`" target="_blank">
        编辑
      </a-button>
      <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
    </a-space>
  </template>
</template>

    </a-table>
  </div>
</template>
<script lang="ts" setup>
import {PlusOutlined} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref } from 'vue'
import { formatSize } from '@/utils'
import { SPACE_LEVEL_MAP,SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController'
import { SPACE_TYPE_MAP, SPACE_TYPE_OPTIONS } from '@/constants/teamSpace'
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '空间类型',
    dataIndex: 'spaceType',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
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
    title: '操作',
    key: 'action',
  },
]



// 定义数据
const dataList = ref<API.Space[]>([])
const total = ref(0)
// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

// 获取数据
const fetchData = async () => {
  const res = await listSpaceByPageUsingPost({
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
// 删除空间数据操作
const doDelete = async (id: string) => {
  // 如果id不存在，直接停止删除操作
  if (!id) {
    return
  }
  const res = await deleteSpaceUsingPost({ id })

  if (res.data.code === 0) {
    message.success('删除图片成功')
    console.log('删除图片数据操作', id)
    fetchData() // 刷新数据
  } else {
    message.error(res.data.message ?? '删除用户失败')
    console.log('删除图片数据操作失败', id)
  }
}




onMounted(() => {
  fetchData()
})
</script>
<style scoped>
#space-manage-page {
  width: 90%;
  min-width: 360px;
  margin: 0 auto;
}
#space-manage-page .search-form {
  margin-bottom: 16px;
}
#space-manage-page .form-item-tags {
  min-width: 200px;
}
#space-manage-page .search-form .ant-form-inline .ant-form-item {
  margin-bottom: 16px; /* 根据需要调整此值 */
}
</style>
