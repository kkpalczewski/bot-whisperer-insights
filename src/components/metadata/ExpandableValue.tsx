import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import { FormattedValue } from "../feature/FormattedValue";

interface ExpandableValueProps {
  value: string;
}

export const ExpandableValue: React.FC<ExpandableValueProps> = ({ value }) => {
  const [isValueExpanded, setIsValueExpanded] = useState(false);
  const lines = value.split("\n");
  const isLongValue = lines.length > 3 || value.length > 150;
  const displayValue = isValueExpanded
    ? value
    : lines.length > 3
    ? lines.slice(0, 3).join("\n") + "\n..."
    : value.length > 150
    ? value.slice(0, 150) + "..."
    : value;

  if (!isLongValue) {
    return (
      <p className="text-sm font-mono whitespace-pre-wrap break-all">
        <FormattedValue value={displayValue} />
      </p>
    );
  }

  return (
    <div className="relative">
      <p className="text-sm font-mono whitespace-pre-wrap break-all">
        <FormattedValue value={displayValue} />
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-2 -top-2 h-6 w-6 p-0"
        onClick={() => setIsValueExpanded(!isValueExpanded)}
      >
        {isValueExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
