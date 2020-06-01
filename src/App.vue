<template>
  <div class="app">
    <vue-scroll>
      <router-view class="router-container" />
      <div class="footer">
        A conservative crypto trading bot | Matthew Troost
        <img :src="logo" class="footer__logo" @click="signin_dialog = true" />
        <br />
        <span
          >Trading via
          <a href="https://www.luno.com/"
            ><img :src="luno_logo" class="footer__lunologo"/></a
        ></span>
      </div>
      <v-app>
        <v-dialog v-model="signin_dialog" max-width="290">
          <v-card>
            <v-card-title class="headline">Access</v-card-title>
            <v-card-text v-if="$store.getters.signedIn">
              Already signed in.
            </v-card-text>
            <div v-else>
              <v-card-text>
                <v-text-field
                  label="Username"
                  v-model="username"
                ></v-text-field>
                <v-text-field
                  label="Password"
                  type="password"
                  v-model="password"
                ></v-text-field>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn text @click="signin_dialog = false">
                  Cancel
                </v-btn>

                <v-btn text @click="signIn()" :disabled="loading">
                  Sign In
                </v-btn>
              </v-card-actions>
            </div>
          </v-card>
        </v-dialog>
      </v-app>
    </vue-scroll>
    <v-snackbar v-model="snackbar.display" :timeout="2000">
      {{ snackbar.text }}
      <v-btn color="blue" text @click="$store.commit('setSnackbarDisplay', false)">
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>
<script>
import logo from "./assets/images/crypto.png";
import luno_logo from "./assets/images/luno-logo.png";
import { signIn } from "./apollo/mutations.gql";
import { mapState } from "vuex";

export default {
  data() {
    return {
      logo,
      luno_logo,
      signin_dialog: false,
      loading: false,
      username: "",
      password: "",
    };
  },
  head: {
    title: {
      inner: "Crypto Trading Bot",
    },
    link: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  },
  computed: {
    ...mapState({
      snackbar: (state) => state.snackbar,
    }),
  },
  methods: {
    signIn() {
      this.loading = true;
      this.$apollo
        .mutate({
          mutation: signIn,
          variables: {
            login: this.username,
            password: this.password,
          },
        })
        .then((result) => {
          sessionStorage.setItem("apollo-token", result.data.signIn.token);
          this.$store.dispatch("signIn", result.data.signIn.token);
          this.signin_dialog = false;
          this.loading = false;
        })
        .catch(() => {
          this.username = "";
          this.password = "";
          this.loading = false;
        });
    },
  },
};
</script>
<style scoped>
.app {
  height: 100vh;
}
.router-container {
  padding: 30px 45px;
}
.footer {
  border-top: 2px solid #797979;
  margin: 30px 45px;
  padding-top: 20px;
}
.footer__logo {
  width: 40px;
  float: right;
}
.footer__logo:hover {
  cursor: pointer;
}

.footer__lunologo {
  width: 50px;
}
</style>
