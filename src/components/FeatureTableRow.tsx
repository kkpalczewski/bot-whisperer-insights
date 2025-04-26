import { TableCell, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";
import { MetadataDialog } from "./MetadataDialog";
import { FeatureCell } from "./feature/FeatureCell";
import { ValueCell } from "./feature/ValueCell";
import { DetectionFeature } from "@/detection/types/detectionSchema";
import { FeatureNode } from "@/hooks/types";

type FeatureTableRowProps = {
  node: FeatureNode;
  onToggle: () => void;
  isExpanded: boolean;
  hasChildren: boolean;
};

export const FeatureTableRow: React.FC<FeatureTableRowProps> = ({
  node,
  onToggle,
  isExpanded,
  hasChildren,
}) => {
  const isMobile = useIsMobile();

  return (
    <TableRow
      className={`${node.error ? "bg-red-950/20" : ""} hover:bg-gray-900/50`}
    >
      <TableCell
        className={`py-2 align-top ${
          isMobile ? "min-w-[100px] max-w-[120px] pr-1" : "min-w-[120px]"
        }`}
      >
        <FeatureCell
          featureKey={node.featureKey ?? node.fullKey}
          level={node.level}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggle={onToggle}
        />
      </TableCell>

      <TableCell
        className={`py-2 align-top ${
          isMobile ? "w-[32px] px-0" : "w-[40px] pr-1"
        }`}
      >
        <MetadataDialog node={node} />
      </TableCell>

      <TableCell className="py-2 align-top break-all">
        <ValueCell
          value={node.value}
          type={node.type}
          error={node.error}
          isMobileOptimized={isMobile}
        />
      </TableCell>
    </TableRow>
  );
};
