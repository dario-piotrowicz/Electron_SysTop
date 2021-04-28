const electron = require("electron");
const path = require("path");
const fs = require("fs");

class Store {
  constructor(defaults) {
    const userDataPath = (electron.app || electron.remote.app).getPath(
      "userData"
    );

    this.path = path.join(userDataPath, "config.json");
    this.data = parseDataFile(this.path, defaults);
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(path, defaults) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch {
    return defaults;
  }
}

module.exports = Store;
