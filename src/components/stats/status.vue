<template>
  <div class="card">
    <v-progress-circular
      indeterminate
      color="primary"
      v-if="!state"
    ></v-progress-circular>
    <div v-else>
      <p>
        <small>
          Status:
        </small>
        <span class="f-right"
          ><b>{{ state.status }}</b></span
        >
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
