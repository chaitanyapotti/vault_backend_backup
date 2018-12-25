const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectID;
const web3Read = require("../utils/web3Read");

const contractInstance = require("../utils/contractInstance");

function validateInputs(req, res) {
  if (!("network" in req.query && "address" in req.query && "version" in req.query)) return res.status(400).send("Bad Request");
  if (!(req.query.network in global.supportedNetworks)) return res.status(400).send("Not a supported network");
}

//http://localhost:3000/projectweb3/tokens?network=rinkeby&version=1&address=0x8927903ee98ac064ab308db77fe3594f76eeda1f
/* GET featured projects IDs. */
router.get("/tokens", function(req, res, next) {
  validateInputs(req, res);
  let collectionName = "project_details";
  if (req.query.network !== "main") {
    collectionName = collectionName + "_" + req.query.network;
  }
  global.db
    .collection(collectionName)
    .find(
      { network: req.query.network, version: req.query.version },
      {
        projection: {
          daicoTokenAddress: 1,
          tokenPrice: 1,
          projectHealth: 1,
          tapIncrement: 1,
          killConsensus: 1,
          killPollStartDate: 1,
          xfrCount: 1,
          projectName: 1,
          tokenTag: 1,
          tapAcceptancePercent: 1,
          killAcceptancePercent: 1,
          thumbnailUrl: 1
        }
      }
    )
    .toArray(async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
      }
      const web3 = web3Read(req.query.network);
      let promiseArray = [];
      for (let index = 0; index < result.length; index++) {
        try {
          const project = result[index];
          const balancePromise = web3.eth.call({
            to: project.daicoTokenAddress,
            data: "0x70a08231" + "000000000000000000000000" + req.query.address.substring(2)
          });
          promiseArray.push(balancePromise);
        } catch (error) {
          continue;
        }
      }
      Promise.all(promiseArray)
        .then(resp => {
          for (let index = 0; index < result.length; index++) {
            const element = result[index];
            element["balance"] = web3.utils.fromWei(resp[index], "ether");
          }
          const newArray = result.filter(x => parseFloat(x.balance) > 0);
          res.status(200).send({
            message: "Success",
            data: newArray,
            reason: ""
          });
        })
        .catch(err => {
          console.error(err);
          return res.status(500).send({
            message: "Failed",
            reason: "Database error!",
            data: []
          });
        });
    });
});

//http://localhost:3000/projectweb3/killPollHistory?projectid=5bc20f6bd371e27719f3c358&network=rinkeby
// router.get("/killPollHistory", function(req, res, next) {
//   if (!("network" in req.query && "projectid" in req.query)) return res.status(400).send("Bad Request");
//   global.db.collection("project_details").findOne(
//     { _id: ObjectID(req.query.projectid) },
//     {
//       projection: {
//         pollFactoryAddress: 1,
//         version: 1
//       }
//     },
//     async (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send({
//           message: "Failed",
//           reason: "Database error!",
//           data: []
//         });
//       }
//       const web3 = web3Read(req.query.network);
//       try {
//         const killPollList = [];
//         const instance = await contractInstance("KillPollAddressFetch", result.pollFactoryAddress, req.query.network, result.version);
//         for (let index = 0; index < 8; index++) {
//           const address = await instance.methods.killPollAddresses(index).call();
//           const endTime = await web3.eth.call({
//             to: address,
//             data: "0x439f5ac200000000000000000000000000000000000000000000000000000000"
//           });
//           const consensus = await web3.eth.call({
//             to: address,
//             data: "0x79cc935100000000000000000000000000000000000000000000000000000000"
//           });
//           killPollList.push({ address: address, endTime: await web3.utils.toDecimal(endTime), consensus: await web3.utils.fromWei(consensus) });
//         }
//         res.status(200).send({
//           message: "Success",
//           data: killPollList,
//           reason: ""
//         });
//       } catch (error) {
//         console.log(error.message);
//         return res.status(400).send({
//           message: "Failed",
//           reason: "Couldn't execute",
//           data: []
//         });
//       }
//     }
//   );
// });

