<template>
  <div class="space-category">
    <a-card :bordered="false" title="空间图片标签分析" :headStyle="{'text-align': 'center','font-size': '1.2rem'}">
      <v-chart class="chart" :option="option" :theme="app.darkMode === 'dark' ? 'dark' : 'light'" autoresize />
    </a-card>
  </div>
</template>

<script setup lang="ts">
//echart内容
import 'echarts-wordcloud';
import 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {  getSpaceTagAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref } from 'vue'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useAppStore } from '@/stores/app';
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
const spaceAnalysisData = ref<API.SpaceTagAnalyzeResponse[]>([])

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
  const res = await getSpaceTagAnalyzeUsingPost({
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
    message.error(res.data.message)
    console.error(res.data.message)
  }
}

// 多系列柱状图配置
const option = computed(() => {
  // 计算标签数据
  const showTagData = spaceAnalysisData.value.map((item) => ({
    value: item.count,
    name: item.tag
  }))
  
  return {
    // 系列数据
    series: [
      {
          type: 'wordCloud',

          shape: 'circle',
          keepAspect: false,

          // maskImage: maskImage,

          left: 'center',
          top: 'center',
          width: '70%',
          height: '80%',
          right: null,
          bottom: null,


          sizeRange: [8, 50],


          rotationRange: [-30, 30],
          rotationStep: 45,


          gridSize: 20,

          drawOutOfBound: false,

          shrinkToFit: false,

          layoutAnimation: true,

          textStyle: {
              fontFamily: 'sans-serif',
              fontWeight: 'bold',
              color: function () {
                  return 'rgb(' + [
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160)
                  ].join(',') + ')';
              }
          },
          emphasis: {
              focus: 'self',
              textStyle: {
                  textShadowBlur: 5,
                  textShadowColor: '#82E1DB'
              }
          },

          data: showTagData

   } ],
  }
})
onMounted(() => {
  getSpaceDetail()
})
</script>

<style lang="scss" scoped>
.space-category {
  .chart {
    height: 320px;
    max-width: 100%;
  }
}
</style>
