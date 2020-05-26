<template>
  <div class="card">
    <v-progress-circular
      indeterminate
      class="progress-circle--center"
      color="primary"
      v-if="!state"
    ></v-progress-circular>
    <div v-else>
      <p>
        <small>Current peak point above reserve</small>
      </p>
      <p class="right">{{ state.lastDownwardPricePoint.value }}</p>
      <p>
        <small>Downward count</small>
      </p>
      <p :class="[{ red: state.downwardCount > 1 }, 'right']">
        {{ state.downwardCount }}
      </p>
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
  },
};
</script>
