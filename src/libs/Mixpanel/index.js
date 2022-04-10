import mixpanel from "mixpanel";
import appConfig from "../../constants/appConfig";

class Mixpanel {
  instance;

  init() {
    this.instance = mixpanel.init(appConfig.mixPanelToken, {
      debug: appConfig.isDev,
    });
  }
  send(eventName, id, options = {}) {
    if (this.instance) {
      this.instance.track(eventName, {
        unique_id: id,
        distinct_id: id,
        ...options,
      });
    }
  }
  log(eventName, data) {
    this.send(eventName, "APP LOG", data);
  }
  sendError(message, error) {
    this.send("APP CAUGHT ERROR", "NODE", { error, message });
  }
}

export default new Mixpanel();
