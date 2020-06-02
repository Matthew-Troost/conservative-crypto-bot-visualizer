<template>
  <div>
    <h1 class=" center">Conservative Cyrpto Trading Bot</h1>
    <h2 class="title center">Bitcoin</h2>
    <div class="live-icon">
      <div class="live-icon__dot"></div>
      <div class="live-icon__pulse"></div>
      <small class="live-icon__text"><b>LIVE</b></small>
    </div>
    <chart
      ref="chart"
      v-if="state"
      :pricePoints="pricePoints"
      :events="events"
      :latestEntryPoint="state.entryPricePoint"
      :upperLine="profiles ? profiles[0].reservePercentage : 0"
      :lowerLine="profiles ? profiles[0].stopLimitPercentage : 0"
    />
    <v-row class="data">
      <v-col cols="12" sm="8">
        <h3>Quick Actions</h3>
        <v-row class="center">
          <v-col cols="12" sm="4">
            <v-btn
              class="quick-action__button"
              small
              @click="confirmCommand('BUYIN')"
              :disabled="
                !$store.getters.signedIn ||
                  !state ||
                  (state.status != 'IDLE' &&
                    state.status != 'AWAITING_UPWARD_TREND')
              "
              >Buy In</v-btn
            >
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              class="quick-action__button"
              small
              @click="confirmCommand('CASHOUT')"
              :disabled="
                !$store.getters.signedIn ||
                  !state ||
                  (state.status != 'GAINING' &&
                    state.status != 'GAINS_CONTINUING')
              "
              >Cash Out</v-btn
            >
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              class="quick-action__button"
              small
              @click="confirmCommand('PAUSE')"
              :disabled="!$store.getters.signedIn"
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
          <v-tab :disabled="!$store.getters.signedIn">
            Accounts
          </v-tab>
          <v-tab :disabled="!$store.getters.signedIn">
            Settings
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab" class="tabs--transparent">
          <v-tab-item>
            <v-row>
              <v-col cols="12" sm="6">
                <statusStat :state="state" />
                <marginStat
                  v-if="
                    profiles && state && state.status != 'AWAITING_UPWARD_TREND'
                  "
                  :latestPricePoint="pricePoints && pricePoints[0]"
                  :state="state"
                  :margins="{
                    up: profiles[0].reservePercentage,
                    down: profiles[0].stopLimitPercentage * -1,
                  }"
                />
                <reverveMonitor
                  v-if="state && state.status == 'GAINS_CONTINUING'"
                  :state="state"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <currentTime />
                <priceStat :pricePoint="pricePoints && pricePoints[0]" />
                <regressionStat :pricePoints="pricePoints.slice(0, 6)" />
              </v-col>
            </v-row>
          </v-tab-item>
          <v-tab-item>
            <v-btn small @click="getAccounts()">Refresh</v-btn>
            <v-row>
              <v-col
                cols="12"
                sm="6"
                v-for="(account, index) in lunoAccounts"
                :key="account.id"
              >
                <account v-model="lunoAccounts[index]" />
              </v-col>
            </v-row>
            <p>Recent trades</p>
            <exits v-model="exits" />
          </v-tab-item>
          <v-tab-item>
            <profile v-if="profiles" v-model="profiles[0]" />
          </v-tab-item>
        </v-tabs-items>
      </v-col>
      <v-col cols="12" sm="4">
        <h3>Events</h3>
        <eventsStat :events="events" />
      </v-col>
    </v-row>
    <confirm
      :text="confirmAction.text"
      :open="confirmAction.display"
      @accepted="onActionConfirmed()"
      @cancelled="confirmAction.display = false"
    />
  </div>
</template>

<script>
import chart from "../components/chart";
import * as stats from "../components/stats";
import account from "../components/account";
import exits from "../components/exits";
import profile from "../components/profile";
import queries from "../apollo/queries.gql";
import { updateStatus } from "../apollo/mutations.gql";
import subscriptions from "../apollo/subscriptions.gql";
import luno_functions from "../mixins/luno";
import confirm from "../components/confirmAction";
import { functions } from "../plugins/firebase";

