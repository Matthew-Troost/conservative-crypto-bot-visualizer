const functions = require("firebase-functions");
let trading = require("./trading");
const axios = require("axios");
let axios_API = axios.create({
  baseURL: "https://conserv-crypto-trading-bot-api.herokuapp.com/",
  timeout: 5000,
});

// exports.test_tick = functions.https.onRequest(async () => {
//   //1. Get current BTC value of $1000
//    await axios
//     .get("https://blockchain.info/tobtc?currency=USD&value=1000")
//     .then(async (response) => {
//       const BTC_value = response.data;

//       //2. Get auth token by signing in
//       const token = await getAPIAuthToken();

//       axios_API.defaults.headers["X-Token"] = token;

//       //3. Post BTC price to API
//       const pricePoint = await createPricePoint("BTC", BTC_value);

//       //4. Run trading algorithm
//       return await trading.trade(axios_API, pricePoint);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

exports.tick = functions.pubsub.schedule("every 1 minutes").onRun(async () => {
  return await axios
    .get("https://blockchain.info/ticker")
    .then(async (response) => {
      const BTC_value = response.data.USD.buy;

      //2. Get auth token by signing in
      await authenticate();

      //3. Post BTC price to API
      const pricePoint = await createPricePoint("BTC", BTC_value);

      //4. Get all profiles
      const profiles = await getProfiles();

      //5. Run trading algorithm
      trading.setAxiosInstance(axios_API);
      return profiles.forEach(
        async (profile) => await trading.trade(pricePoint, profile)
      );
    })
    .catch((error) => {
      console.log(error.response);
    });
});

exports.cleanup = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    await authenticate();
    return await deleteOldPricePoints();
  });

exports.exit = functions.https.onCall(async (data, context) => {
  await authenticate();
  trading.setAxiosInstance(axios_API);
  return await trading.exit(data.pricePointId);
});

exports.enter = functions.https.onCall(async (data, context) => {
  await authenticate();
  trading.setAxiosInstance(axios_API);
  return await trading.enter(data.pricePointId, data.profile);
});

async function authenticate() {
  const token = await getAPIAuthToken();

  axios_API.defaults.headers["X-Token"] = token;
}

async function getAPIAuthToken() {
  const signIn_response = await axios_API.post("graphql", {
    query: `mutation signIn($login: String!, $password: String!) {
            signIn(login: $login, password: $password){
                token
            }
        }`,
    variables: {
      login: "Matthew", //move this to config
      password: "roofcat", //move this to config
    },
  });

  return signIn_response.data.data.signIn.token;
}

async function getProfiles() {
  const profiles_response = await axios_API.post("graphql", {
    query: `query{
      profiles {
        id
        stopLimitPercentage
        reservePercentage
        maximumLossesPerDay
        tradeInput
      }
    }`,
  });

  return profiles_response.data.data.profiles;
}

async function getLatestPricePoint() {
  const response = await axios_API.post("graphql", {
    query: `query{
      pricePoints(limit: 1){
        id
      }
    }`,
  });

  return response.data.data.pricePoints[0];
}

async function createPricePoint(crypto, value) {
  const createPricePoint_response = await axios_API.post("graphql", {
    query: `mutation createPricePoint($currency: String!, $crypto: String!, $value: Float!) {
            createPricePoint(currency: $currency, crypto: $crypto, value: $value){
                    id
                }
            }`,
    variables: {
      currency: "USD",
      crypto,
      value,
    },
  });

  return {
    id: parseInt(createPricePoint_response.data.data.createPricePoint.id),
    value,
  };
}

async function deleteOldPricePoints() {
  const deleteOldPricePoints_response = await axios_API.post("graphql", {
    query: `mutation {
              deleteOldPricePoints
            }`,
  });

  return deleteOldPricePoints_response.data.data.deleteOldPricePoints;
}
