
import React from 'react';

interface FormattedValueProps {
  value: string | boolean | undefined;
  expectedType?: string;
}

export const FormattedValue: React.FC<FormattedValueProps> = ({ 
  value, 
  expectedType 
}) => {
  if (value === undefined) {
    return <span className="text-gray-400">undefined</span>;
  }

  // Handle boolean values directly
  if (typeof value === 'boolean') {
    if (expectedType && expectedType !== 'boolean') {
      return <span className="text-yellow-500 font-bold" title={`Expected type: ${expectedType}, got: boolean`}>
        {value ? 'true' : 'false'} ⚠️
      </span>;
    }
    return value ? (
      <span className="text-emerald-400">true</span>
    ) : (
      <span className="text-red-400">false</span>
    );
  }

  // Check if the value is an array (it will be a string but formatted as [item1, item2])
  if (typeof value === 'string') {
    // Type validation warnings
    let typeWarning = false;
    
    if (expectedType) {
      if (expectedType === 'number' && !isNaN(Number(value)) && value !== '') {
        // This is fine - a string that can be converted to a number
      } else if (expectedType === 'array' && (value.includes(',') || (value.startsWith('[') && value.endsWith(']')))) {
        // This is fine - a string that represents an array
      } else if (expectedType === 'object' && value.startsWith('{') && value.endsWith('}')) {
        // This is fine - a string that represents an object
      } else if (expectedType === 'boolean' && (value === 'true' || value === 'false')) {
        // This is fine - a string that represents a boolean
      } else if (expectedType !== 'string') {
        typeWarning = true;
      }
    }

    // Handle arrays - check if it's a comma-separated list without brackets (like returned from Array.join)
    if (value.includes(',') && !value.startsWith('[') && !value.includes('{')) {
      // Add brackets to make it clear it's an array
      return <span className={`text-[#8B5CF6] ${typeWarning ? 'font-bold' : ''}`}>
        [{value}]{typeWarning ? ' ⚠️' : ''}
      </span>;
    }
    
    // Handle arrays that already have brackets
    if (value.startsWith('[') && value.endsWith(']')) {
      return <span className={`text-[#8B5CF6] ${typeWarning ? 'font-bold' : ''}`}>
        {value}{typeWarning ? ' ⚠️' : ''}
      </span>;
    }
    
    // Handle objects
    if (value.startsWith('{') && value.endsWith('}')) {
      return <span className={`text-yellow-300 ${typeWarning ? 'font-bold' : ''}`}>
        {value}{typeWarning ? ' ⚠️' : ''}
      </span>;
    }
    
    // Handle numbers
    if (!isNaN(Number(value)) && value !== '') {
      return <span className={`text-blue-400 ${typeWarning ? 'font-bold' : ''}`}>
        {value}{typeWarning ? ' ⚠️' : ''}
      </span>;
    }
    
    // Handle null values
    if (value === 'null') {
      return <span className={`text-gray-500 ${typeWarning ? 'font-bold' : ''}`}>
        null{typeWarning ? ' ⚠️' : ''}
      </span>;
    }
    
    // Handle special values
    if (value === 'undefined') {
      return <span className={`text-gray-400 ${typeWarning ? 'font-bold' : ''}`}>
        undefined{typeWarning ? ' ⚠️' : ''}
      </span>;
    }

    // Handle boolean strings - convert them to properly colored booleans
    if (value === 'true') {
      return <span className={`text-emerald-400 ${typeWarning ? 'font-bold' : ''}`}>
        true{typeWarning ? ' ⚠️' : ''}
      </span>;
    }
    if (value === 'false') {
      return <span className={`text-red-400 ${typeWarning ? 'font-bold' : ''}`}>
        false{typeWarning ? ' ⚠️' : ''}
      </span>;
    }
    
    // Handle specific string types like user_agent and webglRenderer
    if (value.includes('Mozilla') || 
        value.includes('Chrome') || 
        value.includes('Firefox') || 
        value.includes('Safari') || 
        value.includes('ANGLE') || 
        value.includes('WebGL') || 
        value.includes('Intel') || 
        value.includes('NVIDIA')) {
      return <span className={`text-green-400 ${typeWarning ? 'font-bold' : ''}`}>
        "{value}"{typeWarning ? ' ⚠️' : ''}
      </span>;
    }
  }

  // Default case: treat as string (for other string values)
  const typeWarning = expectedType && expectedType !== 'string';
  return <span className={`text-orange-400 ${typeWarning ? 'font-bold' : ''}`}>
    "{value}"{typeWarning ? ' ⚠️' : ''}
  </span>;
};
