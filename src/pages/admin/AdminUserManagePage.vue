<template>
  <div id="admin-user-page">
    <a-form class="search-form" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="请输入账号" allow-clear />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="请输入用户名" allow-clear />
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
      bordered>
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="50" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <a-tag v-if="record.userRole === 'admin'" color="blue">管理员</a-tag>
          <a-tag v-else color="green">普通用户</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action1'">
          <a-popconfirm
            title="你是否要删除"
            ok-text="是"
            cancel-text="否"
            @confirm="confirm(record.id)"
            @cancel="cancel"
          >
            <a-button type="link">删除</a-button>
          </a-popconfirm>

        </template>
        <template v-else-if="column.key === 'action2'">
          <a-button type="link">编辑</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { deleteUserUsingPost, listUserVoByPageUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref } from 'vue'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
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
const dataList = ref<API.UserVO[]>([])
const total = ref(0)
// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
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
  const res = await listUserVoByPageUsingPost({
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
const confirm = async ( id: number) => {
  // 如果id不存在，直接停止删除操作
  if(!id){
    return
  }
  const res = await deleteUserUsingPost({id});
  if(res.data.code === 0) {
    fetchData(); // 刷新数据
    message.success('删除用户成功');
    console.log("删除用户数据操作", id);
  }else{
    message.error(res.data.message ?? '删除用户失败');
    console.log("删除用户数据操作失败", id);
  }
};

const cancel = () => {
  console.log("取消删除用户数据操作");
};
onMounted(() => {
  fetchData()
})
</script>
<style>
#admin-user-page {
  width: 70%;
  min-width: 360px;
  margin: 0 auto;
}
#admin-user-page .search-form {
  margin-bottom: 16px;
}
</style>
