const web3Read = require("./web3Read");
const getContractDetails = require("./getContractDetails");

module.exports = (name, address, network, version) => {
  return new Promise((resolve, reject) => {
    const web3 = web3Read(network);
    getContractDetails(version, name)
      .then(response => {
        const isCheckSummed = web3.utils.checkAddressChecksum(address);
        if (!isCheckSummed) {
          reject(new Error("Not a valid address"));
        } else {
          resolve(new web3.eth.Contract(response.abi, address));
        }
      })
      .catch(err => reject(err.message));
  });
};
