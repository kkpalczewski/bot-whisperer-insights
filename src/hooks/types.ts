import { BaseDetectionFeatureSchema, FeatureValue } from "@/detection/types/detectionSchema";

export interface FeatureNode extends 
  BaseDetectionFeatureSchema,
  FeatureValue {
    children: FeatureNode[];
    isExpanded: boolean;
    isTruncated?: boolean;
  }
  