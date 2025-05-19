
export interface SpectroReading {
  id: string;
  value: number;
  timestamp: Date;
}

export interface ControlLimits {
  meanX?: number;
  uclX?: number;
  lclX?: number;
  meanMR?: number;
  uclMR?: number;
  lclMR?: number; // Typically 0 for MR chart with n=2 for moving ranges
}

export interface ChartDataPoint {
  name: string; // Typically timestamp or index
  value?: number;
  mr?: number;
  uclX?: number;
  clX?: number;
  lclX?: number;
  uclMR?: number;
  clMR?: number;
  lclMR?: number; // Typically 0
  isOutOfControlX?: boolean;
  isOutOfControlMR?: boolean;
}

export interface OutOfControlPoint {
  index: number;
  value: number;
  type: 'I-Chart' | 'MR-Chart';
  limitViolated: 'UCL' | 'LCL';
  limitValue: number;
  timestamp: Date;
}
