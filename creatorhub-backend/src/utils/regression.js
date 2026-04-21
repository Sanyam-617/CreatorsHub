const linearRegression = (data) => {
  const n = data.length;
  const sumX = data.reduce((sum, _, i) => sum + i, 0);
  const sumY = data.reduce((sum, val) => sum + val, 0);
  const sumXY = data.reduce((sum, val, i) => sum + i * val, 0);
  const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

  const denom = n * sumX2 - sumX * sumX;

  // If all x values are identical (e.g. only 1 data point), slope is undefined — default to 0
  if (denom === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

const calculateR2 = (data, slope, intercept) => {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;

  const ssTot = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);

  // All values are identical — model explains nothing meaningful, return 0
  if (ssTot === 0) return 0;

  const ssRes = data.reduce((sum, val, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(val - predicted, 2);
  }, 0);

  const r2 = 1 - ssRes / ssTot;
  return parseFloat(r2.toFixed(4));
};

module.exports = { linearRegression, calculateR2 };