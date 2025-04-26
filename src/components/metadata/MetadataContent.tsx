import { detectionModule } from "@/detection";
import React from "react";
import { FormattedValue } from "../feature/FormattedValue";
import { ExpandableValue } from "./ExpandableValue";
import { MetadataSection } from "./MetadataSection";
import { BaseDetectionFeature } from "@/detection/types/detectionSchema";
import { FeatureNode } from "@/hooks/types";
/**
 * Props for the MetadataContent component
 */
interface MetadataContentProps {
  node: FeatureNode;
}

export const MetadataContent: React.FC<MetadataContentProps> = ({ node }) => {
  const value = node.value === undefined ? "undefined" : String(node.value);

  // Get feature metadata using the public API
  let {
    description, abuseIndication, exemplaryValues
  } = detectionModule.getFeatureMetadata(node.fullKey);

  // If no specific feature metadata found, try to get parent metadata
  let isUsingParentDescription = false;
  let isUsingParentAbuseIndication = false;
  let isUsingParentExemplaryValues = false;

  if (!description && node.parentKey) {
    const { description: parentDescription } =
      detectionModule.getFeatureMetadata(node.parentKey);
    if (parentDescription) {
      description = parentDescription;
      isUsingParentDescription = true;
    }
  }

  if (!abuseIndication && node.parentKey) {
    const { abuseIndication: parentAbuseIndication } =
      detectionModule.getFeatureMetadata(node.parentKey);
    if (parentAbuseIndication) {
      abuseIndication = parentAbuseIndication;
      isUsingParentAbuseIndication = true;
    }
  }

  if (!exemplaryValues && node.parentKey) {
    const { exemplaryValues: parentExemplaryValues } =
      detectionModule.getFeatureMetadata(node.parentKey);
    if (parentExemplaryValues) {
      exemplaryValues = parentExemplaryValues;
      isUsingParentExemplaryValues = true;
    }
  }

  // Defensive: ensure displayAbuseIndication is never null or undefined
  const displayAbuseIndication = abuseIndication || "";
  const displayAbuseIndicationString = typeof abuseIndication === "object"
    ? abuseIndication?.bot ?? ""
    : String(abuseIndication || "");

  return (
    <div className="space-y-3 pr-4">
      <MetadataSection title="Feature">
        <h3 className="text-lg font-mono mb-2">{node.name}</h3>
      </MetadataSection>

      <MetadataSection title="ID">
        <p className="text-sm font-mono text-gray-400 break-all whitespace-pre-wrap">
          {node.fullKey}
        </p>
      </MetadataSection>

      <MetadataSection title="Value">
        <div className="max-w-full overflow-hidden">
          <ExpandableValue value={value} />
        </div>
      </MetadataSection>

      {description && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-gray-400 whitespace-pre-line">
            {description}
          </p>
          {isUsingParentDescription && (
            <p className="text-xs text-gray-500 mt-1">
              (inherited from parent)
            </p>
          )}
        </div>
      )}

      {displayAbuseIndicationString && (
        <MetadataSection
          title={
            isUsingParentAbuseIndication
              ? "Parent Bot Abuse Indication"
              : "Bot Abuse Indication"
          }
        >
          <p className="text-sm text-yellow-400">
            {displayAbuseIndicationString}
            {isUsingParentAbuseIndication && (
              <span className="ml-2 text-xs text-gray-500">
                (inherited from parent)
              </span>
            )}
          </p>
        </MetadataSection>
      )}

      {exemplaryValues && (
        <MetadataSection
          title={
            isUsingParentExemplaryValues
              ? "Parent Exemplary Values"
              : "Exemplary Values"
          }
        >
          <div className="space-y-2">
            {exemplaryValues.map((example, index) => (
              <div key={index} className="text-sm font-mono text-gray-400">
                <ExpandableValue value={JSON.stringify(example, null, 2)} />
              </div>
            ))}
            {isUsingParentExemplaryValues && (
              <span className="text-xs text-gray-500">
                (inherited from parent)
              </span>
            )}
          </div>
        </MetadataSection>
      )}

      <MetadataSection title="Type">
        <p className="text-sm font-mono text-gray-400 capitalize">
          {node.type}
        </p>
      </MetadataSection>

      <MetadataSection title="Parent">
        <p className="text-sm font-mono text-gray-400">{node.parentKey || "—"}</p>
      </MetadataSection>

      {node.error && (
        <MetadataSection title="Error">
          <p className="text-sm text-red-400">{node.error}</p>
        </MetadataSection>
      )}

      <MetadataSection title="Has Children">
        <p className="text-sm font-mono">
          <FormattedValue value={String(node.children.length > 0)} />
        </p>
      </MetadataSection>

      <MetadataSection title="Is Expanded">
        <p className="text-sm font-mono">
          <FormattedValue value={String(node.isExpanded)} />
        </p>
      </MetadataSection>
    </div>
  );
};
