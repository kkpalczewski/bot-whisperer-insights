
import React from 'react';

export const FormattedValue: React.FC<{
  value: string | boolean | undefined;
}> = ({ value }) => {
  if (value === undefined) {
    return <span className="text-gray-400">undefined</span>;
  }

  if (typeof value === 'boolean') {
    return value ? (
      <span className="text-emerald-400">true</span>
    ) : (
      <span className="text-red-400">false</span>
    );
  }

  // Check if the value is an array (it will be a string but formatted as [item1, item2])
  if (value.startsWith('[') && value.endsWith(']')) {
    return <span className="text-purple-400">{value}</span>;
  }

  // Default case: treat as string
  return <span className="text-orange-400">{value}</span>;
};
