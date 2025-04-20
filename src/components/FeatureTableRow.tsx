import { TableCell, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";
import { MetadataDialog } from "./MetadataDialog";
import { FeatureCell } from "./feature/FeatureCell";
import { ValueCell } from "./feature/ValueCell";

interface FeatureTableRowProps {
  feature: string;
  value: string | boolean | undefined;
  type: "string" | "boolean" | "array" | "object" | "number";
  parent: string;
  level: number;
  onToggle: () => void;
  isExpanded: boolean;
  hasChildren: boolean;
  description?: string;
  error?: string;
  isTruncated?: boolean;
}

export const FeatureTableRow: React.FC<FeatureTableRowProps> = ({
  feature,
  value,
  type,
  parent,
  level,
  onToggle,
  isExpanded,
  hasChildren,
  description,
  error,
  isTruncated,
}) => {
  const id = parent ? `${parent}.${feature}` : feature;
  const isMobile = useIsMobile();

  return (
    <TableRow
      className={`${error ? "bg-red-950/20" : ""} hover:bg-gray-900/50`}
    >
      <TableCell
        className={`py-2 align-top ${
          isMobile ? "min-w-[100px] max-w-[120px] pr-1" : "min-w-[120px]"
        }`}
      >
        <FeatureCell
          feature={feature}
          level={level}
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
        <MetadataDialog
          feature={feature}
          value={value}
          parent={parent}
          description={description}
          error={error}
          type={type}
          level={level}
          id={id}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
        />
      </TableCell>

      <TableCell className="py-2 align-top break-all">
        <ValueCell
          value={value}
          type={type}
          error={error}
          isMobileOptimized={isMobile}
        />
      </TableCell>
    </TableRow>
  );
};
