import mongoose from "mongoose";

const SmartOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    direction: { type: String, required: true },

    buyPrimary: { type: Number },
    buySecondary: { type: Number },

    meta: {
      isActive: { type: Boolean, default: true },
      isBought: { type: Boolean, required: true },
      isSold: { type: Boolean, default: false },
      soldReason: { type: String, enum: ["stopLoss", "maxProfit"] },
      soldPrice: { type: Number },
      updateFixRateCount: { type: Number, default: 0 },
    },

    settings: {
      updateFixRatePercent: { type: Number, required: true },
      stopLossPercent: { type: Number, required: true },
      sellingPercent: { type: Number, required: true },
    },

    data: {
      fixRateAmount: { type: Number, required: true },
      updateFixRateAmount: { type: Number, required: true },
      stopLossAmount: { type: Number, required: true },
      sellingPrice: { type: Number, required: true },
    },

    history: { type: mongoose.Schema.Types.ObjectId, ref: "SmartOrderHistory" },
  },
  { timestamps: true }
);

const SmartOrderModel = mongoose.model("SmartOrder", SmartOrderSchema);

export default SmartOrderModel;
