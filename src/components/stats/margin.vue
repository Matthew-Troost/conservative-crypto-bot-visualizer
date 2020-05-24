<template>
  <div class="card current-margin">
    <v-progress-circular
      indeterminate
      color="primary"
      v-if="!state || !latestPricePoint"
    ></v-progress-circular>
    <div v-else>
      <p>
        <small>Current margin</small>
      </p>
      <p
        :class="
          `right current-margin__margin ${percentage > 0 ? 'green' : 'red'}`
        "
      >
        {{ percentage }}%
      </p>
      <p class="right"><small>show money margin here</small></p>
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
  },
  computed: {
    percentage() {
      const dif =
        this.latestPricePoint.value - this.state.entryPricePoint.value;
      return ((dif / this.state.entryPricePoint.value) * 100).toFixed(3);
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
