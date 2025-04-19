
import React from 'react';
import { features } from '@/config/detectionFeatures';
import { FormattedValue } from '../feature/FormattedValue';
import { MetadataSection } from './MetadataSection';
import { ExpandableValue } from './ExpandableValue';
import { findFeatureInfo } from '@/utils/featureLookup';

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
  const value = props.value === undefined ? 'undefined' : String(props.value);
  
  // Find feature info using the feature name
  const { description, abuseIndication } = findFeatureInfo(features, props.feature);
  
  return (
    <div className="space-y-3">
      <MetadataSection title="Feature">
        <h3 className="text-lg font-mono mb-2">{props.feature}</h3>
      </MetadataSection>

      <MetadataSection title="Value">
        <ExpandableValue value={value} />
      </MetadataSection>

      {(description || props.description) && (
        <MetadataSection title="Description">
          <p className="text-sm text-gray-400">{description || props.description}</p>
        </MetadataSection>
      )}

      {abuseIndication && (
        <MetadataSection title="Bot Abuse Indication">
          <p className="text-sm text-yellow-400">{abuseIndication}</p>
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
