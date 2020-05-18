<template>
  <div class="hello" ref="chartdiv"></div>
</template>
<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import axios from "axios";
import moment from "moment";

am4core.useTheme(am4themes_dark);
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
          query: `query events($minimumDate: String){
               events(minimumDate: $minimumDate, limit: 100){
                    createdAt
                    type
                    pricePoint{
                        value
                    }
                }
        }`,
          variables: {
            minimumDate: this.data.pricePoints[
              this.data.pricePoints.length - 1
            ].date.toString(),
          },
        }
      );

      return (this.data.events = response.data.data.events.map((event) => {
        return {
          date: new Date(event.createdAt),
          value: event.pricePoint.value,
          name: event.type,
        };
      })).reverse();
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
      series_pricepoints.tensionX = 0.77;

      let ranges = [];

      //create ranges
      this.data.events.forEach((event, index) => {
        if(event.name != "BOUGHT IN" && event.name != "SET RESERVE") return
        
        ranges[index] = dateAxis.createSeriesRange(series_pricepoints);
        ranges[index].contents.stroke = am4core.color(
          event.name == "BOUGHT IN" ? "#59EA38" : "#E738EA"
        );
        ranges[index].contents.fill = ranges[index].contents.stroke;
        ranges[index].date = event.date;

        if (index == this.data.events.length - 1)
          ranges[index].endDate =
            moment()
              .add(3, "hours")
              .toDate();
        else ranges[index].endDate = this.data.events[index + 1].date;
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
