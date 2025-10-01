<template>
  <div class="space-category">
    <a-card :bordered="false" title="空间图片分类分析" :headStyle="{'text-align': 'center','font-size': '1.2rem'}">
      <v-chart class="chart" :option="option" :theme="isDark ? 'dark' : 'light'" autoresize />
    </a-card>
  </div>
</template>

<script setup lang="ts">
//echart内容
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { getSpaceCategoryAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { message } from 'ant-design-vue'
import { computed, onMounted, provide, ref, watchEffect } from 'vue'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import { MaxSize, whatSize } from '@/utils'

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
const isDark = ref(false)
provide(THEME_KEY, isDark.value ? 'dark' : 'light')
interface Props {
  spaceId?: number
  queryAll?: boolean
  queryPublic?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})
const spaceAnalysisData = ref<API.SpaceCategoryAnalyzeResponse[]>([])
const dataName = computed(() => {
  return spaceAnalysisData.value.map((item) => {
    return item.category
  })
})
const dataCountList = computed(() => {
  return spaceAnalysisData.value.map((item) => {
    return item.count
  })
})
const dataSizetList = computed(() => {
  return spaceAnalysisData.value.map((item) => {
    return item.totalSize
  })
})
const maxSizeuUit = computed(() => MaxSize(dataSizetList.value));
const calDataSizeList = computed(() => {
  return dataSizetList.value.map((item) => {
    return whatSize(item, maxSizeuUit.value);
  })
})

/**
 * 获取空间详情
 */
const getSpaceDetail = async () => {
  // 如果没有接收到id
  if (!props?.spaceId) {
    // 回退到上一个页面
    message.error('获取空间详情失败')
    return
  }
  // 远程请求图片信息
  const res = await getSpaceCategoryAnalyzeUsingPost({
    spaceId: props.spaceId,
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
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
const option = computed(() => ({
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
    data: dataName.value,
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
        formatter: function (value: string) {
          return value + ' ' + maxSizeuUit.value
        }
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
}))
watchEffect(() => {
  getSpaceDetail()
})
onMounted(() => {
  getSpaceDetail()
})
</script>

<style scoped>
.space-category .chart {
  height: 320px;
  max-width: 100%;
}
</style>
