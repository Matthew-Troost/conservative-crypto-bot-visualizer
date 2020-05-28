import axios from "axios";
let luno_axios = axios.create({
  baseURL: "https://api.mybitx.com/api/1/",
//   auth: {
//     username: process.env.VUE_APP_LUNO_KEY_ID,
//     password: process.env.VUE_APP_LUNO_KEY_SECRET,
//   },
});

export default {
  methods: {
     getBalances() {
      return luno_axios.get("tickers").then(results => {
          console.log(results)
      }).catch(err => {
          console.log(err)
      });
    },
  },
};
