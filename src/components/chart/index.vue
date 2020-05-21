<template>
  <div class="hello" ref="chartdiv"></div>
</template>
<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import moment from "moment";

am4core.useTheme(am4themes_dark);
am4core.useTheme(am4themes_animated);

export default {
  props: {
    pricePoints: {
      type: Array,
      default: () => [],
    },
    events: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chart: null,
      data: {
        pricePoints: [],
        events: [],
      },
    };
  },
  computed: {
    dataReceived() {
      return this.pricePoints.length > 0 && this.events.length > 0;
    },
  },
  watch: {
    dataReceived(ready) {
      if (ready) {
        this.data.pricePoints = this.lodash.cloneDeep(this.pricePoints).reverse();
        this.data.events = this.lodash.cloneDeep(this.events).reverse();
        this.buildChart();
      }
    },
    pricePoints(value){
      if(this.chart) this.chart.addData(value[0], 1)
    }
  },
  methods: {
    buildChart() {
      let chart = am4core.create(this.$refs.chartdiv, am4charts.XYChart);

      chart.data = this.data.pricePoints;

      let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.baseInterval = {
        timeUnit: "minute",
        count: 1,
      };
      dateAxis.tooltipDateFormat = "HH:mm, d MMMM";
      dateAxis.renderer.grid.template.location = 0;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.baseValue = 0;

      let series_pricepoints = chart.series.push(new am4charts.LineSeries());
      series_pricepoints.dataFields.dateX = "createdAt";
      series_pricepoints.dataFields.valueY = "value";
      series_pricepoints.tooltipText = "{valueY.value}";
      series_pricepoints.strokeWidth = 2;
      series_pricepoints.stroke = am4core.color("grey");

      let ranges = [];

      //create ranges
      this.data.events.forEach((event, index) => {
        if (event.type != "BOUGHT IN" && event.type != "SET RESERVE") return;

        ranges[index] = dateAxis.createSeriesRange(series_pricepoints);
        ranges[index].contents.stroke = am4core.color(
          event.type == "BOUGHT IN" ? "#f4bb1a" : "#59EA38"
        );
        ranges[index].contents.fill = ranges[index].contents.stroke;
        ranges[index].date = event.createdAt;

        if (index == this.data.events.length - 1)
          ranges[index].endDate = moment()
            .add(3, "hours")
            .toDate();
        else ranges[index].endDate = this.data.events[index + 1].createdAt;
      });

      chart.cursor = new am4charts.XYCursor();

      let scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series_pricepoints);
      chart.scrollbarX = scrollbarX;

      this.chart = chart;
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  },
};
</script>
<style scoped>
.hello {
  width: 100%;
  height: 500px;
}
</style>
