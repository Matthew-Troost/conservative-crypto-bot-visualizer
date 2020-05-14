const functions = require("firebase-functions");
const axios = require('axios')

exports.tick = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {


    
  });
