import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { FeatureNode } from "@/hooks/useFeatureTree";
import React from "react";
import { FeatureTableRow } from "./FeatureTableRow";

interface FeatureTableProps {
  nodes: FeatureNode[];
  isLoading: boolean;
  onToggleNode: (id: string) => void;
}

export const FeatureTable: React.FC<FeatureTableProps> = ({
  nodes,
  isLoading,
  onToggleNode,
}) => {
  const isMobile = useIsMobile();

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-gray-800">
          <TableHead
            className={`font-medium text-xs py-2 ${
              isMobile ? "w-[45%]" : "w-[35%]"
            }`}
          >
            Feature
          </TableHead>
          <TableHead
            className={`py-2 ${isMobile ? "w-[5%] px-0" : "w-[5%]"}`}
          ></TableHead>
          <TableHead
            className={`font-medium text-xs py-2 ${
              isMobile ? "w-[50%]" : "w-[60%]"
            }`}
          >
            Value
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <FeatureTableRow
            key={node.id}
            feature={node.feature}
            value={node.value}
            type={node.type}
            parent={node.parent}
            isExpanded={node.isExpanded}
            hasChildren={node.children.length > 0}
            onToggle={() => onToggleNode(node.id)}
            level={node.level}
            error={node.error}
            description={node.description}
            isTruncated={node.isTruncated}
          />
        ))}
        {nodes.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-4 text-gray-400">
              {isLoading ? "Loading features..." : "No features found"}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
