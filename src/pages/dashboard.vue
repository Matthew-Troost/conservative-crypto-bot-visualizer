<template>
  <div>
    <h1 class="center">Conservative Cyrpto Trading Bot</h1>
    <div class="live-icon">
      <div class="live-icon__dot"></div>
      <div class="live-icon__pulse"></div>
      <small class="live-icon__text"><b>LIVE</b></small>
    </div>
    <chart ref="chart" />
    <v-row no-gutters class="data">
      <v-col cols="12" sm="8">
        <h3>Controls</h3>

        <v-row>
          <v-col cols="12" sm="6"> <h3>Statistics</h3> </v-col>
        </v-row>
      </v-col>
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
import { getEvents } from "../apollo/queries.gql";

export default {
  components: {
    chart,
  },
  data() {
    return {
      events: [],
    };
  },
  apollo: {
    events: {
      query: getEvents,
      variables: {
        limit: 100,
      },
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
.data {
  margin-top: 15px;
}

.live-icon {
  position: relative;
}
.live-icon__text {
  margin-left: 25px;
  position: absolute;
}
.live-icon__pulse {
  width: 10px;
  height: 10px;
  border: 5px solid #f4bb1a;
  -webkit-border-radius: 30px;
  -moz-border-radius: 30px;
  border-radius: 30px;
  background-color: #716f42;
  z-index: 10;
  position: absolute;
}

.live-icon__dot {
  border: 10px solid #f4bb1a;
  background: transparent;
  -webkit-border-radius: 60px;
  -moz-border-radius: 60px;
  border-radius: 60px;
  height: 50px;
  width: 50px;
  -webkit-animation: pulse 3s ease-out;
  -moz-animation: pulse 3s ease-out;
  animation: pulse 3s ease-out;
  -webkit-animation-iteration-count: infinite;
  -moz-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  position: absolute;
  top: -20px;
  left: -20px;
  z-index: 1;
  opacity: 0;
}

@-moz-keyframes pulse {
  0% {
    -moz-transform: scale(0);
    opacity: 0;
  }
  25% {
    -moz-transform: scale(0);
    opacity: 0.1;
  }
  50% {
    -moz-transform: scale(0.1);
    opacity: 0.3;
  }
  75% {
    -moz-transform: scale(0.5);
    opacity: 0.5;
  }
  100% {
    -moz-transform: scale(1);
    opacity: 0;
  }
}

@-webkit-keyframes pulse {
  0% {
    -webkit-transform: scale(0);
    opacity: 0;
  }
  25% {
    -webkit-transform: scale(0);
    opacity: 0.1;
  }
  50% {
    -webkit-transform: scale(0.1);
    opacity: 0.3;
  }
  75% {
    -webkit-transform: scale(0.5);
    opacity: 0.5;
  }
  100% {
    -webkit-transform: scale(1);
    opacity: 0;
  }
}
</style>
