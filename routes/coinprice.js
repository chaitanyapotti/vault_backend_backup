var express = require("express");
var router = express.Router();

function validateInputs(req, res) {
  if (!("ticker" in req.query)) return res.status(400).send("Bad Request");
}

//localhost:3000/coinprice?ticker=ETH
router.get("/", (req, res) => {
  validateInputs(req, res);
  global.db.collection("externalPrice").findOne(
    {
      ["tickerData." + req.query.ticker]: { $exists: true }
    },
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
      }
      if (result) {
        const { tickerData } = result || {};
        const { [req.query.ticker]: tokenData } = tickerData || {};
        return res.status(200).send({
          message: "Success",
          data: tokenData,
          reason: "Token price in USD"
        });
      }
      return res.status(400).send({
        message: "Ticker doesn't exist",
        reason: "Data not present in database",
        data: {}
      });
    }
  );
});

module.exports = router;
