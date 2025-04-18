
import React from 'react';

export const FormattedValue: React.FC<{
  value: string | boolean | undefined;
}> = ({ value }) => {
  if (value === undefined) {
    return <span className="text-gray-400">undefined</span>;
  }

  // Handle boolean values directly
  if (typeof value === 'boolean') {
    return value ? (
      <span className="text-emerald-400">true</span>
    ) : (
      <span className="text-red-400">false</span>
    );
  }

  // Check if the value is an array (it will be a string but formatted as [item1, item2])
  if (typeof value === 'string') {
    // Handle arrays that already have brackets
    if (value.startsWith('[') && value.endsWith(']')) {
      return <span className="text-[#8B5CF6]">{value}</span>;
    }
    
    // Handle objects
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        // Try to pretty print the JSON
        const parsed = JSON.parse(value);
        return <span className="text-yellow-300">{JSON.stringify(parsed, null, 2)}</span>;
      } catch {
        return <span className="text-yellow-300">{value}</span>;
      }
    }
    
    // Handle numbers
    if (!isNaN(Number(value)) && value !== '') {
      return <span className="text-blue-400">{value}</span>;
    }
    
    // Handle null values
    if (value === 'null') {
      return <span className="text-gray-500">null</span>;
    }
    
    // Handle special values
    if (value === 'undefined') {
      return <span className="text-gray-400">undefined</span>;
    }

    // Handle boolean strings - convert them to properly colored booleans
    if (value === 'true') {
      return <span className="text-emerald-400">true</span>;
    }
    if (value === 'false') {
      return <span className="text-red-400">false</span>;
    }
  }

  // Default case: treat as string
  return <span className="text-orange-400">{value}</span>;
};
