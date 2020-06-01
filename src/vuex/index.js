import Vue from "vue";
import Vuex from "vuex";
import moment from "moment";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    authToken: null,
    authTokenExpiry: null,
    snackbar: {
      display: false,
      text: ""
    },
  },
  getters: {
    signedIn: (state) => {
      return state.authToken && state.authTokenExpiry > new Date();
    },
  },
  mutations: {
    setAuthToken(state, value) {
      state.authToken = value;
    },
    setAuthTokenExpiry(state, value) {
      state.authTokenExpiry = value;
    },
    setSnackbarDisplay(state, value) {
      state.snackbar.display = value;
    },
    setSnackbarText(state, value) {
      state.snackbar.text = value;
    },
  },
  actions: {
    signIn(context, token) {
      context.commit("setAuthToken", token);
      context.commit(
        "setAuthTokenExpiry",
        moment()
          .add("29", "minutes")
          .toDate()
      );
    },
  },
});

export default store;
