
import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";

interface MetadataDialogProps {
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

const MetadataContent: React.FC<MetadataDialogProps> = (props) => {
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
        <p className="text-sm font-mono text-gray-400">
          {props.value === undefined ? 'undefined' : String(props.value)}
        </p>
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
        <p className="text-sm font-mono text-gray-400">{String(props.hasChildren)}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">Is Expanded</h4>
        <p className="text-sm font-mono text-gray-400">{String(props.isExpanded)}</p>
      </div>
    </div>
  );
};

export const MetadataDialog: React.FC<MetadataDialogProps> = (props) => {
  return (
    <div className="inline-block">
      <HoverCard>
        <Drawer shouldScaleBackground={false}>
          <DrawerTrigger asChild>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                <Info className="h-4 w-4 text-gray-400" />
              </Button>
            </HoverCardTrigger>
          </DrawerTrigger>
          
          <DrawerContent className="max-h-screen fixed inset-y-0 right-0 mt-0 pt-0 h-full w-[400px] rounded-l-lg rounded-r-none">
            <DrawerHeader className="text-left">
              <DrawerTitle>Feature Metadata</DrawerTitle>
            </DrawerHeader>
            <ScrollArea className="h-[calc(100vh-120px)] px-4">
              <MetadataContent {...props} />
            </ScrollArea>
          </DrawerContent>
        </Drawer>
        
        <HoverCardContent className="w-80" side="right" align="start">
          <MetadataContent {...props} />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
