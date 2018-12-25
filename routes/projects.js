const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectID;
const Multer = require("multer");
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

/*Fetch kill poll history table */
//http://localhost:2020/db/projects/history/killpoll?pollfactoryaddress=
router.get("/history/killpoll", function(req, res, next) {
  if ("pollfactoryaddress" in req.query && "network" in req.query) {
    let collectionName = "pollHistory";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    global.db.collection(collectionName).findOne(
      {
        pollFactoryAddress: req.query.pollfactoryaddress
      },
      { projection: { killPollArray: 1, _id: 0 } },
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send({
            message: "Failed",
            reason: "Database error!",
            data: []
          });
          return;
        }
        if (result) {
          res.status(200).send({
            message: "Success",
            data: result.killPollArray,
            reason: ""
          });
        } else {
          res.status(200).send({
            message: "Success",
            data: [],
            reason: ""
          });
        }
      }
    );
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

/*Fetch tap poll history table */
//http://localhost:2020/db/projects/history/tappoll?pollfactoryaddress=
router.get("/history/tappoll", function(req, res, next) {
  if ("pollfactoryaddress" in req.query && "network" in req.query) {
    let collectionName = "pollHistory";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    global.db.collection(collectionName).findOne(
      {
        pollFactoryAddress: req.query.pollfactoryaddress
      },
      { projection: { tapPollArray: 1, _id: 0 } },
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send({
            message: "Failed",
            reason: "Database error!",
            data: []
          });
          return;
        }
        if (result) {
          res.status(200).send({
            message: "Success",
            data: result.tapPollArray,
            reason: ""
          });
        } else {
          res.status(200).send({
            message: "Success",
            data: [],
            reason: ""
          });
        }
      }
    );
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

/*Fetch xfr poll history table */
//http://localhost:2020/db/projects/history/xfrpoll?pollfactoryaddress=
router.get("/history/xfrpoll", function(req, res, next) {
  if ("pollfactoryaddress" in req.query && "network" in req.query) {
    let collectionName = "pollHistory";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    global.db.collection(collectionName).findOne(
      {
        pollFactoryAddress: req.query.pollfactoryaddress
      },
      { projection: { xfrPollArray: 1, _id: 0 } },
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send({
            message: "Failed",
            reason: "Database error!",
            data: []
          });
          return;
        }
        if (result) {
          res.status(200).send({
            message: "Success",
            data: result.xfrPollArray,
            reason: ""
          });
        } else {
          res.status(200).send({
            message: "Success",
            data: [],
            reason: ""
          });
        }
      }
    );
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

// var bucket = global.storage.bucket("electus");
/* Upload a whitepaper or thumbnail*/
router.post("/document/upload", multer.single("file"), function(req, res, next) {
  if (!req.file || !req.query.useraddress || !req.query.doctype) {
    res.status(400).send("No file uploaded.");
    return;
  }
  // Create a new blob in the bucket and upload the file data.
  const blob = global.storageBucket.file(
    req.query.useraddress + "_" + req.query.doctype + "." + req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]
  );
  const options = {
    metadata: {
      contentType: req.file.mimetype
    }
  };
  const blobStream = blob.createWriteStream(options);
  blobStream.on("error", err => {
    console.log(err);
    res.status(500).sned({
      message: "Failed",
      reason: "Storage error!",
      data: ""
    });
    return;
  });

  blobStream.on("finish", () => {
    const publicUrl = `https://storage.googleapis.com/${global.storageBucket.name}/${blob.name}`;
    blob.makePublic(function(err) {
      if (err) {
        res.status(500).sned({
          message: "Failed",
          reason: "Storage error!",
          data: ""
        });
        return;
      }
      let setObject = {};
      if (req.query.doctype === "whitepaper") {
        setObject = {
          $set: { whitepaperUrl: publicUrl }
        };
      } else if (req.query.doctype === "thumbnail") {
        setObject = {
          $set: { thumbnailUrl: publicUrl }
        };
      }
      let collectionName = "pollHistory";
      if (req.query.network !== "main") {
        collectionName = collectionName + "_" + req.query.network;
      }
      global.db.collection("project_details").updateOne({ ownerAddress: req.query.useraddress }, setObject, { upsert: true }, (err, result) => {
        if (err) console.log(err);
      });
      res.status(200).send({
        message: "Success",
        data: publicUrl,
        reason: ""
      });
      return;
    });
  });
  blobStream.end(req.file.buffer);
});

/* GET featured projects IDs. */
router.get("/featured", function(req, res, next) {
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }

  global.db
    .collection(collectionName)
    .find({ isFeatured: true }, { projection: { projectName: 1, description: 1, urls: 1, _id: 1, thumbnailUrl: 1, tokenTag: 1 } })
    .limit(3)
    .toArray((err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
        return;
      }
      res.status(200).send({
        message: "Success",
        data: result,
        reason: ""
      });
    });
});

