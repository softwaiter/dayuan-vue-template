<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

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
    autoResize: {
      type: Boolean,
      default: true
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
      type: Function || String,
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
      this.chart.clear()
    },
    getTipElement() {
      let el = document.getElementById("line-chart-xaxis-label-tip-div");
      if (!el) {
        el = document.createElement("DIV");
        el.id = "line-chart-xaxis-label-tip-div"
        el.className = "line-chart-xaxis-label-tip";
        document.body.appendChild(el);
      }
      return el;
    },
    initChart() {
      this.chart = echarts.init(this.$el)
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

      this.setOptions()
    },
    setOptions() {
      const seriesData = []
      for (let i = 0; i < this.dataTypes.length; i++) {
        const item = this.dataTypes[i];
        const seriesItem = {
          name: item,
          itemStyle: {
            normal: {
              lineStyle: {
                width: 2
              }
            }
          },
          data: (this.data != null && i < this.data.length) ? this.data[i] : [],
          smooth: true,
          type: 'line',
          animationDuration: 3000,
          animationEasing: 'cubicInOut'
        }
        seriesData.push(seriesItem)
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
        grid: {
          left: this.gridLeft,
          right: this.gridRight,
          bottom: this.gridBottom,
          top: this.gridTop,
          containLabel: true,
          backgroundColor: this.gridBackColor,
          show: this.gridShow
        },
        tooltip: {
          show: this.showTooltip,
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'line' // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: this.tooltipFormatter
        },
        xAxis: {
          data: this.xLabels,
          boundaryGap: false,
          axisTick: {
            show: false
          },
          axisLabel: {
            margin: 13,
            rotate: this.xAxisLabelRotate,
            formatter: (value) => {
              if (value.length > this.xLabelMaxLen) {
                return value.substring(0, this.xLabelMaxLen - 1) + "..."
              }
              return value;
            }
          },
          triggerEvent: true
        },
        yAxis: {
          axisTick: {
            show: false
          },
          minInterval: 1
        },
        legend: {
          show: this.legendShow,
          orient: this.legendOrient,
          icon: this.legendIcon,
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
        series: seriesData
      })
    }
  }
}
</script>

<style>
.line-chart-xaxis-label-tip {
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
