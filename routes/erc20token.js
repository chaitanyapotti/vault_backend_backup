var express = require("express");
var router = express.Router();

const contractInstance = require("../utils/contractInstance");
const web3Read = require("../utils/web3Read");

function validateInputs(req, res, special = true) {
  if (!("network" in req.query && "address" in req.query && "version" in req.query)) return res.status(400).send("Bad Request");
  if (!(req.query.network in global.supportedNetworks)) return res.status(400).send("Not a supported network");
  if (special) {
    if (!("useraddress" in req.query)) return res.status(400).send("Bad Request");
    const web3 = web3Read(req.query.network);
    const isCheckSummed = web3.utils.checkAddressChecksum(req.query.useraddress);
    if (!isCheckSummed) {
      return res.status(400).send("Not a valid address");
    }
  }
}

//localhost:3000/web3/erc20token/tokenbalance?address=0xaE9BDE445854D6ACFbC2834b495BC8D814494078&network=rinkeby&useraddress=0x6c86522d0a9808970A62CEaB2704d44ec6E63e92&version=1
router.get("/tokenbalance", (req, res) => {
  validateInputs(req, res);
  contractInstance("DaicoToken", req.query.address, req.query.network, req.query.version)
    .then(instance => instance.methods.balanceOf(req.query.useraddress).call())
    .then(result => {
      res.status(200).send({
        message: "Success",
        info: "This has decimals of 18",
        data: result.toString(),
        units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
      });
    })
    .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/erc20token/tokensundergovernance?address=0xaE9BDE445854D6ACFbC2834b495BC8D814494078&network=rinkeby&version=1
router.get("/tokensundergovernance", async (req, res) => {
  const web3 = web3Read(req.query.network);
  try {
    const tokens = await web3.eth.call({
      to: req.query.address,
      data: "0xdd06bfba00000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "This has decimals of 18. Divide poll results with this to get percentage",
      data: web3.utils.toWei(web3.utils.fromWei(tokens)).toString(),
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
  // validateInputs(req, res, false);
  // contractInstance("DaicoToken", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.getTokensUnderGovernance().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "This has decimals of 18. Divide poll results with this to get percentage",
  //       data: result.toString(),
  //       units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/erc20token/totalsupply?address=0xaE9BDE445854D6ACFbC2834b495BC8D814494078&network=rinkeby&version=1
router.get("/totalsupply", async (req, res) => {
  const web3 = web3Read(req.query.network);
  try {
    const tokens = await web3.eth.call({
      to: req.query.address,
      data: "0x18160ddd00000000000000000000000000000000000000000000000000000000"
    });
    res.status(200).send({
      message: "Success",
      info: "This has decimals of 18. Divide poll results with this to get percentage",
      data: web3.utils.toWei(web3.utils.fromWei(tokens)).toString(),
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
  // validateInputs(req, res, false);
  // contractInstance("DaicoToken", req.query.address, req.query.network, req.query.version)
  //   .then(instance => instance.methods.totalSupply().call())
  //   .then(result => {
  //     res.status(200).send({
  //       message: "Success",
  //       info: "This has decimals of 18. Divide poll results with this to get percentage",
  //       data: result.toString(),
  //       units: "divide by 10^18 or use web3.utils.fromWei() to get normal token count"
  //     });
  //   })
  //   .catch(err => res.status(400).send(err.message));
});

//localhost:3000/web3/erc20token/isuseraccountfrozen?address=0xaE9BDE445854D6ACFbC2834b495BC8D814494078&network=rinkeby&useraddress=0x6c86522d0a9808970A62CEaB2704d44ec6E63e92&version=1
router.get("/isuseraccountfrozen", (req, res) => {
  validateInputs(req, res);
  contractInstance("DaicoToken", req.query.address, req.query.network, req.query.version)
    .then(instance => instance.methods.isFrozen(req.query.useraddress).call())
    .then(result => {
      res.status(200).send({
        message: "Success",
        info: "boolean",
        data: result.toString(),
        units: "this is a boolean"
      });
    })
    .catch(err => res.status(400).send(err.message));
});

module.exports = router;