/* GET project details using project ID. */
router.get("/", function(req, res, next) {
  if ("projectid" in req.query && "network" in req.query) {
    let collectionName = "project_details";
    if ("network" in req.query) {
      if (req.query.network === "") {
        collectionName = collectionName;
      } else if (req.query.network !== "main") {
        collectionName = collectionName + "_" + req.query.network;
      }
    }
    global.db.collection(collectionName).findOne({ _id: ObjectID(req.query.projectid) }, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
        return;
      }
      res.status(200).send({
        message: "Success",
        data: result,
        reason: ""
      });
    });
  } else if ("useraddress" in req.query && "network" in req.query) {
    let collectionName = "project_details";
    if ("network" in req.query) {
      if (req.query.network === "") {
        collectionName = collectionName;
      } else if (req.query.network !== "main") {
        collectionName = collectionName + "_" + req.query.network;
      }
    }
    global.db.collection(collectionName).findOne({ ownerAddress: req.query.useraddress }, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
        return;
      }
      res.status(200).send({
        message: "Success",
        data: result,
        reason: ""
      });
    });
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

/*Fetch deployment indicator */
router.get("/deployment/indicator", function(req, res, next) {
  if ("useraddress" in req.query && "network" in req.query) {
    let collectionName = "project_details";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    global.db
      .collection(collectionName)
      .findOne({ ownerAddress: req.query.useraddress }, { projection: { currentDeploymentIndicator: 1 } }, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send({
            message: "Failed",
            reason: "Database error!",
            data: []
          });
          return;
        }
        if (result) {
          res.status(200).send({
            message: "Success",
            data: result,
            reason: ""
          });
        } else {
          res.status(200).send({
            message: "Success",
            data: {},
            reason: ""
          });
        }
      });
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

/*Append to XFR Requests*/
router.patch("/xfrs", function(req, res, next) {
  if ("projectid" in req.query && "network" in req.query) {
    let collectionName = "project_details";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    global.db.collection(collectionName).updateOne(
      { _id: ObjectID(req.query.projectid) },
      {
        // $set: {
        $push: { xfrDetails: req.body }
        // }
      },
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send({
            message: "Failed",
            reason: err.message,
            data: []
          });
          return;
        }
        res.send({
          message: "Success",
          reason: "Successfully updated.",
          data: []
        });
      }
    );
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

router.patch("/xfrdescription", function(req, res, next) {
  if ("projectid" in req.query && "address" in req.query && "network" in req.query) {
    let collectionName = "project_details";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    global.db.collection(collectionName).updateOne(
      { _id: ObjectID(req.query.projectid) },
      {
        $set: {
          "xfrDetails.$[elem].description": req.body.description
        }
      },
      {
        arrayFilters: [{ "elem.address": req.query.address }]
      },
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send({
            message: "Failed",
            reason: err.message,
            data: []
          });
          return;
        }
        res.send({
          message: "Success",
          reason: "Successfully updated.",
          data: []
        });
      }
    );
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

/* POST a new project*/
router.post("/", function(req, res, next) {
  var insertObject = req.body;
  if ("startDateTime" in insertObject) {
    insertObject["startDateTime"] = new Date(insertObject["startDateTime"]);
  }
  if ("r1EndTime" in insertObject) {
    insertObject["r1EndTime"] = new Date(insertObject["r1EndTime"]);
  }
  if ("killPollStartDate" in insertObject) {
    insertObject["killPollStartDate"] = new Date(insertObject["killPollStartDate"]);
  }
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }
  global.db
    .collection(collectionName)
    .findOneAndUpdate({ ownerAddress: req.body.ownerAddress }, { $set: insertObject }, { upsert: true }, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send({
          message: "Failed",
          reason: err.message,
          data: []
        });
        return;
      }
      if ("lastErrorObject" in result) {
        if (result["lastErrorObject"]["updatedExisting"]) {
          res.send({
            message: "Success",
            reason: "Successfully inserted",
            data: result["value"]["_id"],
            projectData: result.value
          });
        } else {
          res.send({
            message: "Success",
            reason: "Successfully inserted",
            data: result["lastErrorObject"]["upserted"],
            projectData: result.value
          });
        }
      } else {
        res.status(400).send({
          message: "Failed",
          reason: err.message,
          data: []
        });
        return;
      }
    });
});

