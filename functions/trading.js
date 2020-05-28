let axios;
let state;
let profile;
const stopLimitPercentage = 1;
const reservePercentage = 1;
const lodash = require("lodash");

async function trade(axiosInstance, latestPricePoint) {
  axios = axiosInstance;
  await getCurrentState();
  await getProfile();

  switch (state.status) {
    case "IDLE":
      if (!(await isUpwardTrend())) return;
      await enter(latestPricePoint.id);
      break;

    case "AWAITING_UPWARD_TREND":
      // if (moment(state.lastCashOut) > moment().subtract(5, "minutes")) return;
      if (!(await isUpwardTrend())) return;
      await enter(latestPricePoint.id);
      break;

    case "GAINING":
      if (latestPricePoint.value < state.entryPricePoint.value) {
        let percentage =
          100 - (latestPricePoint.value / state.entryPricePoint.value) * 100;
        let decrease = Math.round((percentage + Number.EPSILON) * 100) / 100;
        if (decrease >= stopLimitPercentage) await exit(latestPricePoint.id);
      } else {
        let percentage =
          100 - (state.entryPricePoint.value / latestPricePoint.value) * 100;
        let increase = Math.round((percentage + Number.EPSILON) * 100) / 100;
        if (increase >= reservePercentage)
          await setReservePoint(latestPricePoint.id);
      }
      break;

    case "GAINS_CONTINUING":
      if (latestPricePoint.value < state.reservePricePoint.value) {
        await exit(latestPricePoint.id);
        await setDownwardCount(0);
      } else if (latestPricePoint.value < state.lastDownwardPricePoint.value) {
        if (state.downwardCount === 2) await exit(latestPricePoint.id);
        else await setDownwardCount(++state.downwardCount, latestPricePoint.id);
      } else await setDownwardCount(0, latestPricePoint.id);
      break;
  }
}

async function isUpwardTrend() {
  const response = await axios.post("graphql", {
    query: `query pricePoints($limit: Int) {
      pricePoints(limit: $limit){
        value
      }
    }`,
    variables: {
      limit: 5,
    },
  });

  let pricePoints = response.data.data.pricePoints.reverse();

  if (pricePoints.length < 5) return false;

  const y_mean = lodash.meanBy(pricePoints, "value");

  const x_subtract_mean = [-4, -3, -2, -1, 0];
  const y_subtract_mean = pricePoints.map((point) => {
    return point.value - y_mean;
  });

  const multiples = [];
  y_subtract_mean.forEach((value, index) =>
    multiples.push(value * x_subtract_mean[index])
  );

  const squares = [];
  x_subtract_mean.forEach((value) =>
    squares.push(Math.sqrt(value < 0 ? value * -1 : value))
  );

  return lodash.sum(multiples) / lodash.sum(squares) > 0;
}

async function getCurrentState() {
  const response = await axios.post("graphql", {
    query: `query{
      state{
        status
        downwardCount
        entryPricePoint{
          value
        }
        reservePricePoint{
          value
        }
        lastDownwardPricePoint{
          value
        }
        lastCashOut
      }
    }`,
  });

  state = response.data.data.state;
}

async function setCurrentStatus(status) {
  await axios.post("graphql", {
    query: `mutation updateState($status: String!) {
        updateState(status: $status)
            }`,
    variables: {
      status,
    },
  });
}

//buying crypto
async function enter(pricePointId) {
  await axios.post("graphql", {
    query: `mutation updateState($entryPricePointId: Int!) {
        updateState(entryPricePointId: $entryPricePointId)
            }`,
    variables: {
      entryPricePointId: pricePointId,
    },
  });

  await axios.post("graphql", {
    query: `mutation createEntry($value: Float!, $pricepointId: Int!, $profileId: Int!) {
      createEntry(value: $value, pricepointId: $pricepointId, profileId: $profileId){
        id
      }
            }`,
    variables: {
      value: profile.tradeInput, //TODO: check if this is available in luno wallet
      pricepointId: pricePointId,
      profileId: profile.id,
    },
  });

  await createEvent("BOUGHT IN", pricePointId);

  await setCurrentStatus("GAINING");
}

//selling crypto
async function exit(pricePointId) {
  await axios.post("graphql", {
    query: `mutation updateState($lastCashOut: String!) {
        updateState(lastCashOut: $lastCashOut)
            }`,
    variables: {
      lastCashOut: new Date().toString(),
    },
  });

  const lastEntry = await getLastEntry();
  await axios.post("graphql", {
    query: `mutation createExit($enterId: Int!, $pricepointId: Int!) {
      createExit(enterId: $enterId, pricepointId: $pricepointId){
        id
      }
            }`,
    variables: {
      enterId: lastEntry.id,
      pricepointId: pricePointId,
    },
  });

  await createEvent("CASHED OUT", pricePointId);

  await setCurrentStatus("AWAITING_UPWARD_TREND");
}

//reached targeted gains, continuing
async function setReservePoint(pricePointId) {
  await axios.post("graphql", {
    query: `mutation updateState($reservePricePointId: Int!, $lastDownwardPricePointId: Int) {
        updateState(reservePricePointId: $reservePricePointId, lastDownwardPricePointId: $lastDownwardPricePointId)
            }`,
    variables: {
      reservePricePointId: pricePointId,
      lastDownwardPricePointId: pricePointId,
    },
  });
  await createEvent("SET RESERVE", pricePointId);
  await setCurrentStatus("GAINS_CONTINUING");
}

async function setDownwardCount(value, pricePointId) {
  await axios.post("graphql", {
    query: `mutation updateState($downwardCount: Int! ${
      pricePointId ? ", $lastDownwardPricePointId: Int" : ""
    }) {
        updateState(downwardCount: $downwardCount ${
          pricePointId
            ? ", lastDownwardPricePointId: $lastDownwardPricePointId"
            : ""
        })
            }`,
    variables: {
      downwardCount: value,
      lastDownwardPricePointId: pricePointId || null,
    },
  });
}

async function createEvent(type, pricepointId) {
  return await axios.post("graphql", {
    query: `mutation createEvent($type: String!, $pricepointId: Int!) {
      createEvent(type: $type, pricepointId: $pricepointId){
        id
      }
            }`,
    variables: {
      type,
      pricepointId,
    },
  });
}

async function getProfile() {
  const response = await axios.post("graphql", {
    query: `query{
      profiles{
        id
        stopLimitPercentage
        reservePercentage
        maximumLossesPerDay
        tradeInput
      }
    }`,
  });

  let result = response.data.data.profiles[0];

  profile = {
    id: parseInt(result.id),
    stopLimitPercentage: parseFloat(result.stopLimitPercentage),
    reservePercentage: parseFloat(result.reservePercentage),
    maximumLossesPerDay: parseInt(result.maximumLossesPerDay),
    tradeInput: parseFloat(result.tradeInput),
  };
}

async function getLastEntry() {
  const response = await axios.post("graphql", {
    query: `query{
      entries(limit: 1){
        id
      }
    }`,
  });

  let lastEntry = response.data.data.entries[0];
  lastEntry.id = parseInt(lastEntry.id);
  return lastEntry;
}

module.exports = { trade };
