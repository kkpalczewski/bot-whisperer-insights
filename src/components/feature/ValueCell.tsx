import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { FormattedValue } from "./FormattedValue";
import { FeatureValue } from "@/detection/types/detectionSchema";

interface ValueCellProps extends FeatureValue {
  type?: string;
  parseValue?: boolean;
  isMobileOptimized?: boolean;
}

export const ValueCell: React.FC<ValueCellProps> = ({
  value,
  type,
  error,
  parseValue,
  isMobileOptimized,
}) => {
  const [isValueExpanded, setIsValueExpanded] = useState(false);

  const parseTypedValue = (
    val: FeatureValue["value"],
    type?: string
  ) => {
    if (val === undefined) return undefined;
    if (typeof val === "boolean") return val;

    try {
      switch (type) {
        case "number":
          return parseFloat(String(val));
        case "boolean":
          return val === "true";
        case "array":
          if (val.startsWith("[") && val.endsWith("]")) {
            return val;
          }
          return Array.isArray(val) ? val : String(val).split(",");
        case "object":
          if (typeof val === "string") {
            if (val.startsWith("{") && val.endsWith("}")) {
              return val;
            }
            return JSON.parse(val);
          }
          return val;
        case "string":
          return String(val);
        default:
          return String(val);
      }
    } catch (e) {
      return String(val);
    }
  };

  const displayValue = parseValue ? parseTypedValue(value, type) : value;

  let stringValue = "";
  if (displayValue === undefined) {
    stringValue = "undefined";
  } else if (typeof displayValue === "boolean") {
    stringValue = String(displayValue);
  } else if (typeof displayValue === "object" && displayValue !== null) {
    try {
      stringValue = JSON.stringify(displayValue, null, 2);
    } catch {
      stringValue = String(displayValue);
    }
  } else {
    stringValue = String(displayValue);
  }

  const lines = stringValue.split("\n");
  const maxLines = isMobileOptimized ? 4 : 2;
  const maxCharsPerLine = isMobileOptimized ? 40 : 150;

  const isLongValue =
    lines.length > maxLines ||
    lines.some((line) => line.length > maxCharsPerLine);

  const truncateValue = (value: string) => {
    const lines = value.split("\n");
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join("\n") + "\n...";
    }

    return lines
      .map((line) =>
        line.length > maxCharsPerLine
          ? line.slice(0, maxCharsPerLine) + "..."
          : line
      )
      .join("\n");
  };

  const displayedValue =
    isLongValue && !isValueExpanded ? truncateValue(stringValue) : stringValue;

  return (
    <div className="relative">
      <div className="flex items-start gap-1">
        <pre className="text-xs font-mono whitespace-pre-wrap break-all font-semibold">
          <FormattedValue value={displayedValue} />
        </pre>
        {isLongValue && (
          <Button
            variant="ghost"
            size="icon"
            className={`h-5 w-5 p-0 flex-shrink-0 ${
              isMobileOptimized ? "-ml-1" : ""
            }`}
            onClick={() => setIsValueExpanded(!isValueExpanded)}
            aria-label={isValueExpanded ? "Show less" : "Show more"}
          >
            {isValueExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        )}
      </div>
      {error && (
        <div className="mt-1">
          <span className="text-xs text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
};
