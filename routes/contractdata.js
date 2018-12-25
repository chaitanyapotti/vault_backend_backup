var express = require("express");
var router = express.Router();

const getContractDetails = require("../utils/getContractDetails");

function validateInputs(req, res) {
  if (!("version" in req.query && "name" in req.query)) return res.status(400).send("Bad Request");
}

//localhost:3000/web3/contractdata?version=1&name=CrowdSale
router.get("/", (req, res) => {
  validateInputs(req, res);
  getContractDetails(req.query.version, req.query.name)
    .then(response => {
      res.status(200).send({
        message: req.query.name,
        data: response
      });
    })
    .catch(err => res.status(400).send(err.message));
});

module.exports = router;
