<template>
  <v-data-table
    :headers="headers"
    :items="mappedValues"
    :items-per-page="5"
    class="elevation-1"
    dense
  >
    <template v-slot:item.gain="{ item }">
      <v-chip class="v-chip--custom" :color="item.gain > 0 ? 'green' : 'red'">{{
        item.gain
      }}</v-chip>
    </template>
  </v-data-table>
</template>
<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      headers: [
        {
          text: "Time of trade",
          align: "start",
          value: "date",
        },
        { text: "BTC Entry Price", align: "start", value: "entryPrice" },
        { text: "BTC Exit Price", align: "start", value: "exitPrice" },
        { text: "Margin", align: "start", value: "margin" },
        { text: "Traded", align: "start", value: "entryAmount" },
        { text: "Gain", align: "start", value: "gain" },
      ],
    };
  },
  computed: {
    mappedValues() {
      return this.value.map((item) => {
        const margin = this.margin(
          item.pricePoint.value,
          item.entry.pricePoint.value
        );

        return {
          date: this.$moment(item.createdAt).format("dddd, HH:mm:ss"),
          entryAmount: item.entry.value,
          exitPrice: item.pricePoint.value,
          entryPrice: item.entry.pricePoint.value,
          margin: margin,
          gain: (item.entry.value * (margin / 100)).toFixed(2),
        };
      });
    },
  },
  methods: {
    margin(exitPrice, entryPrice) {
      const dif = exitPrice - entryPrice;
      return ((dif / entryPrice) * 100).toFixed(3);
    },
  },
};
</script>
<style scoped>
.v-chip--custom {
  height: 25px !important;
  margin: 2px 0;
}
</style>
