import React, { useEffect } from 'react';
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
import { MetadataContent } from './metadata/MetadataContent';
import { useGlobalDrawer } from '@/hooks/useGlobalDrawer';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export const MetadataDialog: React.FC<MetadataDialogProps> = (props) => {
  const drawerId = `drawer-${props.id}`;
  const { isOpen, setIsOpen, handleOpen } = useGlobalDrawer(drawerId);
  const isMobile = useIsMobile();
  
  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Render different components based on device type
  const InfoButton = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-5 w-5 p-0"
      onClick={handleOpen}
    >
      <Info className="h-4 w-4 text-gray-400" />
    </Button>
  );

  return (
    <div className="inline-block" style={{ position: 'relative', zIndex: 30 }}>
      {isMobile ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoButton />
            </TooltipTrigger>
            <TooltipContent>
              <MetadataContent {...props} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <HoverCard>
          <Drawer 
            open={isOpen} 
            onOpenChange={setIsOpen}
            shouldScaleBackground={false}
          >
            <DrawerTrigger asChild>
              <HoverCardTrigger asChild>
                <InfoButton />
              </HoverCardTrigger>
            </DrawerTrigger>
            
            <DrawerContent className="fixed inset-y-0 right-0 left-auto h-full w-[400px] rounded-l-lg rounded-r-none max-w-full">
              <DrawerHeader className="flex justify-between items-center text-left">
                <DrawerTitle>Feature Metadata</DrawerTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
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
      )}
    </div>
  );
};