// //http://localhost:3000/projectweb3/tapPollHistory?projectid=5bc20f6bd371e27719f3c358&network=rinkeby
// router.get("/tapPollHistory", function(req, res, next) {
//   if (!("network" in req.query && "projectid" in req.query)) return res.status(400).send("Bad Request");
//   global.db.collection("project_details").findOne(
//     { _id: ObjectID(req.query.projectid) },
//     {
//       projection: {
//         pollFactoryAddress: 1,
//         version: 1
//       }
//     },
//     async (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send({
//           message: "Failed",
//           reason: "Database error!",
//           data: []
//         });
//       }
//       const web3 = web3Read(req.query.network);
//       try {
//         const tapPollAddresses = [];
//         const endTimes = [];
//         const instance = await contractInstance("PollFactory", result.pollFactoryAddress, req.query.network, result.version);
//         const eventArray = await instance.getPastEvents("TapPollCreated", {
//           filter: {},
//           fromBlock: 0,
//           toBlock: "latest"
//         });
//         const increaseTapArray = await instance.getPastEvents("TapIncreased", {
//           filter: {},
//           fromBlock: 0,
//           toBlock: "latest"
//         });
//         eventArray.map(item => {
//           const { returnValues } = item || {};
//           const { tapPollAddress } = returnValues || {};
//           tapPollAddresses.push(tapPollAddress);
//         });
//         for (let index = 0; index < increaseTapArray.length; index++) {
//           const item = increaseTapArray[index];
//           const { blockNumber } = item || {};
//           const blockObject = await web3.eth.getBlock(blockNumber);
//           const { timestamp } = blockObject;
//           endTimes.push(timestamp);
//         }
//         const tapPollList = [];
//         for (let index = 0; index < tapPollAddresses.length; index++) {
//           const address = tapPollAddresses[index];
//           const startTime = await web3.eth.call({
//             to: address,
//             data: "0xc828371e00000000000000000000000000000000000000000000000000000000"
//           });
//           tapPollList.push({ address: address, startTime: await web3.utils.toDecimal(startTime), endTime: endTimes[index] });
//         }
//         res.status(200).send({
//           message: "Success",
//           data: tapPollList,
//           reason: ""
//         });
//       } catch (error) {
//         console.log(error.message);
//         return res.status(400).send({
//           message: "Failed",
//           reason: "Couldn't execute",
//           data: []
//         });
//       }
//     }
//   );
// });

// //http://localhost:3000/projectweb3/xfrPollHistory?projectid=5bc20f6bd371e27719f3c358&network=rinkeby
// router.get("/xfrPollHistory", function(req, res, next) {
//   if (!("network" in req.query && "projectid" in req.query)) return res.status(400).send("Bad Request");
//   global.db.collection("project_details").findOne(
//     { _id: ObjectID(req.query.projectid) },
//     {
//       projection: {
//         pollFactoryAddress: 1,
//         version: 1
//       }
//     },
//     async (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send({
//           message: "Failed",
//           reason: "Database error!",
//           data: []
//         });
//       }
//       const web3 = web3Read(req.query.network);
//       try {
//         const xfrPollAddresses = [];
//         const instance = await contractInstance("PollFactory", result.pollFactoryAddress, req.query.network, result.version);
//         const eventArray = await instance.getPastEvents("XfrPollCreated", {
//           filter: {},
//           fromBlock: 0,
//           toBlock: "latest"
//         });
//         eventArray.map(item => {
//           const { returnValues } = item || {};
//           const { xfrAddress } = returnValues || {};
//           xfrPollAddresses.push(xfrAddress);
//         });
//         const xfrPollList = [];
//         for (let index = 0; index < xfrPollAddresses.length; index++) {
//           const address = xfrPollAddresses[index];
//           const startTime = await web3.eth.call({
//             to: address,
//             data: "0xc828371e00000000000000000000000000000000000000000000000000000000"
//           });
//           const consensus = await web3.eth.call({
//             to: address,
//             data: "0x79cc935100000000000000000000000000000000000000000000000000000000"
//           });
//           xfrPollList.push({ address: address, startTime: await web3.utils.toDecimal(startTime), consensus: await web3.utils.fromWei(consensus) });
//         }
//         res.status(200).send({
//           message: "Success",
//           data: xfrPollList,
//           reason: ""
//         });
//       } catch (error) {
//         console.log(error.message);
//         return res.status(400).send({
//           message: "Failed",
//           reason: "Couldn't execute",
//           data: []
//         });
//       }
//     }
//   );
// });

