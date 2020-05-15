const functions = require("firebase-functions");
const axios = require("axios");

exports.test_tick = functions.https.onRequest(async () => {
  //1. Get current BTC value of $1000
  axios
    .get("https://blockchain.info/tobtc?currency=USD&value=1000")
    .then(async (response) => {
      const BTC_value = response.data;

      //2. Get auth token by signing in
      const token = await getAPIAuthToken();

      axios.defaults.headers.post['X-Token'] = token

      //3. Post BTC price to API
      const pricePointId = await createPricePoint('BTC', BTC_value);
      
      //4. Run trading algorithm

      return;
    })
    .catch((error) => {
      // write to error endpoint
     console.log(error.response);
    });

  return true;
});

exports.tick = functions.pubsub.schedule("every 1 minutes").onRun(async () => {
  axios
    .get("https://blockchain.info/tobtc?currency=USD&value=1000")
    .then((response) => {
      // handle success
      console.log(response);
      return;
    })
    .catch((error) => {
      // write to error endpoint
      console.log(error);
    });
});

async function getAPIAuthToken() {
  const signIn_response = await axios.post(
    "https://conserv-crypto-trading-bot-api.herokuapp.com/graphql",
    {
      query: `mutation signIn($login: String!, $password: String!) {
            signIn(login: $login, password: $password){
                token
            }
        }`,
      variables: {
        login: "Matthew", //move this to config
        password: "roofcat", //move this to config
      },
    }
  );

  return signIn_response.data.data.signIn.token;
}

async function createPricePoint(crypto, value) {
  const createPricePoint_response = await axios.post(
    "https://conserv-crypto-trading-bot-api.herokuapp.com/graphql",
    {
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
    }
  );

  return createPricePoint_response.data.data.createPricePoint.id
}

function processPoint(){
  //1. If there is no last entry point, this is first time running 
}