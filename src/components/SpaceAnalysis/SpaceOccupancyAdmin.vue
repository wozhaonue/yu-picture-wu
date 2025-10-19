<template>
  <div class="space-occupancy-admin">
    <a-card :bordered="false" title="空间占用分析" :headStyle="{'text-align': 'center','font-size': '1.2rem'}">
      <v-chart class="chart" :option="option" :theme="app.darkMode === 'dark' ? 'dark' : 'light'" autoresize />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { getSpaceUsageAnalyzeUsingPost } from '@/api/spaceAnalyzeController';
import { message } from 'ant-design-vue';
//echart内容
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { computed, onMounted, ref } from 'vue'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useAppStore } from '@/stores/app'
// 注册必要的组件
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
])
// 主题配置
const app =useAppStore();
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
    queryPublic: props.queryPublic,
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
const colors = ['#5070dd', '#b6d634', '#505372']
// 多系列柱状图配置
const option = computed(() => {
  const dataCountList = computed(() => {
    return [spaceAnalysisData.value.usedCount || 0];
  })
  const calDataSizeList = computed(() => {
    const sizeInMB = (Number(spaceAnalysisData.value.usedSize || 0) / (1024 * 1024)).toFixed(2);
    return [Number(sizeInMB)];
  })
  return {
  color: colors,
  // 工具提示
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
  },
  // 图例
  legend: {
    data: ['图片数量', '总大小'],
    bottm: '12%',
    left: 'center',
  },
  // X轴配置
  xAxis: {
    type: 'category',
    data: props.queryAll === true ? ['全部空间'] : ['公共图库'],
    axisTick: {
      alignWithLabel: true,
    },
  },
  // Y轴配置
  yAxis: [
    {
      type: 'value',
      name: '图片数量',
      position: 'left',
      alignTicks: true,
      minInterval: 1,
      axisLine: {
        onZero: false,
        show: true,
        lineStyle: {
          color: colors[0],
        },
      },
      axisLabel: {
        formatter: '{value} 张',
      },
    },
    {
      type: 'value',
      name: '总大小',
      position: 'right',
      alignTicks: true,
      axisLine: {
        onZero: false,
        show: true,
        lineStyle: {
          color: colors[1],
        },
      },
      axisLabel: {
        formatter: '{value}MB',
      },
    },
  ],

  // 系列数据
  series: [
    {
      name: '图片数量',
      type: 'bar',
      data: dataCountList.value,
      itemStyle: {
        color: '#5470c6',
      },
    },
    {
      name: '总大小',
      type: 'bar',
      data: calDataSizeList.value,
      yAxisIndex: 1,
      itemStyle: {
        color: '#91cc75',
      },
    },
  ],
}
}
)
onMounted(() => {
  getSpaceDetail();
})
</script>

<style lang="scss" scoped>
.space-occupancy-admin {
  .chart {
    height: 320px;
  }
}
</style>
