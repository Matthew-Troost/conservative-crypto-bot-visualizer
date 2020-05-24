<template>
  <div class="event-container">
    <vue-scroll>
      <div v-for="event in events" :key="event.id" class="card event">
        <b :class="event.type == 'SET RESERVE' ? 'light-green' : ''">{{
          event.type
        }}</b>
        <span class="event--right">{{ event.pricePoint.value }}</span>
        <div class="event__date">
          <small>{{ event.createdAt | moment("dddd, HH:mm") }}</small>
        </div>
      </div>
    </vue-scroll>
  </div>
</template>

<script>
export default {
  props: {
    events: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.event-container {
  height: 400px;
}

.event--right {
  float: right;
}

.event__date {
  background: #868686;
  color: black;
  padding: 0 1em;
  margin: 0.8em -1em -1em;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
