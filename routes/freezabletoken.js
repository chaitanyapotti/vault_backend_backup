var express = require("express");
var router = express.Router();

const contractInstance = require("../utils/contractInstance");
const web3Read = require("../utils/web3Read");

function validateInputs(req, res) {
  if (!("network" in req.query && "address" in req.query && "version" in req.query)) return res.status(400).send("Bad Request");
  if (!(req.query.network in global.supportedNetworks)) return res.status(400).send("Not a supported network");
}

//localhost:3000/web3/freezabletoken/isr3ended?address=0xaE9BDE445854D6ACFbC2834b495BC8D814494078&network=rinkeby&version=1
router.get("/isr3ended", async (req, res) => {
  const web3 = web3Read(req.query.network);
  try {
    const mintingFinished = await web3.eth.call({
      to: req.query.address,
      data: "0x05d2035b00000000000000000000000000000000000000000000000000000000"
    });
    const returnValue = web3.utils.toDecimal(mintingFinished) === 0 ? "false" : "true";
    res.status(200).send({
      message: "Success",
      info: "boolean",
      data: returnValue,
      units: "this is a boolean"
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({
      message: "Failed",
      reason: "Couldn't execute",
      data: ""
    });
  }
  // validateInputs(req, res, true);
  // contractInstance("FreezableToken", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.mintingFinished().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "boolean",
  //       data: result.toString(),
  //       units: "this is a boolean"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

module.exports = router;
