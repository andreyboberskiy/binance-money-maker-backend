import mongoose from "mongoose";

const SmartOrderHistorySchema = new mongoose.Schema(
  {
    smartOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SmartOrder",
      required: true,
    },
    actions: [
      { desc: { type: String, required: true }, data: { type: Object } },
    ],
  },
  { timestamps: true }
);
const SmartOrderHistoryModel = mongoose.model(
  "SmartOrderHistory",
  SmartOrderHistorySchema
);
export default SmartOrderHistoryModel;
