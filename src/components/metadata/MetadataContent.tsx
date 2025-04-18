
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { FormattedValue } from '../feature/FormattedValue';
import { features } from '@/config/detectionFeatures';

interface MetadataContentProps {
  feature: string;
  value: string | boolean | undefined;
  parent: string;
  description?: string;
  error?: string;
  level: number;
  id: string;
  hasChildren: boolean;
  isExpanded: boolean;
}

export const MetadataContent: React.FC<MetadataContentProps> = (props) => {
  const [isValueExpanded, setIsValueExpanded] = useState(false);
  const value = props.value === undefined ? 'undefined' : String(props.value);
  const lines = value.split('\n');
  const isLongValue = lines.length > 3 || value.length > 150;
  const displayValue = isValueExpanded ? value : 
    (lines.length > 3 ? lines.slice(0, 3).join('\n') + '\n...' : 
      value.length > 150 ? value.slice(0, 150) + '...' : value);
  
  // Find feature definition from config to get abuse indication
  const featureItem = features.find(f => 
    props.id.startsWith(f.codeName) || 
    (f.dependency && props.id.startsWith(f.dependency))
  );
  
  // Get the abuse indication for bots if available
  const abuseIndication = featureItem?.abuse_indication?.bot;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-mono mb-2">{props.feature}</h3>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-1">ID</h4>
        <p className="text-sm font-mono text-gray-400">{props.id}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">Value</h4>
        <div className="relative">
          <p className="text-sm font-mono whitespace-pre-wrap break-all">
            <FormattedValue value={displayValue} />
          </p>
          {isLongValue && (
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
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">Parent</h4>
        <p className="text-sm font-mono text-gray-400">{props.parent}</p>
      </div>

      {props.description && (
        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-gray-400">{props.description}</p>
        </div>
      )}

      {abuseIndication && (
        <div>
          <h4 className="text-sm font-medium mb-1">Bot Abuse Indication</h4>
          <p className="text-sm text-yellow-400">{abuseIndication}</p>
        </div>
      )}

      {props.error && (
        <div>
          <h4 className="text-sm font-medium mb-1">Error</h4>
          <p className="text-sm text-red-400">{props.error}</p>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium mb-1">Level</h4>
        <p className="text-sm font-mono text-gray-400">{props.level}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">Has Children</h4>
        <p className="text-sm font-mono">
          <FormattedValue value={String(props.hasChildren)} />
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">Is Expanded</h4>
        <p className="text-sm font-mono">
          <FormattedValue value={String(props.isExpanded)} />
        </p>
      </div>
    </div>
  );
};
