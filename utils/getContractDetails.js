const fs = require("fs");
const path = require("path");
const defaultPath = path.resolve(__dirname, "../contractData");

module.exports = (version, name) => {
  return new Promise((resolve, reject) => {
    if (!global.supportedVersions.includes(version)) reject(new Error("Not a supported version"));
    const contractPath = path.resolve(defaultPath, "v" + version, name + ".json");
    if (!fs.existsSync(contractPath)) reject(new Error("Version doesn't exist"));
    const fileData = fs.readFileSync(contractPath, "utf8");
    const parsedFile = JSON.parse(fileData);
    resolve({ abi: parsedFile.abi, bytecode: parsedFile.bytecode });
  });
};
