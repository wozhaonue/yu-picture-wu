<template>
  <div class="space-different-size">
     <v-chart class="chart" :option="option" :theme="app.darkMode === 'dark' ? 'dark' : 'light'" autoresize />
  </div>
</template>

<script setup lang="ts">
import { getSpaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController';
import { message } from 'ant-design-vue';
import { onMounted, ref, computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { useAppStore } from '@/stores/app';

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

const app = useAppStore();


//echart内容


interface Props {
  spaceId?: string
  queryAll?: boolean
  isAdmin?: boolean
  queryPublic?: boolean
}
const props = withDefaults(defineProps<Props>(),{
  queryAll: false,
  isAdmin: false,
  queryPublic: false,
});
const spaceAnalysisData = ref<API.SpaceSizeAnalyzeResponse[]>([]);

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
  const res = await getSpaceSizeAnalyzeUsingPost({
    spaceId: props.spaceId,
    queryAll: props.queryAll,
    queryPublic: props.queryPublic
  })
  // 如果请求成功，则进行赋值
  if (res.data.code === 0 && res.data.data) {
    // message.success('获取成功')
    const data = res.data.data ?? []
    spaceAnalysisData.value = data
    console.log(spaceAnalysisData.value)
  } else {
    // message.error('获取失败')
    console.error(res.data.message)
  }
}
const option = computed(() => {
  // 计算分类名称数组
  const dataName = spaceAnalysisData.value.map(item => item.sizeRange)
  
  // 计算数据列表
  const dataList = spaceAnalysisData.value.map(item => ({
    value: item.count,
    name: item.sizeRange,
  }))
  
  return {
    title: {
      text: '不同图片大小的数量占比',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: dataName,
    },
    series: [
      {
        name: '空间内存占用',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: dataList,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
});

onMounted(() => {
  getSpaceDetail();
})
</script>

<style lang="scss" scoped>
.space-different-size {
  .chart {
    height: 320px;
    max-width: 100%;
  }
}
</style>
