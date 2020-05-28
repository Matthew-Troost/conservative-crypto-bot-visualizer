<template>
  <div class="card">
    <p class="center time"><b>{{ current }}</b></p>
  </div>
</template>
<script>
export default {
  data() {
    return {
      current: "",
    };
  },
  created() {
    setInterval(() => {
      this.tick();
    }, 1000);
  },
  methods: {
    tick() {
      this.current = this.$moment().format("HH:mm:ss");
    },
  },
};
</script>
<style scoped>
.time{
  font-size: 20px;
}
</style>