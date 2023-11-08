<template>
  <div
    :class="className"
    :style="{height:height, width:width}"
  />
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

const animationDuration = 1000

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    title: {
      type: String,
      default: ''
    },
    titleShow: {
      type: Boolean,
      default: true
    },
    titleColor: {
      type: String,
      default: '#666'
    },
    gridShow: {
      type: Boolean,
      default: true
    },
    gridLeft: {
      type: Number,
      default: 0
    },
    gridRight: {
      type: Number,
      default: 0
    },
    gridTop: {
      type: Number,
      default: 35
    },
    gridBottom: {
      type: Number,
      default: 35
    },
    gridBackColor: {
      type: String,
      default: 'transparent'
    },
    dataTypes: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    xLabels: {
      type: Array,
      default: () => []
    },
    legendOrient: {
      type: String,
      default: 'vertical'
    },
    legendIcon: {
      type: String,
      default: ''
    },
    legendItemWidth: {
      type: Number,
      default: 10
    },
    legendAlignHorz: {
      type: String,
      default: 'right'
    },
    legendAlignVert: {
      type: String,
      default: 'center'
    },
    legendShowTooltip: {
      type: Boolean,
      default: true
    },
    legendShow: {
      type: Boolean,
      default: true
    },
    legendMaxLen: {
      type: Number,
      default: 4
    },
    xLabelMaxLen: {
      type: Number,
      default: 10
    },
    xAxisLabelRotate: {
      type: Number,
      default: 0
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.setOptions()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    clear() {
      if (this.chart) {
        this.chart.clear()
      }
    },
    getTipElement() {
      let el = document.getElementById("bar-chart-xaxis-label-tip-div");
      if (!el) {
        el = document.createElement("DIV");
        el.id = "bar-chart-xaxis-label-tip-div"
        el.className = "bar-chart-xaxis-label-tip";
        document.body.appendChild(el);
      }
      return el;
    },
    initChart() {
      this.chart = echarts.init(this.$el);
      this.chart.on('mouseover', 'xAxis', (params) => {
          if (params.value && params.value.length &&
            params.value.length > this.xLabelMaxLen) {
            const el = this.getTipElement();
            if (el) {
              el.innerText = params.value;
              el.style.display = 'block';
              el.style.left = (params.event.event.clientX - 15) + "px";
              el.style.top = (params.event.event.clientY - 40) + "px";
            }
          }
      });
      this.chart.on('mouseout', (params) => {
        const el = this.getTipElement();
        if (el) {
          el.innerText = "";
          el.style.display = "none";
        }
      });

      this.chart.on('legendSelectChanged', (params) => {
        this.$emit('legendSelectChanged', params);
      });

      this.setOptions();
    },
    setOptions() {
      const seriesData = [];
      for (let i = 0; i < this.dataTypes.length; i++) {
        const seriesItem = {
          name: this.dataTypes[i],
          type: 'bar',
          data: [],
          animationDuration
        }
        this.data.forEach(item => {
          if (item && item.length && i < item.length) {
            seriesItem.data.push(item[i]);
          } else {
            seriesItem.data.push(0);
          }
        });

        seriesData.push(seriesItem);
      }

      this.chart.setOption({
        title: {
          show: this.titleShow,
          text: this.title,
          x: 'center',
          textStyle: {
            color: this.titleColor
          }
        },
        tooltip: {
          show: this.showTooltip,
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: this.tooltipFormatter
        },
        grid: {
          top: this.gridTop,
          left: this.gridLeft,
          right: this.gridRight,
          bottom: this.gridBottom,
          containLabel: true,
          backgroundColor: this.gridBackColor,
          show: this.gridShow
        },
        legend: {
          orient: this.legendOrient,
          y: this.legendAlignVert,
          x: this.legendAlignHorz,
          itemGap: 20,
          data: this.dataTypes,
          itemWidth: this.legendItemWidth,
          align: 'left',
          padding: [0, 20, 0, 0],
          formatter: (value) => {
            if (value.length > this.legendMaxLen) {
              return value.substring(0, this.legendMaxLen - 1) + "..."
            }
            return value;
          },
          tooltip: {
            show: this.legendShowTooltip
          }
        },
        xAxis: [{
          type: 'category',
          data: this.xLabels,
          axisTick: {
            alignWithLabel: false
          },
          axisLabel: {
            margin: 20,
            padding: [0, 0, 0, -35],
            rotate: this.xAxisLabelRotate,
            formatter: (value) => {
              if (value.length > this.xLabelMaxLen) {
                return value.substring(0, this.xLabelMaxLen - 1) + "..."
              }
              return value;
            }
          },
          triggerEvent: true
        }],
        yAxis: [{
          type: 'value',
          axisTick: {
            show: true
          },
          minInterval: 1
        }],
        series: seriesData
      })
    }
  }
}
</script>

<style>
.bar-chart-xaxis-label-tip {
  display: none;
  position: absolute;
  padding: 5px 5px;
  font-size: 12px;
  line-height: 18px;
  color: #f1f1f1;
  background: #6f6f6f;
  border-radius: 4px;
}
</style>
