
import React from 'react';
import { features } from '@/config/detectionFeatures';
import { FormattedValue } from '../feature/FormattedValue';
import { MetadataSection } from './MetadataSection';
import { ExpandableValue } from './ExpandableValue';
import { findFeatureInfo } from '@/utils/featureLookup';

interface MetadataContentProps {
  feature: string;
  value: string | boolean | undefined;
  parent: string;
  description?: string;
  error?: string;
  level: number;
  id: string;
  hasChildren: boolean;
  isExpanded: boolean;
}

export const MetadataContent: React.FC<MetadataContentProps> = (props) => {
  const value = props.value === undefined ? 'undefined' : String(props.value);
  
  // Find feature info using the full path ID
  const { description, abuseIndication } = findFeatureInfo(features, props.id);
  
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