/* POST a project form state*/
router.post("/formstates", function(req, res, next) {
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }
  global.db
    .collection(collectionName)
    .updateOne(
      { ownerAddress: req.query.useraddress },
      { $set: { state: req.body, ownerAddress: req.query.useraddress } },
      { upsert: true },
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send({
            message: "Failed",
            reason: err.message,
            data: []
          });
          return;
        }
        res.send({
          message: "Success",
          reason: "Successfully inserted",
          data: {}
        });
      }
    );
});

/* GET a project form state*/
router.get("/formstates", function(req, res, next) {
  if ("useraddress" in req.query && "network" in req.query) {
    let collectionName = "projectFormState";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    global.db.collection(collectionName).findOne({ ownerAddress: req.query.useraddress }, (err, result) => {
      if (err) {
        res.status(400).send({
          message: "Failed",
          reason: err.message,
          data: []
        });
        return;
      }
      if (result) {
        res.send({
          message: "Success",
          reason: "Successfully retrieved",
          data: result
        });
      } else {
        res.send({
          message: "Success",
          reason: "Successfully retrieved",
          data: {}
        });
      }
    });
  } else {
    res.send({
      message: "Success",
      reason: "Successfully retrieved",
      data: {}
    });
  }
});

/* PATCH project object with deployment parameters*/
router.patch("/deployment", function(req, res, next) {
  if ("projectid" in req.query && "network" in req.query) {
    if ("currentDeploymentIndicator" in req.body && "latestTxHash" in req.body) {
      let collectionName = "project_details";
      if (req.query.network !== "main") {
        collectionName = collectionName + "_" + req.query.network;
      }
      global.db.collection(collectionName).updateOne(
        { _id: ObjectID(req.query.projectid) },
        {
          $set: {
            currentDeploymentIndicator: parseInt(req.body.currentDeploymentIndicator),
            latestTxHash: req.body.latestTxHash
          }
        },
        (err, result) => {
          if (err) {
            res.send({
              message: "Failed",
              reason: err.message,
              data: []
            });
            return;
          }
          res.send({
            message: "Success",
            reason: "Successfully updated.",
            data: []
          });
        }
      );
    } else {
      res.status(400).send({
        message: "Failed",
        reason: "Missing body parameter",
        data: []
      });
    }
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

/* PATCH project object with contract address parameters and deployment parameters*/
router.patch("/contracts", function(req, res, next) {
  if ("projectid" in req.query && "network" in req.query) {
    let collectionName = "project_details";
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
    if ("currentDeploymentIndicator" in req.body && "latestTxHash" in req.body && "nonce" in req.body) {
      if ("lockedTokensAddress" in req.body) {
        global.db.collection(collectionName).updateOne(
          { _id: ObjectID(req.query.projectid) },
          {
            $set: {
              lockedTokensAddress: req.body.lockedTokensAddress,
              currentDeploymentIndicator: parseInt(req.body.currentDeploymentIndicator),
              latestTxHash: req.body.latestTxHash,
              nonce: req.body.nonce
            }
          },
          (err, result) => {
            if (err) {
              res.send({
                message: "Failed",
                reason: err.message,
                data: []
              });
              return;
            }
            res.send({
              message: "Success",
              reason: "Successfully updated.",
              data: []
            });
          }
        );
      } else if ("vaultAddress" in req.body) {
        global.db.collection(collectionName).updateOne(
          { _id: ObjectID(req.query.projectid) },
          {
            $set: {
              vaultAddress: req.body.vaultAddress,
              currentDeploymentIndicator: parseInt(req.body.currentDeploymentIndicator),
              latestTxHash: req.body.latestTxHash,
              nonce: req.body.nonce
            }
          },
          (err, result) => {
            if (err) {
              res.send({
                message: "Failed",
                reason: err.message,
                data: []
              });
              return;
            }
            res.send({
              message: "Success",
              reason: "Successfully updated.",
              data: []
            });
          }
        );
      } else if ("membershipAddress" in req.body) {
        global.db.collection(collectionName).updateOne(
          { _id: ObjectID(req.query.projectid) },
          {
            $set: {
              membershipAddress: req.body.membershipAddress,
              currentDeploymentIndicator: parseInt(req.body.currentDeploymentIndicator),
              latestTxHash: req.body.latestTxHash,
              nonce: req.body.nonce
            }
          },
          (err, result) => {
            if (err) {
              res.send({
                message: "Failed",
                reason: err.message,
                data: []
              });
              return;
            }
            res.send({
              message: "Success",
              reason: "Successfully updated.",
              data: []
            });
          }
        );
      } else if ("daicoTokenAddress" in req.body) {
        global.db.collection(collectionName).updateOne(
          { _id: ObjectID(req.query.projectid) },
          {
            $set: {
              daicoTokenAddress: req.body.daicoTokenAddress,
              currentDeploymentIndicator: parseInt(req.body.currentDeploymentIndicator),
              latestTxHash: req.body.latestTxHash,
              nonce: req.body.nonce
            }
          },
          (err, result) => {
            if (err) {
              res.send({
                message: "Failed",
                reason: err.message,
                data: []
              });
              return;
            }
            res.send({
              message: "Success",
              reason: "Successfully updated.",
              data: []
            });
          }
        );
      } else if ("pollFactoryAddress" in req.body) {
        global.db.collection(collectionName).updateOne(
          { _id: ObjectID(req.query.projectid) },
          {
            $set: {
              pollFactoryAddress: req.body.pollFactoryAddress,
              currentDeploymentIndicator: parseInt(req.body.currentDeploymentIndicator),
              latestTxHash: req.body.latestTxHash,
              nonce: req.body.nonce
            }
          },
          (err, result) => {
            if (err) {
              res.send({
                message: "Failed",
                reason: err.message,
                data: []
              });
              return;
            }
            res.send({
              message: "Success",
              reason: "Successfully updated.",
              data: []
            });
          }
        );
      } else if ("crowdSaleAddress" in req.body) {
        global.db.collection(collectionName).updateOne(
          { _id: ObjectID(req.query.projectid) },
          {
            $set: {
              crowdSaleAddress: req.body.crowdSaleAddress,
              currentDeploymentIndicator: parseInt(req.body.currentDeploymentIndicator),
              latestTxHash: req.body.latestTxHash,
              nonce: req.body.nonce
            }
          },
          (err, result) => {
            if (err) {
              res.send({
                message: "Failed",
                reason: err.message,
                data: []
              });
              return;
            }
            res.send({
              message: "Success",
              reason: "Successfully updated.",
              data: []
            });
          }
        );
      } else {
        global.db.collection(collectionName).updateOne(
          { _id: ObjectID(req.query.projectid) },
          {
            $set: {
              currentDeploymentIndicator: parseInt(req.body.currentDeploymentIndicator),
              latestTxHash: req.body.latestTxHash,
              nonce: req.body.nonce
            }
          },
          (err, result) => {
            if (err) {
              res.send({
                message: "Failed",
                reason: err.message,
                data: []
              });
              return;
            }
            res.send({
              message: "Success",
              reason: "Successfully updated.",
              data: []
            });
          }
        );
      }
    } else {
      res.status(400).send({
        message: "Failed",
        reason: "Missing body parameter",
        data: []
      });
    }
  } else {
    res.status(400).send({
      message: "Failed",
      reason: "Missing query parameter",
      data: []
    });
  }
});

/* GET upcoming projects */
router.get("/upcoming", function(req, res, next) {
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }
  global.db
    .collection(collectionName)
    .find({
      $or: [{ startDateTime: { $gte: new Date() } }, { currentRound: 0 }]
    })
    .toArray((err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
        return;
      }
      res.status(200).send({
        message: "Success",
        data: result,
        reason: ""
      });
    });
});

/* GET active projects */
router.get("/active", function(req, res, next) {
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }
  global.db
    .collection(collectionName)
    .find({
      $and: [{ startDateTime: { $lt: new Date() } }, { currentRound: { $gt: 0 } }, { currentRound: { $lt: 4 } }, { projectEndedAt: null }]
    })
    .toArray((err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
        return;
      }
      res.status(200).send({
        message: "Success",
        data: result,
        reason: ""
      });
    });
});

