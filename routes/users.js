const express = require("express");
const otpGenerator = require('otp-generator');
const axios = require('axios');
const Multer = require('multer');
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});
const ObjectID = require('mongodb').ObjectID;
const router = express.Router();

/* Upload a passport or selfie or address doc*/
router.post("/document/upload", multer.single('file'), function (req, res, next) {
  if (!req.file || !req.query.useraddress || !req.query.doctype || !req.query.network) {
    res.status(400).send('No file uploaded.');
    return;
  }
  // Create a new blob in the bucket and upload the file data.
  const blob = global.storageBucket.file(req.query.useraddress + "/" + req.query.doctype + "." + req.file.originalname.split(".")[req.file.originalname.split(".").length - 1]);
  const options = {
    metadata: {
      contentType: req.file.mimetype,
    },
  }
  const blobStream = blob.createWriteStream(options);
  blobStream.on('error', (err) => {
    console.log(err)
    res.status(500).sned({
      message: "Failed",
      reason: "Storage error!",
      data: ""
    });
    return;
  });

  blobStream.on('finish', () => {
    const privateUrl = `https://storage.googleapis.com/${global.storageBucket.name}/${blob.name}`;
    let setObject = {}
      if (req.query.doctype === 'passport') {
        setObject = {
          $set: { passportUrl: privateUrl }
        }
      } else if (req.query.doctype === 'selfie') {
        setObject = {
          $set: { selfieUrl: privateUrl }
        }
      } else if (req.query.doctype === 'address') {
        setObject = {
          $set: { addressUrl: privateUrl }
        }
      }
      let collectionName = "userProfiles"
        if (req.query.network !== "main") {
          collectionName = collectionName + "_" + req.query.network
        }
      global.db.collection(collectionName).findOneAndUpdate({ publicAddress: req.query.useraddress },
        setObject
        , { 'upsert': true }, (err, result) => {
          if (err) console.log(err);
        });
        res.status(200).send({
        message: "Success",
        data: privateUrl,
        reason: ""
      });
      return
  })
  blobStream.end(req.file.buffer);
})

/* POST a user form state*/
router.post("/formstates", function (req, res, next) {
  if("useraddress" in req.query && "network" in req.query) {
    let collectionName =  "userFormState"
    if (req.query.network !== "main"){
      collectionName = collectionName + "_" + req.query.network
    }
  global.db.collection(collectionName).findOneAndUpdate({ publicAddress: req.query.useraddress }, 
    {$set:{state: req.body, publicAddress:req.query.useraddress}}, { 'upsert': true }, (err, result) => {
    if (err) {
      console.log(err)
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
      data: { }
    });
  });
}else{
  res.status(400).send({
    "message": "Failed",
    "reason": "Missing query parameter",
    "data": [],
    details: {}
  })
}
});

/* GET a user form state*/
router.get("/formstates", function (req, res, next) {
  if ("useraddress" in req.query && "network" in req.query){
    let collectionName =  "userFormState"
    if (req.query.network !== "main"){
      collectionName = collectionName + "_" + req.query.network
    }
    global.db.collection(collectionName).findOne({ publicAddress: req.query.useraddress }, (err, result) => {
      if (err) {
        res.status(400).send({
          message: "Failed",
          reason: err.message,
          data: []
        });
        return;
      }
      res.send({
        message: "Success",
        reason: "Successfully retrieved",
        data: result
      });
    });
  }else{
    res.status(400).send({
      "message": "Failed",
      "reason": "Missing query parameter",
      "data": [],
      details: {}
    })
  }
});

/* Create new Vault Member*/
router.post("/register/phone", function (req, res, next) {
  if ("publicaddress" in req.body && "phonenumber" in req.body && "countrycode" in req.body && "network" in req.query) {
    var doc = {
      "publicAddress": req.body.publicaddress,
      "phone": {
        "code": req.body.countrycode,
        "number": req.body.phonenumber,
        "isVerified": true
      }
    }
    let collectionName = "userProfiles"
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network
    }
    global.db.collection(collectionName).insertOne(doc, function (err, result) {
      if (err) {
        res.status(200).send({
          "message": "Failed",
          "data": [],
          "reason": "Phone number or public address already exists."
        });
        return
      }
      res.status(200).send(
        {
          "message": "Success",
          "data": result.ops[0],
          "reason": ""
        }
      )
    })
  } else {
    res.status(400).send({
      "message": "Failed",
      "data": [],
      "reason": "Missing parameter in the body."
    });
  }
})

/* POST a new user*/
router.post("/", function (req, res, next) {
  let collectionName = "userProfiles"
  if ("network" in req.query){
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network
    }
  }
  global.db.collection(collectionName).findOneAndUpdate({ publicAddress: req.query.useraddress }, 
    {$set: req.body}, { 'upsert': true }, (err, result) => {
    if (err) {
      console.log(err)
      res.status(400).send({
        message: "Failed",
        reason: err.message,
        data: []
      });
      return;
    }
    // console.log("hello: ", result)
    if ("lastErrorObject" in result){
      if (result["lastErrorObject"]["updatedExisting"]){
        res.send({
          message: "Success",
          reason: "Successfully inserted",
          data: result["value"]["_id"]
        });
      }else{
        res.send({
          message: "Success",
          reason: "Successfully inserted",
          data: result["lastErrorObject"]["upserted"]
        });
      }
    }else{
      res.status(400).send({
        message: "Failed",
        reason: err.message,
        data: []
      });
    }
    
  });
});

