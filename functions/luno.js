const axios = require("axios");
const functions = require("firebase-functions");

let luno_axios = axios.create({
  baseURL: "https://api.mybitx.com/api/1/",
  auth: {
    username: functions.config().luno.key_id,
    password: functions.config().luno.key_secret,
  },
});

async function getAccount(accountId) {
  return new Promise((resolve, reject) => {
    luno_axios
      .get("balance")
      .then((results) => {
        return resolve(
          results.data.balance.find((balance) => {
            return balance.account_id === accountId;
          })
        );
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

module.exports = { getAccount };
