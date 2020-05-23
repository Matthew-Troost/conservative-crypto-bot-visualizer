<template>
  <div class="card">
    <v-progress-circular
      indeterminate
      color="primary"
      v-if="pricePoints.length == 0"
    ></v-progress-circular>
    <div v-else>
      <p>
        <small>5-minute least squares regression analysis</small>
      </p>
      <p :class="`right ${trendSlope > 0 ? 'green' : 'red'}`">
        {{ trendSlope }}
      </p>
      <small
        v-for="index in 5"
        :key="`trend-price-${index}`"
        :class="
          pricePoints[5 - index].value > pricePoints[5 - index + 1].value
            ? 'green'
            : 'red'
        "
      >
        {{ pricePoints[5 - index].value }}
      </small>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    pricePoints: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    trendSlope() {
      if (this.pricePoints.length < 5) return "Awaiting more data...";

      let reversedPricePoints = this.lodash.cloneDeep(this.pricePoints);
      reversedPricePoints = this.lodash.take(reversedPricePoints, 5).reverse();

      const y_mean = this.lodash.meanBy(reversedPricePoints, "value");

      const x_subtract_mean = [-4, -3, -2, -1, 0];
      const y_subtract_mean = reversedPricePoints.map((point) => {
        return point.value - y_mean;
      });

      const multiples = [];
      y_subtract_mean.forEach((value, index) =>
        multiples.push(value * x_subtract_mean[index])
      );

      const squares = [];
      x_subtract_mean.forEach((value) =>
        squares.push(Math.sqrt(value < 0 ? value * -1 : value))
      );

      return (this.lodash.sum(multiples) / this.lodash.sum(squares)).toFixed(3);
    },
  },
};
</script>
