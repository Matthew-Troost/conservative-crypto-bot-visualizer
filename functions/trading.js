let axios;
let state;

async function trade(axiosInstance, latestPricePoint) {
  axios = axiosInstance;
  await getCurrentState();

  switch (state.status) {
    case "IDLE":
    case "AWAITING_UPWARD_TREND":
      if (!(await isUpwardTrend())) return;
      setEntryPoint(latestPricePoint);
      break;

    case "GAINING":
      break;

    case "GAINS_CONTINUING":
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

  let pricePoints = response.data.data.pricePoints;

  if (pricePoints.length < 5) return false;

  const pricePointMultiplesSum = pricePoints
    .map((pricePoint, index) => {
      return pricePoint.value * (index + 1);
    })
    .reduce((a, b) => a + b, 0);

  const pricePointsSum = pricePoints
    .map((pricePoint) => {
      return pricePoint.value;
    })
    .reduce((a, b) => a + b, 0);

  const regressionSlope =
    (5 * pricePointMultiplesSum - 15 * pricePointsSum) /
    (5 * 55 - Math.sqrt(15));

  return regressionSlope > 0;
}

async function getCurrentState() {
  const response = await axios.post("graphql", {
    query: `query{
      state{
        status
        downwardCount
      }
    }`,
  });

  state = response.data.data.state;
}

function setCurrentStatus(status) {
  axios.post("graphql", {
    query: `mutation updateState($status: String!) {
        updateState(status: $status)
            }`,
    variables: {
      status,
    },
  });
}

//buying crypto
async function setEntryPoint(pricePointId) {
  await createEvent("BOUGHT IN", pricePointId);
  setCurrentStatus("GAINING");
}

//selling crypto
function setExitPoint(pricePointId) {
  setCurrentStatus("AWAITING_UPWARD_TREND");
}

//reached targeted gains, continuing
function setReservePoint(pricePointId) {
  setCurrentStatus("GAINS_CONTINUING");
}

function setDownwardCount(value) {
  axios.post("graphql", {
    query: `mutation updateState($downwardCount: Int!) {
        updateState(downwardCount: $downwardCount)
            }`,
    variables: {
      downwardCount: value,
    },
  });
}

async function createEvent(type, pricepointId) {
  return await axios.post("graphql", {
    query: `mutation createEvent($type: String!, pricepointId: Int!) {
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
