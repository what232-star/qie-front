<template>
  <div class="chart">
    <div
      :id="chartId"
      ref="chartRef"
      class="monitorContainer"
      :class="hasData ? 'show' : 'hidden'"
    />
    <empty-data-chart :is-empty="!hasData" />
  </div>
</template>
<script setup>
import * as echarts from 'echarts';
import { onMounted, ref, nextTick, computed } from 'vue';
import EmptyDataChart from '@/components/empty-data-chart/index.vue';

const props = defineProps({
  id: {
    type: String,
    default: 'amount-collect'
  },
  title: {
    type: String,
    default: '销售额趋势图'
  },
  chartOption: {
    type: Object,
    default: () => ({
      xAxisData: [],
      seriesData: [],
      yAxisName: ''
    }),
  },
});

const chartId = props.id;
const chartRef = ref(null);

const hasData = computed(() => {
  return props.chartOption && props.chartOption.xAxisData && props.chartOption.xAxisData.length > 0;
});

const axisStyleColor1 = ref('#D9D9D9');
const axisStyleColor2 = ref('#999999');
const lineStyleColor = ref('#FF5757');

const areaStyleColor = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  { offset: 0, color: 'rgba(255, 87, 87, 0.5)' },
  { offset: 0.3, color: 'rgba(255, 169, 169, 0.3)' },
  { offset: 1, color: 'rgba(255, 169, 169, 0)' },
]);

onMounted(() => {
  setOption();
});

const setOption = () => {
  nextTick(() => {
    setTimeout(() => {
      const chartDom = chartRef.value;
      if (!chartDom) {
        console.error('图表 DOM 未找到');
        return;
      }

      const myChart = echarts.init(chartDom);

      const option = {
        title: {
          text: props.title,
          left: 'center',
          top: '10',
          textStyle: {
            color: '#333333',
            fontWeight: 'bolder',
            fontSize: 14,
          },
        },
        grid: {
          left: '30',
          right: '33',
          top: '60',
          bottom: '5',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: props.chartOption.xAxisData || [],
          axisLine: {
            lineStyle: {
              color: axisStyleColor1.value,
            },
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: axisStyleColor1.value,
            },
          },
          axisLabel: {
            align: 'center',
            color: axisStyleColor2.value,
          },
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
          name: props.chartOption.yAxisName || '',
          nameTextStyle: {
            color: axisStyleColor2.value,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: axisStyleColor2.value,
          },
          splitLine: {
            lineStyle: {
              color: axisStyleColor1.value,
            },
          },
        },
        series: [{
          type: 'line',
          data: props.chartOption.seriesData || [],
          smooth: true,
          lineStyle: {
            color: lineStyleColor.value,
            width: 3,
            shadowColor: 'rgba(222, 115, 127, 0.23)',
            shadowBlur: 10,
            shadowOffsetY: 8,
          },
          areaStyle: {
            color: areaStyleColor,
          },
        }],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: axisStyleColor1.value,
              width: 2,
            },
          },
          formatter: '销售额：{c}<br />{b}',
          backgroundColor: '#FFFFFF',
          borderColor: '#eef3f8',
          borderWidth: 1,
          textStyle: {
            color: '#8C8C8C',
          },
          padding: 12,
        },
      };

      myChart.setOption(option);
    }, 100);
  });
};
</script>
<style lang="scss" scoped>
.chart {
  position: relative;
  display: inline-block;
  width: 50%;
  height: 100%;
}

.monitorContainer {
  width: 100%;
  height: 280px;

  & > div {
    &:first-child {
      width: 100% !important;

      & > canvas {
        width: 100% !important;
      }
    }
  }
}

.show {
  visibility: visible;
}

.hidden {
  visibility: hidden;
}
</style>
