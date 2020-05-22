let axios;
let state;
const stopLimitPercentage = 1;
const reservePercentage = 1;
const moment = require("moment");

async function trade(axiosInstance, latestPricePoint) {
  axios = axiosInstance;
  await getCurrentState();

  switch (state.status) {
    case "IDLE":
      if (!(await isUpwardTrend())) return;
      await enter(latestPricePoint.id);
      break;

    case "AWAITING_UPWARD_TREND":
      if (moment(state.lastCashOut) > moment().subtract(5, "minutes")) return;
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
      if (latestPricePoint.value < state.reservePricePoint.value)
        await exit(latestPricePoint.id);
      else if (latestPricePoint.value < state.lastDownwardPricePoint.value) {
        if (state.downwardCount === 2) await exit(latestPricePoint.id);
        else setDownwardCount(++state.downwardCount, latestPricePoint.id);
      } else setDownwardCount(0);
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

  const y_mean = this.lodash.meanBy(pricePoints, "value");

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

  return (
    multiples.reduce((a, b) => a + b, 0) / squares.reduce((a, b) => a + b, 0)
  ) > 0;
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
  await createEvent("CASHED OUT", pricePointId);
  await setCurrentStatus("AWAITING_UPWARD_TREND");
}

//reached targeted gains, continuing
async function setReservePoint(pricePointId) {
  await axios.post("graphql", {
    query: `mutation updateState($reservePricePointId: Int!) {
        updateState(reservePricePointId: $reservePricePointId)
            }`,
    variables: {
      reservePricePointId: pricePointId,
    },
  });
  await createEvent("SET RESERVE", pricePointId);
  await setCurrentStatus("GAINS_CONTINUING");
}

function setDownwardCount(value, pricePointId) {
  axios.post("graphql", {
    query: `mutation updateState($downwardCount: Int!, $lastDownwardPricePointId: Int) {
        updateState(downwardCount: $downwardCount, lastDownwardPricePointId: $lastDownwardPricePointId)
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

module.exports = { trade };
