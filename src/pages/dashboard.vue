<template>
  <div>
    <h1 class="center">Conservative Cyrpto Trading Bot</h1>
    <chart />
    <v-row no-gutters>
      <v-col cols="12" sm="8"> </v-col>
      <v-col cols="12" sm="4">
        <h3>Events</h3>
        <div v-for="event in events" :key="event.id" class="event-container">
          <b>{{ event.type }}</b>
          <span class="event-container--right">{{
            event.pricePoint.value
          }}</span>
          <div class="event-container__date">
            <small>{{ event.createdAt | moment("dddd, HH:mm") }}</small>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import chart from "../components/chart";
import axios from "axios";

export default {
  components: {
    chart,
  },
  data() {
    return {
      events: [],
    };
  },
  created() {
    this.getEvents();
  },
  methods: {
    async getEvents() {
      let response = await axios.post(
        "https://conserv-crypto-trading-bot-api.herokuapp.com/graphql",
        {
          query: `query{ 
              events(limit: 100){
                    createdAt
                    type
                    pricePoint{
                        value
                    }
                }
            }`,
        }
      );

      this.events = response.data.data.events;
    },
  },
};
</script>

<style scoped>
.event-container {
  border: 1px solid whitesmoke;
  border-radius: 5px;
  padding: 1em;
  margin: 0.8em 0;
}

.event-container--right {
  float: right;
}

.event-container__date {
      background: #868686;
    color: black;
    padding: 0 1em;
  margin: 0.8em -1em -1em;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
