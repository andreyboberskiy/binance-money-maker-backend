import ApiError from "../../../exceptions/api-error";
import calculateSmartOrderPercents from "../../../utils/calculateSmartOrderPercents";
import SmartOrderModel from "../../DB/SmartOrder";
import SmartOrderHistoryModel from "../../DB/SmartOrderHistory";
import UserModel from "../../DB/User";
import Rates from "../../Rates";
import SmartOrdersChecker from "../../SmartOrdersChecker";

class SmartOrderControllers {
  async create(req, res, next) {
    try {
      const {
        userId,
        direction,
        updateFixRatePercent,
        sellingPercent,
        stopLossPercent,
        buyPrimary,
        buySecondary,
      } = req.body;

      const user = await UserModel.findById(userId);

      if (!user) {
        throw ApiError.BadRequest("User not found");
      }

      // const binanceClient = new Binance(user.accessKey, user.secretKey);
      //
      // const { data: account } = await binanceClient.account();

      const fixRate = Rates.getRatesByDirection(direction);

      if (!fixRate) {
        throw ApiError.BadRequest("No rate", { direction });
      }

      const { stopLossAmount, updateFixRateAmount, sellingPrice } =
        calculateSmartOrderPercents(fixRate, {
          stopLossPercent,
          updateFixRatePercent,
          sellingPercent,
        });

      const orderData = {
        fixRateAmount: fixRate,
        updateFixRateAmount,
        stopLossAmount,
        sellingPrice,
      };

      const smartOrder = new SmartOrderModel({
        userId,
        direction,
        buySecondary,
        buyPrimary,
        meta: { isActive: true, isBought: true },
        settings: { updateFixRatePercent, stopLossPercent, sellingPercent },
        data: orderData,
      });

      const smartOrderHistory = new SmartOrderHistoryModel({
        smartOrderId: smartOrder._id,
        actions: [
          {
            desc: "Order created",
            data: orderData,
          },
        ],
      });

      smartOrder.history = smartOrderHistory._id;

      await smartOrder.save();
      await smartOrderHistory.save();

      SmartOrdersChecker.addForChecking(
        smartOrder._id,
        smartOrder.direction,
        smartOrder.data
      );

      return res.status(200).json(smartOrder);
    } catch (e) {
      next(e);
    }
  }
}

export default new SmartOrderControllers();
