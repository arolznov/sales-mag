const axios = require("axios");
const config = require("./config");
const Jimp = require("jimp");
const { VideoCapture } = require("camera-capture");
const moment = require("moment");

module.exports = {
  socket: null,
  videoCapture: null,
  font: null,
  async init() {
    if (!this.font) {
      this.font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    }
    if (!this.videoCapture) {
      this.videoCapture = new VideoCapture({
        mime: "image/jpg",
        width: 800,
        height: 600,
        fps: 1,
      });
    }

    if (!this.videoCapture.initialized) {
      await this.videoCapture.initialize();
    }
  },
  async capture() {
    return this.init()
      .then(() => this.videoCapture.readFrame())
      .then((frame) => Jimp.read(frame.data))
      .then((img) => {
        img.grayscale();
        img.print(
          this.font,
          10,
          5,
          "CAM " +
            config.tableId +
            ": " +
            moment().format("YYYY-MM-DD HH:mm:ss")
        );
        return img.getBase64Async(Jimp.MIME_JPEG);
      })
      .then((data) => {
        this.socket.emit("camera captured", {
          cameraId: config.tableId,
          photo: data,
        });
      });
  },
  async check() {
    return axios.get(config.endpoints.cameraLastScan).then((res) => {
      return this.capture();
      if (res.data.diff > 300) {
        console.log("no need capute");
      } else {
        return this.capture().catch((e) => {
          console.log(e);
          console.log("capture failed");
          this.font = null;
          this.videoCapture = null;
        });
      }
    });
  },
  async run() {
    this.check()
      .catch((e) => console.log(e))
      .finally(() => setTimeout(() => this.run(), 3000));
  },
};
