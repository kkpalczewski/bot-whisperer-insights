import { BaseDetectionFeatureSchema, FeatureValue } from "@/detection/types/detectionSchema";

// UI-specific properties
export interface FeatureUIProps extends FeatureValue {
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

// Combined interface for metadata dialog
export interface MetadataDialogProps extends BaseDetectionFeatureSchema, FeatureUIProps {} 