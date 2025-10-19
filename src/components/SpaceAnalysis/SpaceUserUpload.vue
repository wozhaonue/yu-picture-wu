<template>
  <div class="space-user-upload">
    <a-card
      :bordered="false"
      title="空间用户上传行为分析"
      :headStyle="{ 'text-align': 'center', 'font-size': '1.2rem' }"
    >
      <template #extra>
        <a-space>
          <a-input-search
            v-if="queryAll === true || queryPublic === true"
            placeholder="请输入用户id"
            enter-button="搜索用户"
            size="middle"
            @search="onSearch"
          />
          <a-segmented v-model:value="timeDimension" :options="timeOptions" size="middle" />
        </a-space>
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
import { getSpaceUserAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
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
import { useLoginUserStore } from '@/stores/user'
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
const timeOptions = [
  {
    label: '日',
    value: 'day',
  },
  {
    label: '周',
    value: 'week',
  },
  {
    label: '月',
    value: 'month',
  },
]
const userStore = useLoginUserStore()
const userData = computed(() => userStore.loginUser)
const userId = ref(userData.value.id)
interface Props {
  spaceId?: string
  queryAll?: boolean
  isAdmin?: boolean
  queryPublic?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  isAdmin: false,
  queryPublic: false,
})
const timeDimension = ref<string>('day')
const spaceAnalysisData = ref<API.SpaceUserAnalyzeResponse[]>([])
const dataName = computed(() => {
  return spaceAnalysisData.value.map((item) => {
    return item.period
  })
})
const dataCount = computed(() => {
  return spaceAnalysisData.value.map((item) => {
    return item.count
  })
})
/**
 * 获取空间详情
 */
const getSpaceDetail = async () => {
  // 如果没有接收到id
  if (!props?.spaceId  && !props?.isAdmin) {
    // 回退到上一个页面
    message.error('获取空间详情失败')
    return
  }
  // 远程请求图片信息
  const res = await getSpaceUserAnalyzeUsingPost({
    userId: userId.value,
    spaceId: props.spaceId,
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    timeDimension: timeDimension.value,
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
const onSearch = (value: string) => {
  userId.value = value;
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
  // X轴配置
  xAxis: {
    type: 'category',
    data: dataName.value,
  },
  // Y轴配置
  yAxis: {
    type: 'value',
  },
  // 系列数据
  series: [
    {
      name: '上传图片数量',
      type: 'line',
      data: dataCount.value,
      itemStyle: {
        color: '#5470c6',
      },
      smooth: true,
    },
  ],
}))
watch([timeDimension, userId], () => {
  getSpaceDetail()
}, { immediate: false })

onMounted(() => {
  getSpaceDetail()
})
</script>

<style lang="scss" scoped>
.space-user-upload {
  .chart {
    height: 320px;
    max-width: 100%;
  }
}
</style>
