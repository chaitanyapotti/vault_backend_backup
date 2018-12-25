var express = require("express");
var router = express.Router();

const contractInstance = require("../utils/contractInstance");
const web3Read = require("../utils/web3Read");

function validateInputs(req, res) {
  if (!("network" in req.query && "address" in req.query && "version" in req.query)) return res.status(400).send("Bad Request");
  if (!(req.query.network in global.supportedNetworks)) return res.status(400).send("Not a supported network");
}

//localhost:3000/web3/crowdsale/currentround?address=0xA112e2EbE8657130A0E3eC540022f2929f668299&network=rinkeby&version=1
router.get("/currentround", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const promiseArray = [];
    const roundPromise = web3.eth.call({
      to: req.query.address,
      data: "0x8a19c8bc00000000000000000000000000000000000000000000000000000000"
    });
    promiseArray.push(roundPromise);
    const endTimePromise = web3.eth.call({
      to: req.query.address,
      data: "0xe643db4700000000000000000000000000000000000000000000000000000000"
    });
    promiseArray.push(endTimePromise);
    Promise.all(promiseArray)
      .then(response => {
        const round = response[0];
        const endTime = response[1];
        let returnValue;
        if (web3.utils.toDecimal(endTime).toString() !== "0") returnValue = parseInt(web3.utils.toDecimal(round)) + 1;
        else returnValue = 0;
        res.status(200).send({
          message: "Success",
          info: "This current round is added with 1. to query against contracts, subtract 1 (index starts from 0)",
          data: returnValue.toString(),
          units: ""
        });
      })
      .catch(error => {
        console.log(error.message);
        return res.status(400).send({
          message: "Failed",
          reason: "Couldn't execute",
          data: ""
        });
      });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("CrowdSale", req.query.address, req.query.network, req.query.version)
  //   .then(async instance => {
  //     const round = await instance.methods.currentRound().call();
  //     const endTime = await instance.methods.currentRoundEndTime().call();
  //     let returnValue;
  //     if (endTime.toString() !== "0") returnValue = parseInt(round) + 1;
  //     else returnValue = 0;
  //     res.status(200).send({
  //       message: "Success",
  //       info: "This current round is added with 1. to query against contracts, subtract 1 (index starts from 0)",
  //       data: returnValue.toString(),
  //       units: ""
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/crowdsale/currentround/details?address=0xA112e2EbE8657130A0E3eC540022f2929f668299&network=rinkeby&version=1
router.get("/currentround/details", async (req, res) => {
  validateInputs(req, res);
  contractInstance("CrowdSale", req.query.address, req.query.network, req.query.version)
    .then(async instance => {
      const round = await instance.methods.currentRound().call();
      return instance.methods.roundDetails(round).call();
    })
    .then(result =>
      res.status(200).send({
        message: "Success",
        info: "The data is a json object with details about current round incl." + "tokenCount, tokenRate, totalTokensSold, endTime",
        data: result,
        units: {
          tokenCount: "divide by 10^18 or use web3.utils.fromWei() to get normal token count",
          tokenRate: "tokens/wei",
          totalTokensSold: "divide by 10^18 or use web3.utils.fromWei() to get normal token count",
          endTime: "this is unix time"
        }
      })
    )
    .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/crowdsale/round/details?address=0xA112e2EbE8657130A0E3eC540022f2929f668299&network=rinkeby&version=1&round=0
router.get("/round/details", (req, res) => {
  validateInputs(req, res);
  if (!("round" in req.query)) res.status(400).send("Bad Request");
  contractInstance("CrowdSale", req.query.address, req.query.network, req.query.version)
    .then(instance => instance.methods.roundDetails(req.query.round).call())
    .then(result =>
      res.status(200).send({
        message: "Success",
        info: "The data is a json object with details about current round incl." + "tokenCount, tokenRate, totalTokensSold, startTime, endTime",
        data: result,
        units: {
          tokenCount: "divide by 10^18 or use web3.utils.fromWei() to get normal token count",
          tokenRate: "tokens/wei",
          totalTokensSold: "divide by 10^18 or use web3.utils.fromWei() to get normal token count",
          startTime: "this is unix time",
          endTime: "this is unix time"
        }
      })
    )
    .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/crowdsale/round/userdetails?address=0xBf583f9c5E85d56aB040c745F26060c040304C65&network=rinkeby&version=1&round=0&useraddress=0x43CE12056AA1E8372ab4aBF0C0cC658D2d41077f
router.get("/round/userdetails", (req, res) => {
  validateInputs(req, res);
  if (!("round" in req.query && "useraddress" in req.query)) res.status(400).send("Bad Request");
  contractInstance("CrowdSale", req.query.address, req.query.network, req.query.version)
    .then(instance => instance.methods.userContributonDetails(req.query.useraddress, req.query.round).call())
    .then(result => {
      res.status(200).send({
        message: "Success",
        info: "The data is a json object with details about current round incl. of user contribution amount",
        data: result.amount,
        units: "divide by 10^18 or use web3.utils.fromWei() to get normal amount"
      });
    })
    .catch(err => res.status(400).send(err.message));
});

module.exports = router;
