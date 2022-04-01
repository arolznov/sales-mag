const fs = require("fs/promises");
const config = require("./config.js");
const printLabel = require("./print");
const io = require("socket.io-client");
const camera = require("./camera.js");

(async () => {
  try {
    await fs.mkdir("cache");
  } catch (e) {}

  const socket = io(config.endpoint + ":" + config.socketPort, {
    query: {
      tableId: config.tableId,
    },
  });

  socket.on("print pdf", (data) => {
    printLabel(data).catch((e) => console.log(e));
  });

  camera.socket = socket;
  camera.run();
})();
