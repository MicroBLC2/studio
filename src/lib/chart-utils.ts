import type { SpectroReading, ControlLimits, OutOfControlPoint } from '@/types';

// Constants for I-MR chart calculations (subgroup size n=2 for Moving Ranges)
const D2 = 1.128; // For MR chart, used in I-chart limits
const D3_N2 = 0;   // Lower control limit factor for MR chart with n=2
const D4_N2 = 3.267; // Upper control limit factor for MR chart with n=2

export function calculateIMRControlLimits(readings: SpectroReading[]): ControlLimits {
  if (readings.length < 2) {
    return {}; // Not enough data to calculate reliable limits
  }

  const values = readings.map(r => r.value);
  
  // Calculate Moving Ranges
  const movingRanges: number[] = [];
  for (let i = 1; i < values.length; i++) {
    movingRanges.push(Math.abs(values[i] - values[i-1]));
  }

  if (movingRanges.length === 0) {
    // Handle case with only one reading after initial check, though length check should prevent this.
    // Or if all readings are identical, MR could be all zeros.
    // For now, if no moving ranges, can't calculate MR based limits.
    const meanX = values.reduce((sum, val) => sum + val, 0) / values.length;
    return { meanX };
  }
  
  const meanMR = movingRanges.reduce((sum, val) => sum + val, 0) / movingRanges.length;
  const meanX = values.reduce((sum, val) => sum + val, 0) / values.length;

  const sigmaXEstimate = meanMR / D2;

  // I-Chart limits
  const uclX = meanX + 3 * sigmaXEstimate;
  const lclX = meanX - 3 * sigmaXEstimate;

  // MR-Chart limits
  const uclMR = D4_N2 * meanMR;
  const lclMR = D3_N2 * meanMR; // This will be 0 for n=2

  return {
    meanX,
    uclX,
    lclX,
    meanMR,
    uclMR,
    lclMR,
  };
}

export function detectOutOfControlPoints(
  readings: SpectroReading[],
  limits: ControlLimits
): OutOfControlPoint[] {
  const oocPoints: OutOfControlPoint[] = [];
  if (readings.length === 0 || !limits.uclX || !limits.lclX || typeof limits.uclMR === 'undefined') {
    return oocPoints;
  }

  const values = readings.map(r => r.value);

  // Check I-Chart points
  values.forEach((value, index) => {
    if (limits.uclX !== undefined && value > limits.uclX) {
      oocPoints.push({ index, value, type: 'I-Chart', limitViolated: 'UCL', limitValue: limits.uclX, timestamp: readings[index].timestamp });
    }
    if (limits.lclX !== undefined && value < limits.lclX) {
      oocPoints.push({ index, value, type: 'I-Chart', limitViolated: 'LCL', limitValue: limits.lclX, timestamp: readings[index].timestamp });
    }
  });

  // Check MR-Chart points
  if (readings.length > 1 && limits.meanMR !== undefined && limits.uclMR !== undefined) {
    for (let i = 1; i < values.length; i++) {
      const mrValue = Math.abs(values[i] - values[i-1]);
      if (mrValue > limits.uclMR) {
        // MR point index refers to the second point of the pair
        oocPoints.push({ index: i, value: mrValue, type: 'MR-Chart', limitViolated: 'UCL', limitValue: limits.uclMR, timestamp: readings[i].timestamp });
      }
      // LCL for MR chart is often 0, so not typically checked unless D3 > 0
      if (limits.lclMR !== undefined && limits.lclMR > 0 && mrValue < limits.lclMR) {
         oocPoints.push({ index: i, value: mrValue, type: 'MR-Chart', limitViolated: 'LCL', limitValue: limits.lclMR, timestamp: readings[i].timestamp });
      }
    }
  }
  
  return oocPoints;
}
