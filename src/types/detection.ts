export interface DetectionResult {
  [key: string]: {
    value?: string | number | boolean | object | Array<unknown>;
    timestamp: string;
    error?: string;
  };
}
