import Mixpanel from "../../libs/Mixpanel";
import SmartOrderModel from "../../modules/DB/SmartOrder";
import calculateSmartOrderPercents from "../../utils/calculateSmartOrderPercents";
import SmartOrderHistoryModel from "../DB/SmartOrderHistory";
import Rates from "../Rates";

class SmartOrdersChecker {
  _stopAndUpdateLists = {};

  async init() {
    const allOrders = await SmartOrderModel.find({ "meta.isActive": true });

    const newStopAndUpdateListsByDirection = {};

    allOrders.forEach((order) => {
      const direction = order.direction.removeSlash();

      const currentDirectionData = newStopAndUpdateListsByDirection[direction];

      const stopLossItem = { id: order._id, amount: order.data.stopLossAmount };
      const updateFixRateItem = {
        id: order._id,
        amount: order.data.updateFixRateAmount,
      };

      if (!currentDirectionData) {
        newStopAndUpdateListsByDirection[direction] = {
          stopLossList: [stopLossItem],
          updateFixRateList: [updateFixRateItem],
        };
      } else {
        currentDirectionData.stopLossList.push(stopLossItem);
        currentDirectionData.updateFixRateList.push(updateFixRateItem);
      }
    }, []);

    Object.entries(newStopAndUpdateListsByDirection).forEach(
      ([direction, { stopLossList, updateFixRateList }]) => {
        this.setStopAndUpdateLists(direction, stopLossList, updateFixRateList);
      }
    );
  }

  setStopAndUpdateLists(direction, stopList, updateList, { withOld } = {}) {
    const currentLists = this._stopAndUpdateLists[direction] || {
      stopLossList: [],
      updateFixRateList: [],
    };

    const newStopLossList = [
      ...(withOld ? currentLists.stopLossList : []),
      ...stopList,
    ].sort((a, b) => b.amount - a.amount);
    const newUpdateFixRateList = [
      ...(withOld ? currentLists.updateFixRateList : []),
      ...updateList,
    ].sort((a, b) => a.amount - b.amount);

    this._stopAndUpdateLists[direction] = {
      updateFixRateList: newUpdateFixRateList,
      stopLossList: newStopLossList,
    };

    Object.entries(this._stopAndUpdateLists).forEach(
      ([direction, { stopLossList, updateFixRateList }]) => {
        if (
          (stopLossList.length > 0 || updateFixRateList > 0) &&
          !Rates.directionListens(direction)
        ) {
          Rates.subscribeDirection(direction, this.checkDirection.bind(this));
        }
        if (!stopLossList.length && !updateFixRateList.length) {
          Rates.unsubscribeDirection(direction);
        }
      }
    );
  }

  addForChecking(id, direction, { updateFixRateAmount, stopLossAmount }) {
    const stopLossList = [{ id, amount: stopLossAmount }];
    const updateFixRateList = [{ id, amount: updateFixRateAmount }];

    this.setStopAndUpdateLists(
      direction.removeSlash(),
      stopLossList,
      updateFixRateList,
      { withOld: true }
    );
  }

