
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
  
  // Find feature definition from config for the specific feature
  let featureDefinition = null;
  let description = props.description;
  let abuseIndication = null;

  // Look through all features to find the specific one
  for (const f of features) {
    // First check if this is a top-level feature
    if (props.id === f.codeName) {
      featureDefinition = f;
      break;
    }
    
    // Check if this is a sub-property of a feature with outputs
    if (f.outputs && props.id.startsWith(f.codeName + '.')) {
      const path = props.id.substring(f.codeName.length + 1).split('.');
      let currentOutput = f.outputs;
      let currentPath = f.codeName;
      let foundMatch = true;
      
      // Traverse the outputs object based on the ID path
      for (const segment of path) {
        currentPath += '.' + segment;
        if (currentOutput[segment]) {
          if (currentPath === props.id) {
            // We found the exact feature
            description = currentOutput[segment].description || description;
            abuseIndication = currentOutput[segment].abuse_indication?.bot;
            foundMatch = true;
            break;
          }
          // Continue traversing if this feature has nested outputs
          if (currentOutput[segment].outputs) {
            currentOutput = currentOutput[segment].outputs;
          } else {
            foundMatch = false;
            break;
          }
        } else {
          foundMatch = false;
          break;
        }
      }
      
      if (foundMatch) {
        featureDefinition = f;
        break;
      }
    }
    
    // Handle features with dependencies (like client-side libraries)
    if (f.dependency && props.id.startsWith(f.dependency)) {
      const remainingPath = props.id.substring(f.dependency.length + 1);
      if (!remainingPath) {
        // This is the root dependency
        featureDefinition = f;
        break;
      }
      
      // Check if there are outputs defined for this dependency path
      if (f.outputs) {
        const path = remainingPath.split('.');
        let currentOutput = f.outputs;
        let currentPath = f.dependency;
        let foundMatch = true;
        
        for (const segment of path) {
          currentPath += '.' + segment;
          if (currentOutput[segment]) {
            if (currentPath === props.id) {
              description = currentOutput[segment].description || description;
              abuseIndication = currentOutput[segment].abuse_indication?.bot;
              foundMatch = true;
              break;
            }
            
            if (currentOutput[segment].outputs) {
              currentOutput = currentOutput[segment].outputs;
            } else {
              foundMatch = false;
              break;
            }
          } else {
            foundMatch = false;
            break;
          }
        }
        
        if (foundMatch) {
          featureDefinition = f;
          break;
        }
      }
    }
  }
  
  // If we haven't explicitly found an abuse indication, but found the feature, use the parent one
  if (!abuseIndication && featureDefinition?.abuse_indication?.bot) {
    abuseIndication = featureDefinition.abuse_indication.bot;
  }

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

      {description && (
        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-gray-400">{description}</p>
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
