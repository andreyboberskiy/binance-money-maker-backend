import "./utils/prototypes";
import Mixpanel from "./libs/Mixpanel";

import RatesObserver from "./modules/RatesObserver";

import Rates from "./modules/Rates";
import Server from "./modules/Server";
import DB from "./modules/DB";
import SmartOrdersChecker from "./modules/SmartOrdersChecker";

async function start() {
  try {
    Mixpanel.init();
    await RatesObserver.init();
    RatesObserver.addListener(Rates.listener);

    await DB.init();

    await SmartOrdersChecker.init();

    Server.start();
  } catch (e) {
    console.log("Internal error", e);
  }
}

start();
