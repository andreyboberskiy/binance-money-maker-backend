import { Spot } from "@binance/connector";

class Binance {
  constructor(apiKey, secretKey) {
    return new Spot(apiKey, secretKey);
  }
}

export default Binance;
