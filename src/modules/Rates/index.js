class Rates {
  _rates = {};

  _directionsListeners = {};

  subscribeDirection(direction, listener) {
    this._directionsListeners[direction] = listener;
  }
  unsubscribeDirection(direction) {
    this._directionsListeners[direction] = null;
  }

  directionListens(direction) {
    return Boolean(this._directionsListeners[direction.removeSlash()]);
  }

  get allRates() {
    return this._rates;
  }

  getRatesByDirection(direction) {
    return this.allRates[direction?.replace("/", "")];
  }

  set rates(newRates) {
    this._rates = { ...this._rates, ...newRates };
  }

  updateRates(data) {
    this.rates = data.reduce((acc, currValue) => {
      const newAcc = { ...acc };
      newAcc[currValue.direction] = currValue.rate;
      return newAcc;
    }, {});
  }

  broadcastToDirectionListeners(data) {
    data.forEach(({ rate, direction }) => {
      const listener = this._directionsListeners[direction];

      if (listener) {
        listener(direction, rate);
      }
    });
  }

  listener = (data) => {
    this.updateRates(data);
    this.broadcastToDirectionListeners(data);
  };
}

export default new Rates();
