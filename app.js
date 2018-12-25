const express = require("express");
const f = require("util").format;
const logger = require("morgan");
const helmet = require("helmet");
var bodyParser = require("body-parser");
const { Storage } = require("@google-cloud/storage");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const projectsRouter = require("./routes/projects");
const crowdsaleRouter = require("./routes/crowdsale");
const erc20tokenRouter = require("./routes/erc20token");
const freezabletokenRouter = require("./routes/freezabletoken");
const pollfactoryRouter = require("./routes/pollfactory");
const membershiptokenRouter = require("./routes/membershiptoken");
const contractdataRouter = require("./routes/contractdata");
const vaulttokenRouter = require("./routes/vaulttoken");
const coinpriceRouter = require("./routes/coinprice");
const projectweb3Router = require("./routes/projectweb3");

const app = express();

const MongoClient = require("mongodb").MongoClient;

const user = encodeURIComponent(process.env.userName);
const password = encodeURIComponent(process.env.mongoPassword);
const authMechanism = "SCRAM-SHA-1";
var db;
var storageBucket;
//const url = f("mongodb://35.200.158.125:27017/?authMechanism=%s", user, password, authMechanism);

const url = f(process.env.mongoConnectionString, user, password, authMechanism);

MongoClient.connect(
  url,
  { useNewUrlParser: true },
  function(err, client) {
    if (err) throw err;

    global.db = client.db("vaultDB");

    global.db
      .collection("movie")
      .find()
      .toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
      });
  }
);

// Your Google Cloud Platform project ID
const projectId = process.env.project_id;

// Creates a client
var storage = new Storage({
  projectId: projectId
});
storage
  .getBuckets()
  .then(results => {
    const buckets = results[0];

    console.log("Buckets:");
    buckets.forEach(bucket => {
      console.log(bucket.name);
    });
  })
  .catch(err => {
    console.error("ERROR:", err);
  });

global.storageBucket = storage.bucket(process.env.bucketName);

const supportedNetworks = Object.freeze({ main: 1, kovan: 2, rinkeby: 3, local: 4 });
global.supportedNetworks = supportedNetworks;

const supportedVersions = ["1"];
global.supportedVersions = supportedVersions;
// app.use(multer({ inMemory: true }));
// app.use(multer({dest:__dirname+'/file/uploads/'}).any());
app.set("view engine", "pug");
// app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true, limit: "150mb" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/", indexRouter);
app.use("/db/users", usersRouter);
app.use("/db/projects", projectsRouter);
app.use("/web3/contractdata", contractdataRouter);
app.use("/web3/crowdsale", crowdsaleRouter);
app.use("/web3/pollfactory", pollfactoryRouter);
app.use("/web3/membershiptoken", membershiptokenRouter);
app.use("/web3/erc20token", erc20tokenRouter);
app.use("/web3/freezabletoken", freezabletokenRouter);
app.use("/web3/vaulttoken", vaulttokenRouter);
app.use("/coinprice", coinpriceRouter);
app.use("/projectweb3", projectweb3Router);

module.exports = app;