//http://localhost:3000/projectweb3/votehistogram?projectid=5bc20f6bd371e27719f3c358&network=rinkeby
router.get("/votehistogram", function(req, res, next) {
  if (!("network" in req.query && "projectid" in req.query)) return res.status(400).send("Bad Request");
  let collectionName = "project_details";
  if (req.query.network !== "main") {
    collectionName = collectionName + "_" + req.query.network;
  }
  global.db.collection(collectionName).findOne(
    { _id: ObjectID(req.query.projectid) },
    {
      projection: {
        version: 1,
        vaultAddress: 1,
        daicoTokenAddress: 1,
        capPercent: 1,
        totalMintableSupply: 1
      }
    },
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
      }
      try {
        const tokenInstance = await contractInstance("DaicoToken", result.daicoTokenAddress, req.query.network, result.version);
        const totalMintableSupply = result.totalMintableSupply;
        const transferEvents = await tokenInstance.getPastEvents("Transfer", {
          filter: {},
          fromBlock: "6500000",
          toBlock: "latest"
        });

        const balances = {};

        transferEvents.forEach(element => {
          const returnValues = element.returnValues;
          const from = returnValues.from;
          const to = returnValues.to;
          const value = returnValues.value;
          if (from !== "0x0000000000000000000000000000000000000000")
            balances[from] = !isNaN(balances[from]) ? balances[from] - parseFloat(value) : -parseFloat(value);
          if (to !== "0x0000000000000000000000000000000000000000")
            balances[to] = !isNaN(balances[to]) ? balances[to] + parseFloat(value) : parseFloat(value);
        });
        const capPercent = parseFloat(result.capPercent) / 100;
        const bool1 = capPercent % 1 === 0;
        const bool2 = (capPercent * 10) % 1 === 0;
        // const bool3 = capPercent * 100 % 1 === 0;
        const fixedSize = bool1 ? 2 : bool2 ? 3 : 4;
        let binDict = {};
        const binCount = 100;
        let diff = capPercent / binCount;
        for (let i = 0; i < binCount; i++) {
          binDict[i] = {};
          binDict[i]["min"] = (diff * i).toFixed(fixedSize);
          binDict[i]["max"] = (diff * (i + 1)).toFixed(fixedSize);
          binDict[i]["voters"] = 0;
        }
        let activeVotingTokens = 0;
        for (const key in balances) {
          let temp = parseFloat(balances[key]);
          let capBalance = (capPercent / 100) * parseFloat(totalMintableSupply);
          let capped = false;
          if (temp >= capBalance) {
            temp = capBalance;
            capped = true;
          }
          activeVotingTokens += temp;
          if (temp > 0) {
            if (!capped) {
              binDict[Math.floor((temp * 100) / (parseFloat(totalMintableSupply) * diff))]["voters"] += 1;
            } else {
              binDict[99]["voters"] += 1;
            }
          }
        }
        res.status(200).send({
          message: "Success",
          data: { binDict: binDict, collectiveVoteWeight: ((activeVotingTokens * 100) / parseFloat(totalMintableSupply)).toFixed(2) },
          reason: ""
        });
      } catch (error) {
        console.log(error);
        return res.status(400).send({
          message: "Failed",
          reason: "Couldn't execute",
          data: []
        });
      }
    }
  );
});

/*Fetch kill poll history table */
//localhost:2020/projectweb3/lockedtokens?pollfactoryaddress=0xe99F62a32f37231F1781311564289F7396bb5D39&useraddress=0x593efc224e3742B9aDf38B0eE333cAd078cb2105
router.get("/lockedtokens", function(req, res, next) {
  if ("pollfactoryaddress" in req.query && "network" in req.query && "useraddress" in req.query) {
    let collectionName = "pollHistory";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    global.db.collection(collectionName).findOne(
      {
        pollFactoryAddress: req.query.pollfactoryaddress
      },
      { projection: { killPollArray: 1, tapPollArray: 1, xfrPollArray: 1, _id: 0 } },
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send({
            message: "Failed",
            reason: "Database error!",
            data: []
          });
          return;
        }
        try {
          const web3 = web3Read(req.query.network);
          const pollAddresses = [];
          const pollPromises = [];
          const pollLocked = [];
          for (let index = 0; index < result.killPollArray.length; index++) {
            const element = result.killPollArray[index];
            pollAddresses.push(element.address);
            pollPromises.push(
              web3.eth.call({
                to: element.address,
                data: "0xa3ec138d" + "000000000000000000000000" + req.query.useraddress.substring(2)
              })
            );
          }
          for (let index = 0; index < result.tapPollArray.length; index++) {
            const element = result.tapPollArray[index];
            pollAddresses.push(element.address);
            pollPromises.push(
              web3.eth.call({
                to: element.address,
                data: "0xa3ec138d" + "000000000000000000000000" + req.query.useraddress.substring(2)
              })
            );
          }
          for (let index = 0; index < result.xfrPollArray.length; index++) {
            const element = result.xfrPollArray[index];
            pollAddresses.push(element.address);
            pollPromises.push(
              web3.eth.call({
                to: element.address,
                data: "0xa3ec138d" + "000000000000000000000000" + req.query.useraddress.substring(2)
              })
            );
          }
          Promise.all(pollPromises).then(resp => {
            for (let index = 0; index < resp.length; index++) {
              const element = resp[index];
              const voted = web3.utils.toDecimal(element.substring(0, 66));
              if (voted === 1) pollLocked.push({ address: pollAddresses[index], voted: true });
            }
            res.status(200).send({
              message: "Success",
              data: pollLocked,
              reason: ""
            });
          });
        } catch (error) {
          console.log(error);
        }
      }
    );
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

module.exports = router;
