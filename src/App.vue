<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
export default {
    head: {
    title: {
      inner: 'Crypto Trading Bot'
    },
    link: [
      { rel: 'apple-touch-icon', sizes: "180x180", href: '/apple-touch-icon.png' },
      { rel: 'icon', type:"image/png", sizes: "32x32", href: '/favicon-32x32.png'},
      { rel: 'icon', type:"image/png", sizes: '16x16', href: '/favicon-16x16.png', }, 
      { rel: 'manifest', href: '/site.webmanifest' },
    ]
  }
}
</script>
<style scoped>
#app {
  padding: 30px 45px;
}
</style>
