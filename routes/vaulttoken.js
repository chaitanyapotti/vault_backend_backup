var express = require("express");
var router = express.Router();

const contractInstance = require("../utils/contractInstance");
const web3Read = require("../utils/web3Read");

function validateInputs(req, res) {
  if (!("network" in req.query && "address" in req.query && "useraddress" in req.query && "version" in req.query))
    return res.status(400).send("Bad Request");
  if (!(req.query.network in global.supportedNetworks)) return res.status(400).send("Not a supported network");
  const web3 = web3Read(req.query.network);
  const isCheckSummed = web3.utils.checkAddressChecksum(req.query.useraddress);
  if (!isCheckSummed) {
    return res.status(400).send("Not a valid address");
  }
}

//localhost:2020/web3/vaulttoken/ismembershipapprovalpending?address=0xbCed5249cB177187C3171A454a80f854be84554A&network=rinkeby&useraddress=0x6c86522d0a9808970A62CEaB2704d44ec6E63e92&version=1
router.get("/ismembershipapprovalpending", (req, res) => {
  validateInputs(req, res, true);
  contractInstance("Vault", req.query.address, req.query.network, req.query.version)
    .then(instance => instance.methods.pendingRequests(req.query.useraddress).call())
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
