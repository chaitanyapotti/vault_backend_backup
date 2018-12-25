const web3Read = require("../utils/web3Read");
const contractInstance = require("../utils/contractInstance");
const network = "local";
const web3 = web3Read(network);
const path = require("path");
//run truffle migrate --network development --reset on Vault-Sc Repo
//copy contract addresses from there to here whenever you close ganache

//Local
const crowdSaleAddress = "0x8583757AD5243266fC87419673F5942eE96e0eC8";
const daicoTokenAddress = "0xB9eAFF2128C31E6045F59F9F33E5A1EF83b5A0eA";
const lockedTokenAddress = "0x305f62368F2e04aF3781618b43A68ff4F97Fa0d6";
const pollFactory = "0x8D2C582a4Df640ceAAE8cf1b1fc327C6c93c4D44";
const vaultMembership = "0x037dDdE79B169fbE12632A721151d668460d4df6";
const daicoMembership = "0xadDEB398ac3Fd9D7dFFa320a6F3850e56F44083e";

// //Rinkeby
// Vault Contract:  0x22B1281D0FaBc45b1E6dcF83bA43b049855f11bd
// Membership Contract:  0x729c10D34e789792324c0A6A58D892f6697AB508
// ERC20 Daico Token Contract:  0xaE9BDE445854D6ACFbC2834b495BC8D814494078
// Locked Token Contract:  0x3cc6cFa09702166e718D7636837805aE29cC4De7
// Poll Factory Contract:  0x6186351F428eC25eab4Ed4E1619dCd0d5cd38C40
// Crowdsale Contract:  0xA112e2EbE8657130A0E3eC540022f2929f668299

const resx = () => {
  contractInstance("CrowdSale", crowdSaleAddress, network)
    .then(instance => {
      console.log(instance.options.address);
      instance.methods
        .etherMinContrib()
        .call()
        .then(response => console.log(web3.utils.fromWei(response, "ether")));
    })
    .catch(err => console.error(err));
  console.log("Hello World");
};
//daicoToken();

const resx2 = () => {
  const pathx = path.resolve("a", "b");
  console.log(pathx);
};
console.log("Hello World 2");
//resx();
resx2();
console.log("Hello World 3");
