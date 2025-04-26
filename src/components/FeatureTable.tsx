import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { FeatureNode } from "@/hooks/types";
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

  // Recursive rendering of tree rows
  const renderRows = (nodes: FeatureNode[]) => (
    nodes.map(node => (
      <React.Fragment key={node.fullKey}>
        <FeatureTableRow
          node={node}
          onToggle={() => onToggleNode(node.fullKey)}
          hasChildren={node.children.length > 0}
          isExpanded={node.isExpanded}
          level={node.level}
        />
        {node.isExpanded && node.children.length > 0 && renderRows(node.children)}
      </React.Fragment>
    ))
  );

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
        {renderRows(nodes)}
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
