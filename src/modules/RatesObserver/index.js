import WebSocket from "ws";

import appConfig from "../../constants/appConfig.js";
import Mixpanel from "../../libs/Mixpanel";

class RatesObserver {
  constructor() {
    this.listeners = [];
  }

  async init() {
    const ws = new WebSocket(appConfig.ratesSocketUrl);

    ws.onclose = () => {
      Mixpanel.log("Socket connection has been closed");
      setTimeout(() => {
        this.init();
      }, 1000);
    };

    ws.onerror = (err) => {
      Mixpanel.log("Error with Socket connection", err);
      setTimeout(() => {
        this.init();
      }, 1000);
    };

    ws.onmessage = (message) => {
      let parsedData = JSON.parse(message.data);

      if (parsedData?.data) {
        parsedData = parsedData.data;

        parsedData = parsedData.map((data) => ({
          timestamp: data.E,
          direction: data.s,
          rate: Number(data.c),
        }));
        this.broadcast(parsedData);
      }
    };

    return new Promise((resolve) => {
      ws.onopen = () => {
        Mixpanel.log("Socket connected");
        resolve();

        ws.send(
          JSON.stringify({
            id: 2,
            method: "SUBSCRIBE",
            params: ["!miniTicker@arr@3000ms"],
          })
        );
      };
    });
  }

  broadcast(data) {
    this.listeners.forEach((listener) => {
      listener(data);
    });
  }

  addListener(listener) {
    if (listener) {
      this.listeners.push(listener);
    }
  }
}

export default new RatesObserver();
