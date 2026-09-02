import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGlobalDrawer } from "@/hooks/useGlobalDrawer";
import { Info, X } from "lucide-react";
import React, { useCallback } from "react";
import { MetadataContent } from "./metadata/MetadataContent";
import { FeatureNode } from "@/hooks/types";

interface MetadataDialogProps {
  node: FeatureNode;
}

const InfoButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>((props, ref) => (
  <Button
    {...props}
    ref={ref}
    variant="ghost"
    size="icon"
    className="h-5 w-5 p-0"
    aria-label="Show feature metadata"
  >
    <Info className="h-4 w-4 text-gray-400" />
  </Button>
));
InfoButton.displayName = "InfoButton";

export const MetadataDialog: React.FC<MetadataDialogProps> = ({ node }) => {
  const { isOpen, setIsOpen, handleOpen } = useGlobalDrawer(`drawer-${node.fullKey}`);
  const isMobile = useIsMobile();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const trigger =
    isMobile || isOpen ? (
      <InfoButton onClick={handleOpen} />
    ) : (
      <HoverCard>
        <HoverCardTrigger asChild>
          <InfoButton onClick={handleOpen} />
        </HoverCardTrigger>
        <HoverCardContent
          className="w-80 max-w-[90vw]"
          side="right"
          align="start"
          sideOffset={5}
          alignOffset={0}
          avoidCollisions={true}
        >
          <div className="max-h-[80vh] overflow-y-auto">
            <MetadataContent node={node} />
          </div>
        </HoverCardContent>
      </HoverCard>
    );

  return (
    <div className="inline-block" style={{ position: "relative", zIndex: 30 }}>
      {trigger}
      <Drawer
        open={isOpen}
        onOpenChange={setIsOpen}
        shouldScaleBackground={false}
      >
        <DrawerContent className="fixed inset-y-0 right-0 left-auto h-full w-[400px] rounded-l-lg rounded-r-none max-w-full">
          <DrawerHeader className="flex justify-between items-center text-left">
            <DrawerTitle>Feature Metadata</DrawerTitle>
            <DrawerDescription className="sr-only">
              Details for {node.fullKey}
            </DrawerDescription>
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
            <MetadataContent node={node} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
