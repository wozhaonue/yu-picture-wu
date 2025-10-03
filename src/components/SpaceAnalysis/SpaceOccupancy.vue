<template>
  <div class="space-occupancy">
    <a-flex gap="middle">
      <a-card :bordered="false" :headStyle="{'text-align': 'center'}" :bodyStyle="{'text-align': 'center'}" title="空间内存分析" style="width: 50%; height: 320px;">
        <div class="container">
          <h3>{{ `${formatSize(spaceAnalysisData.usedSize)}/${formatSize(spaceAnalysisData.maxSize)}` }}</h3>
       <a-tooltip
          placement="bottomRight"
          :title="`占用空间 ${formatSize(spaceAnalysisData.usedSize)}/${formatSize(spaceAnalysisData.maxSize)}`"
        >
          <a-progress
            type="circle"
            :percent="spaceAnalysisData.sizeUsageRatio"
          />
        </a-tooltip>
        </div>
      </a-card>
      <a-card :bordered="false" :headStyle="{'text-align': 'center'}" :bodyStyle="{'text-align': 'center'}" title="空间图片数量分析" style="width: 50%; height: 320px;">
        <div class="container">
          <h3>{{ `${spaceAnalysisData.usedCount}张/${spaceAnalysisData.maxCount}张` }}</h3>
       <a-tooltip
          placement="bottomRight"
          :title="`图片数量分析 ${spaceAnalysisData.usedCount}张/${spaceAnalysisData.maxCount}张`"
        >
          <a-progress
            type="circle"
            :percent="spaceAnalysisData.countUsageRatio"
          />
        </a-tooltip>
        </div>
      </a-card>
    </a-flex>
  </div>
</template>

<script setup lang="ts">
import { getSpaceUsageAnalyzeUsingPost } from '@/api/spaceAnalyzeController';
import { formatSize } from '@/utils';
import { message } from 'ant-design-vue';
import { onMounted, ref } from 'vue';

interface Props {
  spaceId?: number
  queryAll?: boolean
  isAdmin?: boolean
  queryPublic?: boolean
}
const props = withDefaults(defineProps<Props>(),{
  queryAll: false,
  isAdmin: false,
  queryPublic: false,
});
const spaceAnalysisData = ref<API.SpaceUsageAnalyzeResponse>({});

/**
 * 获取空间详情
 */
const getSpaceDetail = async () => {
  // 如果没有接收到id
  if (!props?.spaceId && !props?.isAdmin) {
    // 回退到上一个页面
    message.error('获取空间详情失败');
    return
  }
  // 远程请求图片信息
  const res = await getSpaceUsageAnalyzeUsingPost({
    spaceId: props.spaceId,
    queryAll: props.queryAll,
    queryPublic: props.queryPublic
  })
  // 如果请求成功，则进行赋值
  if (res.data.code === 0 && res.data.data) {
    // message.success('获取成功')
    const data = res.data.data
    spaceAnalysisData.value = data
    // console.log(pictureData.value)
  } else {
    // message.error('获取失败')
    console.error(res.data.message)
  }
}
onMounted(() => {
  getSpaceDetail();
})
</script>

<style scoped>
.space-occupancy .container {
  height: 320px;
}
</style>
