import React from 'react';

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

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
    // Handle arrays
    if (value.startsWith('[') && (value.endsWith(']') || value.endsWith('...'))) {
      const parsed = tryParseJson(value);
      if (Array.isArray(parsed)) {
        return (
          <div className="text-[#8B5CF6]">
            [
            {parsed.map((item, index) => (
              <div key={index} className="ml-4">
                {JSON.stringify(item)}
                {index < parsed.length - 1 ? ',' : ''}
              </div>
            ))}
            ]
          </div>
        );
      }
      // Truncated or unparseable: still format it as an array
      return <span className="text-[#8B5CF6]">{value}</span>;
    }
    
    // Handle objects
    if (value.startsWith('{') && (value.endsWith('}') || value.endsWith('...'))) {
      const parsed = tryParseJson(value);
      return (
        <span className="text-yellow-300">
          {parsed === undefined ? value : JSON.stringify(parsed, null, 2)}
        </span>
      );
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