/* GET ended projects */
router.get("/ended", function(req, res, next) {
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }
  global.db
    .collection(collectionName)
    .find({ projectEndedAt: { $exists: true, $ne: null } })
    .toArray((err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
        return;
      }
      res.status(200).send({
        message: "Success",
        data: result,
        reason: ""
      });
    });
});

function validateInputs(req, res) {
  if (!("tokenTag" in req.query && "projectName" in req.query && "network" in req.query)) return res.status(400).send("Bad Request");
}

router.get("/exists", (req, res) => {
  validateInputs(req, res);
  let collectionName = "project_details";
  if (req.query.network !== "main") {
    collectionName = collectionName + "_" + req.query.network;
  }
  global.db
    .collection(collectionName)
    .find({ $or: [{ projectName: req.query.projectName }, { tokenTag: req.query.tokenTag }] })
    .limit(1)
    .toArray((err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
      }
      if (result.length === 0)
        res.status(200).send({
          message: "Success",
          data: false,
          reason: "tag and projectname are unique"
        });
      else
        res.status(200).send({
          message: "Success",
          data: true,
          reason: "Either tag already exists or projectname already exists"
        });
    });
});

router.get("/search", (req, res) => {
  if (!("q" in req.query)) return res.status(400).send("Bad Request");
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }
  global.db
    .collection(collectionName)
    .find(
      {
        $or: [{ projectName: { $regex: new RegExp(`^${req.query.q}`, "i") } }, { tokenTag: { $regex: new RegExp(`^${req.query.q}`, "i") } }]
      },
      { projection: { projectName: 1, description: 1, tokenTag: 1, _id: 1, urls: 1, thumbnailUrl: 1 } }
    )
    .toArray((err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({
          message: "Failed",
          reason: "Database error!",
          data: []
        });
      }
      res.status(200).send({
        message: "Success",
        data: result,
        reason: "Matching projects"
      });
    });
});

router.get("/uniqueprojecttags", (req, res) => {
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }
  global.db.collection(collectionName).distinct("tokenTag", {}, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send({
        message: "Failed",
        reason: "Database error!",
        data: []
      });
    }
    res.status(200).send({
      message: "Success",
      data: result,
      reason: "Matching projects"
    });
  });
});

router.get("/uniqueprojectnames", (req, res) => {
  let collectionName = "project_details";
  if ("network" in req.query) {
    if (req.query.network === "") {
      collectionName = collectionName;
    } else if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network;
    }
  }
  global.db.collection(collectionName).distinct("projectName", {}, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send({
        message: "Failed",
        reason: "Database error!",
        data: []
      });
    }
    res.status(200).send({
      message: "Success",
      data: result,
      reason: "Matching projects"
    });
  });
});

module.exports = router;
// $or: [{ projectName: { $regex: new RegExp(req.query.projectName) } }, { tokenTag: { $regex: new RegExp(req.query.tokenTag) } }]
