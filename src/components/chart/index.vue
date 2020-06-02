<template>
  <div class="chart" ref="chartdiv"></div>
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
    latestEntryPoint: {
      type: Object,
      default: null,
    },
    upperLine: {
      type: Number,
      default: 0,
    },
    lowerLine: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      chart: null,
      valueAxis: null,
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
        this.data.pricePoints = this.lodash
          .cloneDeep(this.pricePoints)
          .map((point) => {
            return {
              createdAt: point.createdAt,
              value: point.value,
              margin: (
                ((point.value - this.latestEntryPoint.value) /
                  this.latestEntryPoint.value) *
                100
              ).toFixed(3),
            };
          })
          .reverse();
        this.data.events = this.lodash.cloneDeep(this.events).reverse();
        this.buildChart();
      }
    },
    pricePoints(value) {
      if (this.chart)
        this.chart.addData(
          {
            createdAt: value[0].createdAt,
            value: value[0].value,
            margin: (
              ((value[0].value - this.latestEntryPoint.value) /
                this.latestEntryPoint.value) *
              100
            ).toFixed(3),
          },
          1
        );
    },
    upperLine() {
      this.addLimits();
    },
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

      this.valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      this.valueAxis.baseValue = 0;
      this.valueAxis.renderer.grid.template.disabled = true;

      let entryPointLine = this.valueAxis.axisRanges.create();
      entryPointLine.value = this.latestEntryPoint.value;
      entryPointLine.grid.stroke = am4core.color("#396478");
      entryPointLine.grid.strokeWidth = 2;
      entryPointLine.grid.strokeOpacity = 0.3;

      let series_pricepoints = chart.series.push(new am4charts.LineSeries());
      series_pricepoints.dataFields.dateX = "createdAt";
      series_pricepoints.dataFields.valueY = "value";
      series_pricepoints.strokeWidth = 2;
      series_pricepoints.stroke = am4core.color("grey");
      series_pricepoints.tooltipHTML = `<center><strong>{valueY.value}</strong></center>
                                          <hr />
                                          <table>
                                          <tr>
                                            <th align="left">Margin: </th>
                                            <td>{margin}</td>
                                          </tr>
                                          </table>`;

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

      this.chart = chart;
    },
    addLimits() {
      let marginLine = this.valueAxis.axisRanges.create();
      marginLine.value =
        this.latestEntryPoint.value * (this.upperLine / 100) +
        this.latestEntryPoint.value;
      marginLine.grid.stroke = am4core.color("#396478");
      marginLine.grid.strokeWidth = 1;
      marginLine.grid.strokeOpacity = 0.3;

      let exitLine = this.valueAxis.axisRanges.create();
      exitLine.value =
        this.latestEntryPoint.value -
        this.latestEntryPoint.value * ((this.lowerLine / 100) * -1);
      exitLine.grid.stroke = am4core.color("#396478");
      exitLine.grid.strokeWidth = 1;
      exitLine.grid.strokeOpacity = 0.3;
    },
    updateEvents() {
      this.chart.invalidateData();
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
.chart {
  width: 100%;
  height: 400px;
  padding-top: 1em;
}
</style>
