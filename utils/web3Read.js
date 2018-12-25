const Web3 = require("web3");

const kovanInfura = "https://kovan.infura.io/v3/dc22c9c6245742069d5fe663bfa8a698";
const rinkebyInfura = "https://rinkeby.infura.io/v3/dc22c9c6245742069d5fe663bfa8a698";
const mainnetInfura = "https://mainnet.infura.io/v3/dc22c9c6245742069d5fe663bfa8a698";
const localNetwork = "http://127.0.0.1:7545";

const web3Read = function(network) {
  switch (network) {
    case "rinkeby":
      return new Web3(rinkebyInfura);
    case "kovan":
      return new Web3(kovanInfura);
    case "main":
      return new Web3(mainnetInfura);
    case "local":
    default:
      return new Web3(localNetwork);
  }
};

module.exports = web3Read;
