
import React, { useState, useEffect } from 'react';
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
  DrawerClose,
} from "@/components/ui/drawer";
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";

// Global state to ensure only one drawer is open at a time
const globalState = {
  activeDrawerId: null as string | null,
  setActiveDrawer: (id: string | null) => {},
};

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
  const [isOpen, setIsOpen] = useState(false);
  const drawerId = `drawer-${props.id}`;
  
  // Handle global state to ensure only one drawer is open at a time
  useEffect(() => {
    const prevSetActiveDrawer = globalState.setActiveDrawer;
    
    globalState.setActiveDrawer = (id) => {
      // Close this drawer if another one is opened
      if (id && id !== drawerId && isOpen) {
        setIsOpen(false);
      }
      // Update the global active drawer ID
      globalState.activeDrawerId = id;
      // Call the previous handler if it exists
      if (prevSetActiveDrawer) prevSetActiveDrawer(id);
    };
    
    return () => {
      // Restore the previous handler when unmounting
      globalState.setActiveDrawer = prevSetActiveDrawer;
    };
  }, [drawerId, isOpen]);
  
  // Handle opening the drawer
  const handleOpen = () => {
    setIsOpen(true);
    globalState.setActiveDrawer(drawerId);
  };
  
  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="inline-block" style={{ position: 'relative', zIndex: 30 }}>
      <HoverCard>
        <Drawer 
          open={isOpen} 
          onChange={setIsOpen}
          shouldScaleBackground={false} 
          direction="right" 
          modal={false}
        >
          <DrawerTrigger asChild>
            <HoverCardTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0"
                onClick={handleOpen}
              >
                <Info className="h-4 w-4 text-gray-400" />
              </Button>
            </HoverCardTrigger>
          </DrawerTrigger>
          
          <DrawerContent className="fixed inset-y-0 right-0 left-auto h-full w-[400px] rounded-l-lg rounded-r-none max-w-full">
            <DrawerHeader className="flex justify-between items-center text-left">
              <DrawerTitle>Feature Metadata</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
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
