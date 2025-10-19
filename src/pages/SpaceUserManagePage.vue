<template>
  <div id="spaceUserManage">
    <h2>成员管理</h2>
     <a-space direction="vertical">
       <a-input-search
        v-model:value="searchParams.userId"
        placeholder="请输入用户id"
        enter-button="添加用户"
        size="middle"
        @search="addSpaceUser"
      />
      <br>
     </a-space>
    <a-table
      :columns="columns"
      :data-source="dataList"
      @change="doTableChange"
      bordered
    >
      >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userInfo'">
          <a-space>
            <a-avatar :size="48" v-if="record.user?.userAvatar" :src="record?.user.userAvatar"/>
             <a-avatar v-else :size="48">
        <template #icon><UserOutlined /></template>
      </a-avatar>
            {{ record.user?.userName }}
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'spaceRole'">
         <a-select v-model:value="record.spaceRole" :options="SPACE_ROLE_OPTIONS" @change="(value) => editSpaceRole(value,record)"/>
        </template>
        <template v-if="column.dataIndex === 'spaceName'">
          {{ record.space.spaceName }}
        </template>
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.key === 'action'">
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
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { addSpaceUserUsingPost, deleteSpaceUserUsingPost, editSpaceUserUsingPost, listSpaceUserUsingPost } from '@/api/spaceUserController'
import { SPACE_ROLE_OPTIONS } from '@/constants/teamSpace'
import { useLoginUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { onMounted, reactive, ref, watch } from 'vue'
import { UserOutlined } from '@ant-design/icons-vue';
const props = defineProps<{ id: string | number }>()
const loginStore = useLoginUserStore()
const loginUser = loginStore.loginUser
const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]
// 定义数据
const originalDataList = ref<API.SpaceUserVO[]>([])
const dataList = ref<API.SpaceUserVO[]>([])
// 搜索条件
const searchParams = reactive<API.SpaceUserAddRequest>({})

// 获取数据
const fetchData = async () => {
  if(!props.id){
    return;
  }
  const res = await listSpaceUserUsingPost({
    spaceId: props.id,
  })
  if (res.data.data && res.data.code === 0) {
    message.success('获取数据成功')
    originalDataList.value = res.data?.data ?? [];
    dataList.value = originalDataList.value.length > 1 ? originalDataList.value.filter((spaceData) => {
      if(spaceData?.space){
        return true;
      }
      return false;
    }) : [];
    console.log(dataList.value);

  } else {
    message.error(res.data.message ?? '获取数据失败')
    console.error('获取列表信息失败')
  }
}
// 表格变化
const doTableChange = () => {
  fetchData() // 刷新数据
}
// 删除用户数据操作
const confirm = async (id: number) => {
  // 如果id不存在，直接停止删除操作
  if (!id) {
    return
  }
  // 如果删除的对象是自身，则拒绝删除 -- 需要在请求之前进行判断
  if (id === loginUser.id) {
    message.error('操作违法，无法删除自己')
    console.error('您不能删除自己')
    return
  }
  const res = await deleteSpaceUserUsingPost({ id })

  if (res.data.code === 0) {
    fetchData() // 刷新数据
    message.success('删除用户成功')
    console.log('删除用户数据操作', id)
  } else {
    message.error(res.data.message ?? '删除用户失败')
    console.log('删除用户数据操作失败', id)
  }
}

const cancel = () => {
  console.log('取消删除用户数据操作')
}
// 编辑用户
const editSpaceRole = async(value:string,record:API.SpaceUserVO) => {
  const res = await editSpaceUserUsingPost({
    id: record.id,
    spaceRole: value,
  })
  if(res.data.code === 0 && res.data.data){
    message.success('操作成功');
    fetchData();
  }else{
    message.error('操作失败');
    console.error('编辑空间用户角色失败',res.data.message);
  }
}
// 添加空间用户（默认为浏览者）
const addSpaceUser = async() => {
  if(!props.id){
    return;
  }
  const res = await addSpaceUserUsingPost({
    spaceId: props.id,
    ...searchParams,
  })
  if(res.data.code === 0 && res.data.data){
    message.success('操作成功');
    fetchData();
  }else{
    message.error('操作失败');
    console.error('添加空间用户失败',res.data.message);

  }
}

// 监听路由参数变化，当从一个空间用户管理页跳转到另一个空间用户管理页时重新加载数据
watch(() => props.id, (newSpaceId) => {
  if (newSpaceId) {
    fetchData();
  }
}, { immediate: false })

onMounted(() => {
  fetchData()
})
</script>
<style scoped>
#spaceUserManage {
  width: 70%;
  min-width: 360px;
  margin: 0 auto;
}
#spaceUserManage .search-form {
  margin-bottom: 16px;
}
#spaceUserManage .search-form .ant-form-inline .ant-form-item {
  margin-bottom: 16px; /* 根据需要调整此值 */
}
</style>
