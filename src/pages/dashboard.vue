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
    <v-row class="data">
      <v-col cols="12" sm="8">
        <h3>Quick Actions</h3>
        <v-row class="center">
          <v-col cols="12" sm="4">
            <v-btn
              small
              :disabled="
                !state ||
                  (state.status != 'IDLE' &&
                    state.status != 'AWAITING_UPWARD_TREND')
              "
              >Buy In</v-btn
            >
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              small
              :disabled="
                !state ||
                  (state.status != 'GAINING' &&
                    state.status != 'GAINS_CONTINUING')
              "
              >Cash Out</v-btn
            >
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn small @click="test()"
              >{{
                !state || state.status == "PAUSED" ? "Resume" : "Pause"
              }}
              Trading</v-btn
            >
          </v-col>
        </v-row>
        <v-tabs v-model="tab" class="tabs--transparent">
          <v-tab>
            Statistics
          </v-tab>
          <v-tab>
            Controls
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab" class="tabs--transparent">
          <v-tab-item>
            <v-row>
              <v-col cols="12" sm="6">
                <statusStat :state="state" />
                <marginStat :latestPricePoint="pricePoints[0]" :state="state" />
                <reverveMonitor
                  v-if="state && state.status == 'GAINS_CONTINUING'"
                  :state="state"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <priceStat :pricePoint="pricePoints[0]" />
                <regressionStat :pricePoints="pricePoints.slice(0, 6)" />
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item>
            <v-card flat>
              <v-card-text>test 2</v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
      <v-col cols="12" sm="4">
        <h3>Events</h3>
        <eventsStat :events="events" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import chart from "../components/chart";
import regressionStat from "../components/stats/regression";
import priceStat from "../components/stats/price";
import statusStat from "../components/stats/status";
import eventsStat from "../components/stats/events";
import marginStat from "../components/stats/margin";
import reverveMonitor from "../components/stats/reserveMonitor";
import {
  getEvents,
  getState,
  getPricePoints,
  onStateUpdated,
  onPricePointCreated,
  onEventCreated,
} from "../apollo/queries.gql";

export default {
  components: {
    chart,
    regressionStat,
    priceStat,
    statusStat,
    eventsStat,
    marginStat,
    reverveMonitor,
  },
  data() {
    return {
      state: null,
      pricePoints: [],
      events: [],
      tab: null,
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
        limit: 10,
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
      eventCreated: {
        query: onEventCreated,
        result({ data }) {
          this.events.unshift(data.eventCreated.event);
          this.$refs.chart.updateEvents();
        },
      },
    },
  },
  methods: {
    test() {
      this.$refs.chart.updateEvents();
    },
  },
};
</script>

<style scoped>
.title {
  margin-bottom: 1em;
}
.data {
  margin-top: 15px;
}

.live-icon {
  position: relative;
  float: right;
  right: 60px;
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
