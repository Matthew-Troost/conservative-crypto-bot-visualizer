<template>
  <div id="app">
    <vue-scroll>
      <router-view class="router-container" />
      <div class="footer">
        A conservative crypto trading bot | Matthew Troost
        <img :src="logo" class="footer__logo" />
      </div>
    </vue-scroll>
  </div>
</template>
<script>
import logo from "./assets/images/crypto.png";

export default {
  data() {
    return {
      logo,
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
};
</script>
<style scoped>
#app {
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
  margin-top: -10px;
  float: right;
}
</style>
