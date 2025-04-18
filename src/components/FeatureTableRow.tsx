
import React from 'react';
import { FeatureNode } from '@/hooks/useFeatureTree';
import { FeatureCell } from './feature/FeatureCell';
import { ParentCell } from './feature/ParentCell';
import { ValueCell } from './feature/ValueCell';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FeatureTableRowProps {
  node: FeatureNode;
  onToggle: (id: string) => void;
}

export const FeatureTableRow: React.FC<FeatureTableRowProps> = ({ node, onToggle }) => {
  const { id, feature, value, parent, level, error, description, expectedType } = node;
  
  return (
    <tr className="border-t border-gray-800 hover:bg-gray-900/50">
      <td className="py-2 pl-4 pr-2 align-top">
        <FeatureCell
          feature={feature}
          level={level}
          hasChildren={node.children.length > 0}
          isExpanded={node.isExpanded}
          onToggle={() => onToggle(id)}
        />
      </td>
      <td className="py-2 px-2 align-top">
        <ParentCell parent={parent} />
      </td>
      <td className="py-2 px-2 align-top">
        <ValueCell value={value} error={error} expectedType={expectedType} />
      </td>
      <td className="py-2 pl-2 pr-4 align-top text-right">
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center" className="max-w-xs">
                <p className="text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </td>
    </tr>
  );
};
