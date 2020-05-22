<template>
  <div>
    <h1 class=" center">Conservative Cyrpto Trading Bot</h1>
    <h2 class="title center">Bitcoin</h2>
    <div class="live-icon">
      <div class="live-icon__dot"></div>
      <div class="live-icon__pulse"></div>
      <small class="live-icon__text"><b>LIVE</b></small>
    </div>
    <chart ref="chart" :pricePoints="pricePoints" :events="events" />
    <v-row no-gutters class="data">
      <v-col cols="12" sm="8">
        <h3>Controls</h3>
        <v-row class="center">
          <v-col cols="12" sm="4"> <v-btn small>Buy In</v-btn> </v-col>
          <v-col cols="12" sm="4"> <v-btn small>Cash Out</v-btn> </v-col>
          <v-col cols="12" sm="4"> <v-btn small>Pause Trading</v-btn> </v-col>
        </v-row>
        <h3>Statistics</h3>
        <v-row>
          <v-col cols="12" sm="6">
            <div class="card current-price">
              <v-progress-circular
                indeterminate
                color="primary"
                v-if="$apollo.queries.pricePoints.loading"
              ></v-progress-circular>
              <div v-else>
                <p>
                  <small
                    >Current price as at
                    {{ pricePoints[0].createdAt | moment("HH:mm:ss") }}</small
                  >
                </p>
                <p class="current-price__price">$ {{ pricePoints[0].value }}</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <regressionStat :pricePoints="pricePoints.slice(0, 6)" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="4">
        <h3>Events</h3>
        <div class="event-container">
          <vue-scroll>
            <div v-for="event in events" :key="event.id" class="card event">
              <b :class="event.type == 'SET RESERVE' ? 'light-green' : ''">{{ event.type }}</b>
              <span class="event--right">{{ event.pricePoint.value }}</span>
              <div class="event__date">
                <small>{{ event.createdAt | moment("dddd, HH:mm") }}</small>
              </div>
            </div>
          </vue-scroll>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import chart from "../components/chart";
import regressionStat from '../components/regressionStat';
import {
  getEvents,
  getState,
  getPricePoints,
  onStateUpdated,
  onPricePointCreated,
  // onEventCreated,
} from "../apollo/queries.gql";

export default {
  components: {
    chart,
    regressionStat
  },
  data() {
    return {
      state: null,
      pricePoints: [],
      events: [],
    };
  },
  computed: {
    hasLatestPriceIncreased() {
      if (!this.pricePoints) return false;
      return this.pricePoints[0].value > this.pricePoints[1].value;
    },
  },
  apollo: {
    events: {
      query: getEvents,
      variables: {
        limit: 100,
      },
      update: (data) => {
        data.events.forEach(
          (event) => (event.createdAt = new Date(event.createdAt))
        );
        return data.events;
      },
    },
    pricePoints: {
      query: getPricePoints,
      variables: {
        limit: 180,
      },
      update: (data) => {
        data.pricePoints.forEach(
          (point) => (point.createdAt = new Date(point.createdAt))
        );
        return data.pricePoints;
      },
    },
    state: {
      query: getState,
    },
    $subscribe: {
      stateUpdated: {
        query: onStateUpdated,
        result({ data }) {
          this.state = data.stateUpdated.state;
        },
      },
      pricePointCreated: {
        query: onPricePointCreated,
        result({ data }) {
          data.pricePointCreated.pricePoint.createdAt = new Date(
            data.pricePointCreated.pricePoint.createdAt
          );
          this.pricePoints.unshift(data.pricePointCreated.pricePoint);
        },
      },
      // eventCreated: {
      //   query: onEventCreated,
      //   result({ data }) {
      //     this.events.unshift(data.eventCreated.event);
      //   },
      // },
    },
  },
};
</script>

<style scoped>
.title {
  margin-bottom: 1em;
}
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
.data {
  margin-top: 15px;
}

.current-price__price {
  text-align: right;
  font-size: 20px;
  font-weight: bold;
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
