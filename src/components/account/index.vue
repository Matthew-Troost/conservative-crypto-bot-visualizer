<template>
  <div class="card">
    <v-progress-circular
      indeterminate
      class="progress-circle--center"
      color="primary"
      v-if="!value"
    ></v-progress-circular>
    <div v-else>
      <h3>{{ value.asset }}</h3>
      <p>
        Balance: <span class="f-right">{{ value.balance }}</span>
      </p>
      <p>
        Reserved: <span class="f-right">{{ value.reserved }}</span>
      </p>
      <p>
        Unconfirmed: <span class="f-right">{{ value.unconfirmed }}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: null,
    },
  },
};
</script>
