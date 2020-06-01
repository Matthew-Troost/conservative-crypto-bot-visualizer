<template>
  <div class="card current-margin">
    <v-progress-circular
      indeterminate
      class="progress-circle--center"
      color="primary"
      v-if="!state || !latestPricePoint"
    ></v-progress-circular>
    <div v-else>
      <p>
        <small>Current margin</small>
      </p>
      <p
        :class="
          `right current-margin__margin ${
            percentage == 0 ? '' : percentage > 0 ? 'green' : 'red'
          }`
        "
      >
        {{ percentage }}%
      </p>
      <v-progress-linear
        rounded
        :class="
          `v-progress-linear--custom__${
            percentage == 0 ? '' : percentage > 0 ? 'green' : 'red'
          }`
        "
        :value="progressBarPercentage"
      ></v-progress-linear>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    state: {
      type: Object,
      default: null,
    },
    latestPricePoint: {
      type: Object,
      default: null,
    },
    margins: {
      type: Object,
      default: () => {
        return {
          up: 1,
          down: 1,
        };
      },
    },
  },
  computed: {
    percentage() {
      const dif =
        this.latestPricePoint.value - this.state.entryPricePoint.value;
      return ((dif / this.state.entryPricePoint.value) * 100).toFixed(3);
    },
    progressBarPercentage() {
      return this.percentage == 0
        ? 0
        : this.percentage > 0
        ? (this.percentage / this.margins.up) * 100
        : ((this.percentage * -1) / this.margins.down) * 100;
    },
  },
};
</script>
<style scoped>
.current-margin__margin {
  font-size: 20px;
  font-weight: bold;
}
</style>