export default {
  components: {
    chart,
    ...stats,
    account,
    exits,
    profile,
    confirm,
  },
  mixins: [luno_functions],
  data() {
    return {
      state: null,
      profiles: null,
      pricePoints: [],
      events: [],
      tab: null,
      lunoAccounts: [],
      exits: [],
      confirmAction: {
        display: false,
        text: "",
        action: "",
      },
    };
  },
  created() {
    this.getAccounts();
  },
  computed: {
    hasLatestPriceIncreased() {
      if (!this.pricePoints) return false;
      return this.pricePoints[0].value > this.pricePoints[1].value;
    },
  },
  apollo: {
    events: {
      query: queries.getEvents,
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
      query: queries.getPricePoints,
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
      query: queries.getState,
    },
    profiles: {
      query: queries.getProfiles,
      skip() {
        return !this.$store.getters.signedIn;
      },
    },
    exits: {
      query: queries.getExits,
      variables: {
        limit: 10,
      },
    },
    $subscribe: {
      stateUpdated: {
        query: subscriptions.onStateUpdated,
        result({ data }) {
          this.state = data.stateUpdated.state;
        },
      },
      pricePointCreated: {
        query: subscriptions.onPricePointCreated,
        result({ data }) {
          if (!data.pricePointCreated) return;
          data.pricePointCreated.pricePoint.createdAt = new Date(
            data.pricePointCreated.pricePoint.createdAt
          );
          this.pricePoints.unshift(data.pricePointCreated.pricePoint);
        },
      },
      eventCreated: {
        query: subscriptions.onEventCreated,
        result({ data }) {
          if (!data.eventCreated) return;
          this.events.unshift(data.eventCreated.event);
          this.$refs.chart.updateEvents();
        },
      },
      exitCreated: {
        query: subscriptions.onExitCreated,
        result({ data }) {
          if (!data.exitCreated) return;
          this.exits.unshift(data.exitCreated.exit);
        },
      },
    },
  },
  methods: {
    getAccounts() {
      this.getBalances().then((accounts) => {
        this.lunoAccounts = accounts;
      });
    },
    confirmCommand(action) {
      this.confirmAction.action = action;
      switch (action) {
        case "PAUSE":
          this.confirmAction.text = "Pause trading?";
          break;
        case "CASHOUT":
          this.confirmAction.text = "Cash out?";
          break;
        case "BUYIN":
          this.confirmAction.text = "Cash out?";
          break;
      }
      this.confirmAction.display = true;
    },
    onActionConfirmed() {
      switch (this.confirmAction.action) {
        case "PAUSE":
          this.$apollo
            .mutate({
              mutation: updateStatus,
              variables: {
                status: "IDLE",
              },
            })
            .then(() => {
              this.$store.commit(
                "setSnackbarText",
                "Successfully paused trading."
              );
            })
            .catch((error) => {
              this.$store.commit(
                "setSnackbarText",
                `An error occured: ${error.message}`
              );
            })
            .finally(() => {
              this.confirmAction.display = false;
              this.$store.commit("setSnackbarDisplay", true);
            });
          break;
        case "CASHOUT":
          var exit = functions.httpsCallable("exit");
          exit({ pricePointId: this.pricePoints[0].id })
            .then(() => {
              this.$store.commit("setSnackbarText", "Successfully cashed out.");
            })
            .catch((error) => {
              this.$store.commit(
                "setSnackbarText",
                `An error occured: ${error.message}`
              );
            })
            .finally(() => {
              this.confirmAction.display = false;
              this.$store.commit("setSnackbarDisplay", true);
            });
          break;
        case "BUYIN":
          var enter = functions.httpsCallable("enter");
          enter({
            pricePointId: this.pricePoints[0].id,
            profile: this.profiles[0],
          })
            .then(() => {
              this.$store.commit("setSnackbarText", "Successfully bought in.");
            })
            .catch((error) => {
              this.$store.commit(
                "setSnackbarText",
                `An error occured: ${error.message}`
              );
            })
            .finally(() => {
              this.confirmAction.display = false;
              this.$store.commit("setSnackbarDisplay", true);
            });
          break;
      }
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
.quick-action__button.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  background-color: rgb(136, 136, 136) !important;
  color: black !important;
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
