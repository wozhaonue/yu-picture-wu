<template>
  <div class="space-using-rank">
    <a-card
      :bordered="false"
      title="空间使用情况排行"
      :headStyle="{ 'text-align': 'center', 'font-size': '1.2rem' }"
    >
      <template #extra>
        <a-input-search
          placeholder="输入查询的条数"
          enter-button="搜索排行"
          size="middle"
          @search="onSearch"
        />
      </template>
      <v-chart
        class="chart"
        :option="option"
        :theme="app.darkMode === 'dark' ? 'dark' : 'light'"
        autoresize
      />
    </a-card>
  </div>
</template>

<script setup lang="ts">
//echart内容
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { getSpaceRankAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref, watch } from 'vue'
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
const app = useAppStore()
const topNData = ref<number>(10)
interface Props {
  spaceId?: number
  queryAll?: boolean
  isAdmin: false,
  queryPublic?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  isAdmin: false,
  queryPublic: false,
})
const spaceAnalysisData = ref<API.Space[]>([])

/**
 * 获取空间详情
 */
const getSpaceDetail = async () => {
  // 如果没有接收到id
  if (!props?.spaceId && !props?.isAdmin) {
    // 回退到上一个页面
    message.error('获取空间详情失败')
    return
  }
  // 远程请求图片信息
  const res = await getSpaceRankAnalyzeUsingPost({
    topN: topNData.value,
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

const colors = ['#5070dd', '#b6d634', '#505372']
// 多系列柱状图配置
const option = computed(() =>{
  const spaceName = spaceAnalysisData.value.map((item) => item.spaceName);
  const usageData = spaceAnalysisData.value.map((item) => (item.totalSize / (1024* 1024)).toFixed(2))
  return {
  color: colors,
  // 工具提示
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
  },
  // X轴配置
  xAxis: {
    type: 'category',
    data: spaceName,
    axisTick: {
      alignWithLabel: true,
    },
  },
  // Y轴配置
  yAxis: [
    {
      type: 'value',
      name: '空间使用量(MB)',
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
        formatter: '{value}MB',
      },
    },
  ],

  // 系列数据
  series: [
    {
      name: '空间使用量(MB)',
      type: 'bar',
      data: usageData,
      itemStyle: {
        color: '#5470c6',
      },
    },
  ],
}
})
const onSearch = (value: number) => {
  if(isNaN(Number(value))){
    message.error('输入不为有效数字，请重新输入');
    return;
  }
  topNData.value = value;
}
watch(topNData, () => {
  getSpaceDetail()
}, { immediate: false })

onMounted(() => {
  getSpaceDetail()
})
</script>

<style lang="scss" scoped>
.space-using-rank {
  .chart {
    height: 320px;
    max-width: 100%;
  }
}
</style>
