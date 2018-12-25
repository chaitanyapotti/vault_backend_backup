var express = require("express");
var router = express.Router();

const contractInstance = require("../utils/contractInstance");
const web3Read = require("../utils/web3Read");

function validateInputs(req, res) {
  if (!("network" in req.query && "address" in req.query && "version" in req.query)) return res.status(400).send("Bad Request");
  if (!(req.query.network in global.supportedNetworks)) return res.status(400).send("Not a supported network");
}

//localhost:3000/web3/pollfactory/killconsensus?address=0x6186351F428eC25eab4Ed4E1619dCd0d5cd38C40&network=rinkeby&version=1
router.get("/killconsensus", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const address = await web3.eth.call({
      to: req.query.address,
      data: "0x698e2c3e00000000000000000000000000000000000000000000000000000000"
    });
    const voteTally = await web3.eth.call({
      to: web3.utils.toHex(web3.utils.toBN(address)),
      data: "0x79cc935100000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
      data: web3.utils.toWei(web3.utils.fromWei(voteTally)).toString(),
      units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.currentKillPoll().call())
  //   .then(address => contractInstance("IPoll", address, req.query.network, req.query.version))
  //   .then(instance => instance.methods.getVoteTally(0).call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
  //       data: result.toString(),
  //       units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:2020/web3/pollfactory/killvotecount?address=0x6186351F428eC25eab4Ed4E1619dCd0d5cd38C40&network=rinkeby&version=1
router.get("/killvotecount", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const address = await web3.eth.call({
      to: req.query.address,
      data: "0x698e2c3e00000000000000000000000000000000000000000000000000000000"
    });
    const voterCount = await web3.eth.call({
      to: web3.utils.toHex(web3.utils.toBN(address)),
      data: "0xe92e5c3400000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
      data: web3.utils.toDecimal(voterCount).toString(),
      units: "This represents the voter count against 0 proposal"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
});

//localhost:3000/web3/pollfactory/totaletherraised?address=0x57682526046f924bE2961a6df14702ba8679F95f&network=rinkeby&version=1
router.get("/totaletherraised", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const totalEtherRaised = await web3.eth.call({
      to: req.query.address,
      data: "0x691a584200000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "This has decimals of 18",
      data: web3.utils.toBN(totalEtherRaised).toString(),
      units: "divide by 10^18 or use web3.utils.fromWei() to get normal ether amount"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.totalEtherRaised().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "This has decimals of 18",
  //       data: result.toString(),
  //       units: "divide by 10^18 or use web3.utils.fromWei() to get normal ether amount"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/tappollconsensus?address=0x6186351F428eC25eab4Ed4E1619dCd0d5cd38C40&network=rinkeby&version=1
router.get("/tappollconsensus", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const tapPollAddress = await web3.eth.call({
      to: req.query.address,
      data: "0xcae6b9c500000000000000000000000000000000000000000000000000000000"
    });
    const tapAddress = web3.utils.toHex(web3.utils.toBN(tapPollAddress));
    if (tapAddress.toString() === "0x0000000000000000000000000000000000000000" || tapAddress.toString() === "0x0") {
      return res.status(200).send({
        message: "Success",
        info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
        data: "No Poll",
        units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
      });
    } else {
      const voteTally = await web3.eth.call({
        to: tapAddress,
        data: "0x79cc935100000000000000000000000000000000000000000000000000000000"
      });
      res.status(200).send({
        message: "Success",
        info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
        data: web3.utils.toBN(voteTally).toString(),
        units: "divide by 10^18 or use web3.utils.fromWei() to get normal ether amount"
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.tapPoll().call())
  //   .then(async address => {
  //     if (address === "0x0000000000000000000000000000000000000000") {
  //       res.status(200).send({
  //         message: "Success",
  //         info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
  //         data: "No Poll",
  //         units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
  //       });
  //     } else {
  //       const instance = await contractInstance("IPoll", address, req.query.network, req.query.version);
  //       const tally = await instance.methods.getVoteTally(0).call();
  //       res.status(200).send({
  //         message: "Success",
  //         info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
  //         data: tally.toString(),
  //         units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
  //       });
  //     }
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/currentkillpollindex?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1
router.get("/currentkillpollindex", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const result = await web3.eth.call({
      to: req.query.address,
      data: "0x1b59555c00000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "Index starts from 0",
      data: web3.utils.toBN(result).toString(),
      units: ""
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.currentKillPollIndex().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "Index starts from 0",
  //       data: result.toString(),
  //       units: ""
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/killpollstartdate?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1
router.get("/killpollstartdate", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const result = await web3.eth.call({
      to: req.query.address,
      data: "0xcb21ff1d00000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "This is unix time",
      data: web3.utils.toBN(result).toString(),
      units: "unix time"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.killPollStartDate().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "This is unix time",
  //       data: result.toString(),
  //       units: "unix time"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/cappercent?address=0x6186351F428eC25eab4Ed4E1619dCd0d5cd38C40&network=rinkeby&version=1
router.get("/cappercent", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const result = await web3.eth.call({
      to: req.query.address,
      data: "0x259845f800000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "divide this by 100. result is 100* percentage",
      data: web3.utils.toBN(result).toString(),
      units: "100*percentage"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.capPercent().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "divide this by 100. result is 100* percentage",
  //       data: result.toString(),
  //       units: "100*percentage"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/currenttap?address=0x6186351F428eC25eab4Ed4E1619dCd0d5cd38C40&network=rinkeby&version=1
router.get("/currenttap", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const result = await web3.eth.call({
      to: req.query.address,
      data: "0xa59053db00000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "units are wei/sec",
      data: web3.utils.toBN(result).toString(),
      units: "wei/sec"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.currentTap().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "units are wei/sec",
  //       data: result.toString(),
  //       units: "wei/sec"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/killpollvote?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1&useraddress=0xc8D1412Fc5eC411d77a9Ef87e2e4E3d14bd1a670
router.get("/killpollvote", (req, res) => {
  validateInputs(req, res);
  if (!("useraddress" in req.query)) return res.status(400).send("Bad Request");
  const web3 = web3Read(req.query.network);
  web3.eth
    .call({
      to: req.query.address,
      data: "0x698e2c3e00000000000000000000000000000000000000000000000000000000"
    })
    .then(currentKillPollAddress => {
      const newAddress = web3.utils.toChecksumAddress(web3.utils.toHex(web3.utils.toBN(currentKillPollAddress)));
      contractInstance("BoundPoll", newAddress, req.query.network, req.query.version).then(iPollInstance => {
        iPollInstance.methods
          .voters(req.query.useraddress)
          .call()
          .then(response => {
            const { voted } = response;
            res.status(200).send({
              message: "Success",
              info: "It is a boolean",
              data: { killPollAddress: newAddress, voted: voted.toString() },
              units: "boolean"
            });
          })
          .catch(err => res.status(400).send(err.message));
      });
    })
    .catch(err => res.status(400).send(err.message));
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.currentKillPoll().call())
  //   .then(currentKillPollAddress =>
  //     contractInstance("BoundPoll", currentKillPollAddress, req.query.network, req.query.version)
  //       .then(iPollInstance => {
  //         iPollInstance.methods
  //           .voters(req.query.useraddress)
  //           .call()
  //           .then(response => {
  //             const { voted } = response;
  //             res.status(200).send({
  //               message: "Success",
  //               info: "It is a boolean",
  //               data: { killPollAddress: currentKillPollAddress, voted: voted.toString() },
  //               units: "boolean"
  //             });
  //           })
  //           .catch(err => res.status(400).send(err.message));
  //       })
  //       .catch(err => res.status(400).send(err.message))
  //   )
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/tappollvote?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1&useraddress=0xc8D1412Fc5eC411d77a9Ef87e2e4E3d14bd1a670
router.get("/tappollvote", (req, res) => {
  validateInputs(req, res);
  if (!("useraddress" in req.query)) return res.status(400).send("Bad Request");
  const web3 = web3Read(req.query.network);
  web3.eth
    .call({
      to: req.query.address,
      data: "0xcae6b9c500000000000000000000000000000000000000000000000000000000"
    })
    .then(tapPollAddress => web3.utils.toHex(web3.utils.toBN(tapPollAddress)))
    .then(async currentTapPollAddress => {
      if (currentTapPollAddress.toString() === "0x0000000000000000000000000000000000000000" || currentTapPollAddress.toString() === "0x0") {
        return res.status(200).send({
          message: "Success",
          info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
          data: "No Poll",
          units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
        });
      } else {
        const newAddress = web3.utils.toChecksumAddress(currentTapPollAddress);
        const instance = await contractInstance("UnBoundPoll", newAddress, req.query.network, req.query.version);
        instance.methods
          .voters(req.query.useraddress)
          .call()
          .then(response => {
            const { voted } = response;
            res.status(200).send({
              message: "Success",
              info: "It is a boolean",
              data: { tapPollAddress: newAddress, voted: voted.toString() },
              units: "boolean"
            });
          });
      }
    })
    .catch(err => res.status(400).send(err.message));
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.tapPoll().call())
  //   .then(async currentTapPollAddress => {
  //     if (currentTapPollAddress === "0x0000000000000000000000000000000000000000") {
  //       res.status(200).send({
  //         message: "Success",
  //         info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
  //         data: "No Poll",
  //         units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
  //       });
  //     } else {
  //       const instance = await contractInstance("UnBoundPoll", currentTapPollAddress, req.query.network, req.query.version);
  //       instance.methods
  //         .voters(req.query.useraddress)
  //         .call()
  //         .then(response => {
  //           const { voted } = response;
  //           res.status(200).send({
  //             message: "Success",
  //             info: "It is a boolean",
  //             data: { tapPollAddress: currentTapPollAddress, voted: voted.toString() },
  //             units: "boolean"
  //           });
  //         });
  //     }
  //   })
  //   .catch(err => res.status(400).send(err.message));
});
//localhost:3000/web3/pollfactory/withdrawableamount?address=0x6186351F428eC25eab4Ed4E1619dCd0d5cd38C40&network=rinkeby&version=1
router.get("/withdrawableamount", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const promiseArray = [];
    const pivotTimePromise = await web3.eth.call({
      to: req.query.address,
      data: "0x32486b2700000000000000000000000000000000000000000000000000000000"
    });
    promiseArray.push(pivotTimePromise);
    const currentTapPromise = await web3.eth.call({
      to: req.query.address,
      data: "0xa59053db00000000000000000000000000000000000000000000000000000000"
    });
    promiseArray.push(currentTapPromise);
    const splineHeightAtPivotPromise = await web3.eth.call({
      to: req.query.address,
      data: "0xcf65929e00000000000000000000000000000000000000000000000000000000"
    });
    promiseArray.push(splineHeightAtPivotPromise);
    Promise.all(promiseArray)
      .then(response => {
        const pivotTime = response[0];
        const currentTap = response[1];
        const splineHeightAtPivot = response[2];
        const amount =
          parseFloat(web3.utils.toWei(web3.utils.fromWei(splineHeightAtPivot))) +
          ((new Date() - new Date(web3.utils.toDecimal(pivotTime) * 1000)) * parseFloat(web3.utils.toWei(web3.utils.fromWei(currentTap)))) / 1000;
        console.log(amount);
        res.status(200).send({
          message: "Success",
          info: "This has decimals of 18.",
          data: amount,
          units: "divide by 10^18 or use web3.utils.fromWei() to get ether amount"
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
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(async instance => {
  //     const pivotTime = await instance.methods.pivotTime().call();
  //     const currentTap = await instance.methods.currentTap().call();
  //     const splineHeightAtPivot = await instance.methods.splineHeightAtPivot().call();
  //     const amount = parseFloat(splineHeightAtPivot) + ((new Date() - new Date(pivotTime * 1000)) * parseFloat(currentTap)) / 1000;
  //     res.status(200).send({
  //       message: "Success",
  //       info: "This has decimals of 18.",
  //       data: amount,
  //       units: "divide by 10^18 or use web3.utils.fromWei() to get ether amount"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/state?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1
router.get("/state", async (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  try {
    const treasuryState = await web3.eth.call({
      to: req.query.address,
      data: "0xc19d93fb00000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "this is an index in an array. Starts from zero. CrowdSale,CrowdSaleRefund,Governance,Killed",
      data: (parseInt(web3.utils.toDecimal(treasuryState), 10) + 1).toString(),
      units: "index"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.state().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "this is an index in an array. Starts from zero. CrowdSale,CrowdSaleRefund,Governance,Killed",
  //       data: (parseInt(result, 10) + 1).toString(),
  //       units: "index"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/remainingbalance?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1
router.get("/remainingbalance", (req, res) => {
  validateInputs(req, res);
  const web3 = web3Read(req.query.network);
  web3.eth
    .getBalance(req.query.address)
    .then(result => {
      res.status(200).send({
        message: "Success",
        info: "This has decimals of 18.",
        data: result.toString(),
        units: "divide by 10^18 or use web3.utils.fromWei() to get ether amount"
      });
    })
    .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/xfrpolldata?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1
router.get("/xfrpolldata", (req, res) => {
  validateInputs(req, res);
  contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
    .then(async instance => {
      const poll1Data = (await instance.methods.xfrPollData(0).call()) || {};
      const poll2Data = (await instance.methods.xfrPollData(1).call()) || {};
      const details = { poll1Data, poll2Data };
      return details;
    })
    .then(async details => {
      let poll1;
      let poll2;
      let poll1Consensus;
      let poll2Consensus;
      let poll1endTime;
      let poll2endTime;
      const { poll1Data, poll2Data } = details || {};
      if (poll1Data && poll1Data.amountRequested !== "0") {
        poll1 = await contractInstance("BoundPoll", details.poll1Data.xfrPollAddress, req.query.network, req.query.version);
        poll1Consensus = await poll1.methods.getVoteTally(0).call();
        poll1endTime = await poll1.methods.getEndTime().call();
      }
      if (poll2Data && poll2Data.amountRequested !== "0") {
        poll2 = await contractInstance("BoundPoll", details.poll2Data.xfrPollAddress, req.query.network, req.query.version);
        poll2Consensus = await poll2.methods.getVoteTally(0).call();
        poll2endTime = await poll2.methods.getEndTime().call();
      }
      res.status(200).send({
        message: "Success",
        info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
        data: {
          poll1: {
            amount: details.poll1Data.amountRequested,
            consensus: poll1Consensus,
            endTime: poll1endTime,
            address: details.poll1Data.xfrPollAddress
          },
          poll2: {
            amount: details.poll2Data.amountRequested,
            consensus: poll2Consensus,
            endTime: poll2endTime,
            address: details.poll2Data.xfrPollAddress
          }
        },
        units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
      });
    })
    .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/pollfactory/xfrpollvote?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1&useraddress=0xc8D1412Fc5eC411d77a9Ef87e2e4E3d14bd1a670
router.get("/xfrpollvote", (req, res) => {
  validateInputs(req, res);
  if (!("useraddress" in req.query)) return res.status(400).send("Bad Request");
  contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
    .then(async instance => {
      const poll1Data = (await instance.methods.xfrPollData(0).call()) || {};
      const poll2Data = (await instance.methods.xfrPollData(1).call()) || {};
      const details = { poll1Data, poll2Data };
      return details;
    })
    .then(async details => {
      let poll1;
      let poll2;
      let poll1Vote;
      let poll2Vote;
      const { poll1Data, poll2Data } = details || {};
      if (poll1Data && poll1Data.amountRequested !== "0") {
        poll1 = await contractInstance("BoundPoll", details.poll1Data.xfrPollAddress, req.query.network, req.query.version);
        const vote1 = await poll1.methods.voters(req.query.useraddress).call();
        poll1Vote = vote1.voted;
      }
      if (poll2Data && poll2Data.amountRequested !== "0") {
        poll2 = await contractInstance("BoundPoll", details.poll2Data.xfrPollAddress, req.query.network, req.query.version);
        const vote2 = await poll2.methods.voters(req.query.useraddress).call();
        poll2Vote = vote2.voted;
      }
      res.status(200).send({
        message: "Success",
        info: "This has decimals of 18. Divide this with tokensundergovernance to get %",
        data: [
          {
            address: details.poll1Data.xfrPollAddress,
            voted: poll1Vote
          },
          {
            address: details.poll2Data.xfrPollAddress,
            voted: poll2Vote
          }
        ],
        units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
      });
    })
    .catch(err => res.status(400).send(err.message));
});

//localhost:2020/web3/pollfactory/spendcurve?address=0xe594712F1c6Df38a0872b7835f35cA9f9983320c&network=rinkeby&version=1&crowdsaleaddress=
router.get("/spendcurve", (req, res, next) => {
  validateInputs(req, res);
  if (!("crowdsaleaddress" in req.query)) return res.status(400).send("Bad Request");
  const web3 = web3Read(req.query.network);
  try {
    contractInstance("PollFactory", req.query.address, req.query.network, req.query.version)
      .then(async instance => {
        const promiseArray = [];
        const increaseTapArrayPromise = instance.getPastEvents("TapIncreased", {
          filter: {},
          fromBlock: 0,
          toBlock: "latest"
        });
        const withdrawArrayPromise = instance.getPastEvents("Withdraw", {
          filter: {},
          fromBlock: 0,
          toBlock: "latest"
        });
        const allXfrArrayPromise = instance.getPastEvents("XfrPollCreated", {
          filter: {},
          fromBlock: 0,
          toBlock: "latest"
        });
        const withdrawXfrArrayPromise = instance.getPastEvents("XfrWithdraw", {
          filter: {},
          fromBlock: 0,
          toBlock: "latest"
        });
        const crowdSaleInstance = await contractInstance("CrowdSale", req.query.crowdsaleaddress, req.query.network, req.query.version);
        const contributionEventArrayPromise = crowdSaleInstance.getPastEvents("LogContribution", {
          filter: {},
          fromBlock: 0,
          toBlock: "latest"
        });
        promiseArray.push(increaseTapArrayPromise);
        promiseArray.push(withdrawArrayPromise);
        promiseArray.push(allXfrArrayPromise);
        promiseArray.push(withdrawXfrArrayPromise);
        promiseArray.push(contributionEventArrayPromise);
        Promise.all(promiseArray).then(async result => {
          try {
            const increaseTapArray = result[0];
            const withdrawArray = result[1];
            const allXfrArray = result[2];
            const withdrawXfrArray = result[3];
            const contributionArray = result[4];
            const tapData = [];
            const withdrawData = [];
            const allXfrData = [];
            const withdrawXfrData = [];
            const contributionData = [];
            for (let index = 0; index < increaseTapArray.length; index++) {
              const item = increaseTapArray[index];
              const { returnValues, blockNumber } = item || {};
              const { currentTap } = returnValues || {};
              const blockObject = await web3.eth.getBlock(blockNumber);
              const { timestamp } = blockObject;
              tapData.push({ timestamp: timestamp, amount: currentTap });
            }
            for (let index = 0; index < withdrawArray.length; index++) {
              const item = withdrawArray[index];
              const { returnValues, blockNumber } = item || {};
              const { amountWei } = returnValues || {};
              const blockObject = await web3.eth.getBlock(blockNumber);
              const { timestamp } = blockObject;
              const amount = amountWei ? await web3.utils.fromWei(amountWei.toString(), "ether") : 0;
              withdrawData.push({ timestamp: timestamp, amount: amount });
            }
            for (let index = 0; index < withdrawXfrArray.length; index++) {
              const item = withdrawXfrArray[index];
              const { returnValues, blockNumber } = item || {};
              const { amountWei, contractAddress, consensus } = returnValues || {};
              const blockObject = await web3.eth.getBlock(blockNumber);
              const { timestamp } = blockObject;
              const amount = amountWei ? await web3.utils.fromWei(amountWei.toString(), "ether") : 0;
              withdrawXfrData.push({ timestamp: timestamp, amount: amount, address: contractAddress, consensus: consensus });
            }
            for (let index = 0; index < allXfrArray.length; index++) {
              const item = allXfrArray[index];
              const { returnValues, blockNumber } = item || {};
              const { xfrAddress } = returnValues || {};
              const blockObject = await web3.eth.getBlock(blockNumber);
              const { timestamp: startTime } = blockObject;
              const foundElement = withdrawXfrData.find(x => x.address === xfrAddress) || {};
              let { timestamp, consensus, amount } = foundElement || {};
              if (!foundElement) {
                const tempConsensus = await web3.utils.fromWei(
                  await web3.utils
                    .toBN(
                      await web3.eth.call({
                        to: address,
                        data: "0x79cc935100000000000000000000000000000000000000000000000000000000"
                      })
                    )
                    .toString(),
                  "ether"
                );
                consensus = parseFloat(tempConsensus);
              }
              allXfrData.push({
                timestamp: timestamp,
                startTime: startTime,
                xfrAddress: xfrAddress,
                consensus: await web3.utils.fromWei(consensus ? await web3.utils.toBN(consensus) : "0", "ether"),
                amount: await web3.utils.fromWei(amount ? await web3.utils.toBN(amount) : "0")
              });
            }
            for (let index = 0; index < contributionArray.length; index++) {
              const item = contributionArray[index];
              const { returnValues, blockNumber } = item || {};
              const { etherAmount } = returnValues || {};
              const blockObject = await web3.eth.getBlock(blockNumber);
              const { timestamp } = blockObject;
              const amount = etherAmount ? await web3.utils.fromWei(etherAmount.toString(), "ether") : 0;
              contributionData.push({ timestamp: timestamp, amount: amount });
            }

            res.status(200).send({
              message: "Success",
              data: {
                tapData: tapData,
                withdrawData: withdrawData,
                withdrawXfrData: withdrawXfrData,
                allXfrData: allXfrData,
                contributionData: contributionData
              },
              // data: {
              //   allXfrData: [
              //     {
              //       consensus: "625000000",
              //       timestamp: 1540893901,
              //       xfrAddress: "0xEfA52B1F0b90f0747d91607e3ca5fD3249F97A42",
              //       startTime: 1540883901,
              //       amount: "0.35"
              //     },
              //     {
              //       consensus: "625000000",
              //       xfrAddress: "0xEfA52B1F0b90f0747d91607e3ca5fD4249F97A42",
              //       startTime: 1540883901,
              //       amount: "0.3"
              //     }
              //   ],
              //   tapData: [
              //     {
              //       amount: "578703703704",
              //       timestamp: 1540684800
              //     },
              //     {
              //       amount: "868055555556",
              //       timestamp: 1541030400
              //     }
              //   ],
              //   withdrawData: [{ amount: "0.5", timestamp: 1540425600 }, { amount: "0.5", timestamp: 1541222822 }],
              //   withdrawXfrData: [
              //     {
              //       amount: "0.35",
              //       timestamp: 1540893901,
              //       address: "0xEfA52B1F0b90f0747d91607e3ca5fD3249F97A42",
              //       consensus: "625000000"
              //     }
              //   ],
              //   contributionData: [
              //     {
              //       amount: "0.35",
              //       timestamp: 1542412800
              //     },
              //     {
              //       amount: "0.24",
              //       timestamp: 1542499200
              //     }
              //   ]
              // },
              reason: ""
            });
          } catch (err) {
            console.log(err);
            return res.status(400).send({
              message: "Failed",
              reason: "Couldn't execute",
              data: []
            });
          }
        });
      })
      .catch(err => {
        console.log(err.message);
        return res.status(400).send({
          message: "Failed",
          reason: "Couldn't execute",
          data: []
        });
      });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: []
    });
  }
});

module.exports = router;