/*Send OTP for registration purpose url- https://2factor.in/API/V1/defb654a-cd7a-11e8-a895-0200cd936042/SMS/+919096121533/1234/DVAULT*/
router.get("/otp", function (req, res, next) {
  var otp = otpGenerator.generate(4, { upperCase: false, specialChars: false, alphabets: false });
  // res.send(otp.toString())
  if ("phoneNumber" in req.query && "countryCode" in req.query && "network" in req.query) {
    let collectionName =  "userProfiles"
    if (req.query.network !== "main"){
      collectionName = collectionName + "_" + req.query.network
    }
    global.db.collection(collectionName).findOne({
      '$and': [
        { 'phone.number':  req.query.phoneNumber},
        { 'phone.isVerified': true }
      ]
    }, { projection: { publicAddress: 1, _id: 0 } }, (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).send({
          "message": "Failed",
          "reason": "Database error!",
          "data": []
        });
        return;
      }
      if (result) {
        res.status(200).send({
          "message": "Failed",
          "reason": "Phone number already exists.",
          "data": result
        })
      } else {
        axios.get(`https://2factor.in/API/V1/defb654a-cd7a-11e8-a895-0200cd936042/SMS/${(req.query.countryCode + req.query.phoneNumber)}/${otp}/DVAULT`)
      .then(function (result) {
        if (result) {
          res.send({
            "message": "Success",
            "reason": "",
            "data": {
              data: [],
              otp: otp.toString()
            }
          })
        } else {
          res.status(500).send({
            "message": "Failed",
            "reason": "Message API failed!",
            "data": []
          });
        }

      })
      .catch(function (error) {
        res.status(400).send({
          "message": "Failed",
          "data": [],
          "reason": "Please check your phone number."
        });
      })
      }
    })
    
  }else{
    res.status(400).send({
      "message": "Failed",
      "reason": "Missing query parameter",
      "data": []
    })
  }

})

/* Check if user is a creator or issuer. */
router.get("/isissuer", function (req, res, next) {
  if ("useraddress" in req.query && "network" in req.query) {
    let collectionName =  "userProfiles"
    if (req.query.network !== "main"){
      collectionName = collectionName + "_" + req.query.network
    }
    global.db.collection(collectionName).findOne({ publicAddress: req.query.useraddress }, (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).send({
          "message": "Failed",
          "reason": "Database error!",
          "data": []
        });
        return;
      }
      if (result) {
        if (result.isIssuer) {
          res.status(200).send({
            "message": "Success",
            "data": true,
            "reason": "",
            details: result
          });
        } else {
          res.status(200).send({
            "message": "Success",
            "data": false,
            "reason": "",
            details: result
          });
        }
      } else {
        res.status(200).send({
          "message": "Failed",
          "data": false,
          "reason": "User not found.",
          details: {}
        });
      }
    })
  } else {
    res.status(400).send({
      "message": "Failed",
      "reason": "Missing query parameter",
      "data": [],
      details: {}
    })
  }
});

/* Check if public address from metamask is registered with us. */
router.get("/", function (req, res, next) {
  if ("useraddress" in req.query && "network" in req.query) {
    let collectionName = "userProfiles"
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network
    }
    global.db.collection(collectionName).findOne({ publicAddress: req.query.useraddress.toLowerCase() }, { projection: { isIssuer: 1, publicAddress: 1, _id: 0 } }, (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).send({
          "message": "Failed",
          "reason": "Database error!",
          "data": []
        });
        return;
      }
      if (result) {
        res.status(200).send({
          "message": "Success",
          "reason": "",
          "data": result
        })
      } else {
        res.status(200).send({
          "message": "Failed",
          "reason": "user not registered.",
          "data": result
        })
      }
    })
  } else {
    res.status(400).send({
      "message": "Failed",
      "reason": "Missing query parameter",
      "data": []
    })
  }
})

router.get("/isphoneverified", function (req, res, next) {
  if ("useraddress" in req.query && "network" in req.query) {
    let collectionName = "userProfiles"
    if (req.query.network !== "main") {
      collectionName = collectionName + "_" + req.query.network
    }
    global.db.collection(collectionName).findOne({
      '$and': [
        { publicAddress: req.query.useraddress },
        { 'phone.isVerified': true }
      ]
    }, { projection: { publicAddress: 1, _id: 0 } }, (err, result) => {
      if (err) {
        console.error(err)
        res.status(500).send({
          "message": "Failed",
          "reason": "Database error!",
          "data": []
        });
        return;
      }
      if (result) {
        res.status(200).send({
          "message": "Success",
          "reason": "",
          "data": result
        })
      } else {
        res.status(200).send({
          "message": "Failed",
          "reason": "user not registered.",
          "data": result
        })
      }
    })
  } else {
    res.status(400).send({
      "message": "Failed",
      "reason": "Missing query parameter",
      "data": []
    })
  }
})

module.exports = router;
