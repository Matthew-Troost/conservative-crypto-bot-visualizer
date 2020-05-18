<template>
  <div class="hello" ref="chartdiv"></div>
</template>
<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import axios from "axios";

am4core.useTheme(am4themes_animated);

export default {
  data() {
    return {
      chart: null,
      data: {
        pricePoints: [],
        events: [],
      },
    };
  },
  async mounted() {
    await this.getPricePoints();
    await this.getEvents();
    this.buildChart();
  },
  methods: {
    async getPricePoints() {
      let response = await axios.post(
        "https://conserv-crypto-trading-bot-api.herokuapp.com/graphql",
        {
          query: `query {
            pricePoints(limit: 180) {
                createdAt
                value
            }
        }`,
        }
      );

      return (this.data.pricePoints = response.data.data.pricePoints.map(
        (point) => {
          return {
            date: new Date(point.createdAt),
            value: point.value,
            name: point.value.toString(),
          };
        }
      ));
    },
    async getEvents() {
      let response = await axios.post(
        "https://conserv-crypto-trading-bot-api.herokuapp.com/graphql",
        {
          query: `query {
               events{
                    createdAt
                    type
                    pricePoint{
                        value
                    }
                }
        }`,
        }
      );

      return (this.data.events = response.data.data.events.map((event) => {
        return {
          date: new Date(event.createdAt),
          value: event.pricePoint.value,
          name: event.type,
        };
      }));
    },
    buildChart() {
      let chart = am4core.create(this.$refs.chartdiv, am4charts.XYChart);

      chart.paddingRight = 20;

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
      series_pricepoints.dataFields.dateX = "date";
      series_pricepoints.dataFields.valueY = "value";
      series_pricepoints.data = this.data.pricePoints;
      series_pricepoints.tooltipText = "{valueY.value}";
      series_pricepoints.strokeWidth = 2;

      var range_tradingBelowReserve = dateAxis.createSeriesRange(
        series_pricepoints
      );
      range_tradingBelowReserve.date = new Date("2020-05-18 08:30:00");
      range_tradingBelowReserve.endDate = new Date("2020-05-18 09:30:00");
      range_tradingBelowReserve.contents.stroke = am4core.color("#59EA38");
      range_tradingBelowReserve.contents.fill =
        range_tradingBelowReserve.contents.stroke;

      var range_tradingAboveReserve = dateAxis.createSeriesRange(
        series_pricepoints
      );
      range_tradingAboveReserve.date = new Date("2020-05-18 09:45:00");
      range_tradingAboveReserve.endDate = new Date("2020-05-18 10:00:00");
      range_tradingAboveReserve.contents.stroke = am4core.color("#D23DFE");
      range_tradingAboveReserve.contents.fill =
        range_tradingAboveReserve.contents.stroke;

      //   let series_events = chart.series.push(new am4charts.LineSeries());
      //   series_events.dataFields.dateX = "date";
      //   series_events.dataFields.valueY = "value";
      //   series_events.data = this.data.events;
      //   series_events.tooltipText = "{valueY.value}";

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