  async checkDirection(direction, rate) {
    try {
      const { stopLossList, updateFixRateList } =
        this._stopAndUpdateLists[direction];

      const minimalStopLoss = stopLossList[0];
      const minimalUpdateFixRate = updateFixRateList[0];

      const triggeredStopLossOrders = [];
      let restStopLossOrders = [];

      const triggeredUpdateFixRateOrders = [];
      const restUpdateFixRateOrders = [];

      const stopLossTriggered = rate <= minimalStopLoss.amount;
      const updateFixRateTriggered = rate >= minimalUpdateFixRate.amount;

      let localUpdateFixRateList = [...updateFixRateList];

      console.log({
        direction,
        rate,
        minimalStopLoss,
        minimalUpdateFixRate,
        stopLossTriggered,
        updateFixRateTriggered,
      });

      if (stopLossTriggered) {
        stopLossList.forEach((stopLoss) => {
          if (rate <= stopLoss.amount) {
            triggeredStopLossOrders.push(stopLoss);
            localUpdateFixRateList = localUpdateFixRateList.filter(
              (i) => i.id !== stopLoss.id
            );
          } else {
            restStopLossOrders.push(stopLoss);
          }
        });
      }

      if (updateFixRateTriggered) {
        localUpdateFixRateList.forEach((updateFixRate) => {
          if (rate >= updateFixRate.amount) {
            triggeredUpdateFixRateOrders.push(updateFixRate);
            restStopLossOrders = restStopLossOrders.filter(
              (i) => i.id !== updateFixRate.id
            );
          } else {
            restUpdateFixRateOrders.push(updateFixRate);
          }
        });
      }

      if (updateFixRateTriggered || stopLossTriggered) {
        this.setStopAndUpdateLists(
          direction,
          restStopLossOrders,
          restUpdateFixRateOrders
        );

        if (stopLossTriggered) {
          const triggeredStopLossOrdersIds = triggeredStopLossOrders.map(
            (o) => o.id
          );

          const stopLossOrders = await SmartOrderModel.find({
            _id: { $in: triggeredStopLossOrdersIds },
          });

          for await (const order of stopLossOrders) {
            order.meta.isActive = false;
            order.meta.isSold = true;
            order.meta.soldReason = "stopLoss";
            order.meta.soldPrice = rate;

            const history = await SmartOrderHistoryModel.findById(
              order.history
            );

            history.actions.push({
              desc: "Order sold by stop loss",
              data: { price: rate, time: Date.now() },
            });

            await order.save();
            await history.save();

            Mixpanel.send("Sold order", "APP LOG", { order });
          }
        }

        if (updateFixRateTriggered) {
          const triggeredUpdateFixRateOrdersIds =
            triggeredUpdateFixRateOrders.map((o) => o.id);

          const updateFixOrders = await SmartOrderModel.find({
            _id: { $in: triggeredUpdateFixRateOrdersIds },
          });

          const updatedFixRateLists = {
            stopLossList: [],
            updateFixRateList: [],
          };

          for await (const order of updateFixOrders) {
            const history = await SmartOrderHistoryModel.findById(
              order.history
            );

            const needSell = order.data.sellingPrice <= rate;
            if (needSell) {
              order.meta.isActive = false;
              order.meta.isSold = true;
              order.meta.soldReason = "maxProfit";
              order.meta.soldPrice = rate;

              history.actions.push({
                desc: "Order sold by max profit",
                data: { price: rate, time: Date.now() },
              });

              await order.save();
              await history.save();

              Mixpanel.send("Sold order", "APP LOG", { order });
            } else {
              const newOrderData = {
                ...order.data,
                ...calculateSmartOrderPercents(rate, order.settings, true),
              };

              history.actions.push({
                desc: "Order's fix rate has been raised",
                data: {
                  time: Date.now(),
                  prevOrderData: order.data,
                  newOrderData,
                },
              });

              order.meta.updateFixRateCount = order.meta.updateFixRateCount + 1;
              order.data = newOrderData;

              await order.save();
              await history.save();

              updatedFixRateLists.updateFixRateList.push({
                id: order._id,
                amount: order.data.updateFixRateAmount,
              });
              updatedFixRateLists.stopLossList.push({
                id: order._id,
                amount: order.data.stopLossAmount,
              });
            }
          }

          this.setStopAndUpdateLists(
            direction,
            updatedFixRateLists.stopLossList,
            updatedFixRateLists.updateFixRateList,
            { withOld: true }
          );
        }
      }
      console.log(this._stopAndUpdateLists);
    } catch (e) {
      console.log("Check smart order error", e);
      Mixpanel.sendError("Check smart order error", e);
    }
  }
}

export default new SmartOrdersChecker();
