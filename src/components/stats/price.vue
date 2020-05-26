<template>
  <div class="card current-price">
    <v-progress-circular
      indeterminate
      class="progress-circle--center"
      color="primary"
      v-if="!pricePoint"
    ></v-progress-circular>
    <div v-else>
      <p>
        <small
          >Current price as at
          {{ pricePoint.createdAt | moment("HH:mm:ss") }}</small
        >
      </p>
      <p class="current-price__price">$ {{ pricePoint.value }}</p>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    pricePoint: {
      type: Object,
      default: null,
    },
  },
};
</script>

<style scoped>
.current-price__price {
  text-align: right;
  font-size: 20px;
  font-weight: bold;
}
</style>
