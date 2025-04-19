import { features } from "@/config/detectionFeatures";
import { findFeatureInfo } from "@/utils/featureLookup";
import React from "react";
import { FormattedValue } from "../feature/FormattedValue";
import { ExpandableValue } from "./ExpandableValue";
import { MetadataSection } from "./MetadataSection";

/**
 * Props for the MetadataContent component
 */
interface MetadataContentProps {
  /** The name of the feature being displayed */
  feature: string;

  /** The value of the feature, which can be a string, boolean, or undefined
   * - String: Raw value from the feature detection
   * - Boolean: True/false for binary features
   * - Undefined: When the feature couldn't be detected
   */
  value: string | boolean | undefined;

  /** The parent feature that contains this feature (empty for root-level features)
   * Example: For 'browser.version', the parent would be 'browser'
   */
  parent: string;

  /** Optional description of what this feature represents and how it's detected
   * Can be overridden by feature-specific descriptions from the detection rules
   */
  description?: string;

  /** Error message if the feature detection failed
   * Helps identify issues with feature detection or browser compatibility
   */
  error?: string;

  /** Nesting level in the feature hierarchy
   * - 0: Root level features (e.g., 'browser')
   * - 1+: Nested features (e.g., 'browser.version')
   */
  level: number;

  /** Unique identifier for the feature
   * Typically constructed as `${parent}.${feature}` or just `${feature}` for root level
   */
  id: string;

  /** Indicates whether this feature has nested child features
   * Used for UI expansion/collapse functionality
   */
  hasChildren: boolean;

  /** Current expansion state of the feature in the UI
   * Controls whether child features are visible
   */
  isExpanded: boolean;

  /** Bot abuse detection information
   * Provides insights into how this feature might indicate automated or bot-like behavior
   * Sourced from detection rules to help identify potential bot activities
   */
  abuse_detection?: {
    /** Specific bot-related abuse indication for this feature */
    bot?: string;
  };
}

export const MetadataContent: React.FC<MetadataContentProps> = (props) => {
  const value = props.value === undefined ? "undefined" : String(props.value);

  // Find feature info using the full path ID
  const {
    description: featureDescription,
    abuseIndication: featureAbuseIndication,
  } = findFeatureInfo(features, props.id);

  // If no specific feature metadata found, try to get parent metadata
  let description = featureDescription;
  let abuseIndication = featureAbuseIndication;
  let isUsingParentDescription = false;
  let isUsingParentAbuseIndication = false;

  if (!description && props.parent) {
    const { description: parentDescription } = findFeatureInfo(
      features,
      props.parent
    );
    if (parentDescription) {
      description = parentDescription;
      isUsingParentDescription = true;
    }
  }

  if (!abuseIndication && props.parent) {
    const { abuseIndication: parentAbuseIndication } = findFeatureInfo(
      features,
      props.parent
    );
    if (parentAbuseIndication) {
      abuseIndication = parentAbuseIndication;
      isUsingParentAbuseIndication = true;
    }
  }

  return (
    <div className="space-y-3">
      <MetadataSection title="Feature">
        <h3 className="text-lg font-mono mb-2">{props.feature}</h3>
      </MetadataSection>

      <MetadataSection title="ID">
        <p className="text-sm font-mono text-gray-400">{props.id}</p>
      </MetadataSection>

      <MetadataSection title="Value">
        <ExpandableValue value={value} />
      </MetadataSection>

      <MetadataSection title="Parent">
        <p className="text-sm font-mono text-gray-400">{props.parent || "—"}</p>
      </MetadataSection>

      {description && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-gray-400 whitespace-pre-line">
            {description}
          </p>
        </div>
      )}

      {abuseIndication && (
        <MetadataSection
          title={
            isUsingParentAbuseIndication
              ? "Parent Bot Abuse Indication"
              : "Bot Abuse Indication"
          }
        >
          <p className="text-sm text-yellow-400">
            {abuseIndication}
            {isUsingParentAbuseIndication && (
              <span className="ml-2 text-xs text-gray-500">
                (inherited from parent)
              </span>
            )}
          </p>
        </MetadataSection>
      )}

      {props.error && (
        <MetadataSection title="Error">
          <p className="text-sm text-red-400">{props.error}</p>
        </MetadataSection>
      )}

      <MetadataSection title="Level">
        <p className="text-sm font-mono text-gray-400">{props.level}</p>
      </MetadataSection>

      <MetadataSection title="Has Children">
        <p className="text-sm font-mono">
          <FormattedValue value={String(props.hasChildren)} />
        </p>
      </MetadataSection>

      <MetadataSection title="Is Expanded">
        <p className="text-sm font-mono">
          <FormattedValue value={String(props.isExpanded)} />
        </p>
      </MetadataSection>
    </div>
  );
};
