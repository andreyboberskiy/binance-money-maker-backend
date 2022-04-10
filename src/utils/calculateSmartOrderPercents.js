export default (
  rate,
  { stopLossPercent, updateFixRatePercent, sellingPercent },
  omitSellingPrice
) => {
  const amounts = {
    stopLossAmount: rate - rate * (stopLossPercent / 100),
    updateFixRateAmount: rate + rate * (updateFixRatePercent / 100),
  };
  if (!omitSellingPrice) {
    amounts.sellingPrice = rate + rate * (sellingPercent / 100);
  }
  return amounts;
};
