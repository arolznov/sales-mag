const fs = require("fs/promises");
const config = require("./config");
const axios = require("axios");
const exec = require("child_process");

module.exports = ({ url }) => {
  const label = "cache/label.pdf";

  if (url.indexOf("http") !== 0) {
    url = config.endpoint + url;
  }
  return fs
    .unlink(label)
    .catch(() => {})
    .then(() => axios.get(url, { responseType: "arraybuffer", timeout: 5000 }))
    .then((res) => fs.writeFile(label, res.data))
    .then(
      () =>
        new Promise((resolve, reject) => {
          console.log(url);
          const cp = exec.execFile(
            "SumatraPDF.exe",
            ["-print-to-default", '-print-settings "fit"', "-silent", label],
            (error) => {
              if (error) {
                reject(error);
              }
            }
          );
          cp.on("exit", (e) => {
            if (e === 1) {
              resolve();
            } else {
              reject("print error");
            }
          });
        })
    );
};
