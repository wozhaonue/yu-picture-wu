<template>
  <div class="space-different-size">
     <v-chart class="chart" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { getSpaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController';
import { message } from 'ant-design-vue';
import { onMounted, ref,provide, computed, watchEffect } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

provide(THEME_KEY, 'light');


//echart内容


interface Props {
  spaceId?: number
  queryAll?: boolean
  queryPublic?: boolean
}
const props = withDefaults(defineProps<Props>(),{
  queryAll: false,
  queryPublic: false,
});
const spaceAnalysisData = ref<API.SpaceSizeAnalyzeResponse[]>([]);
const dataName = computed(() => {
  return spaceAnalysisData.value.map(item => {
    return item.sizeRange;
  })
})
const dataList = computed(() => {
  return spaceAnalysisData.value.map(item => {
    return {
      value: item.count,
      name: item.sizeRange,
    }
  })
})

/**
 * 获取空间详情
 */
const getSpaceDetail = async () => {
  // 如果没有接收到id
  if (!props?.spaceId) {
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
const option = ref({
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
});
watchEffect(() => {
  getSpaceDetail();
})
onMounted(() => {
  getSpaceDetail();
})
</script>

<style scoped>
.space-different-size .chart {
  height: 320px;
  max-width: 100%;
}
</style>
