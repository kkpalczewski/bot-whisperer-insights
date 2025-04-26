import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
import React, { useEffect, useCallback, useMemo } from "react";
import { MetadataContent } from "./metadata/MetadataContent";
import { FeatureNode } from "@/hooks/types";

interface MetadataDialogProps {
  node: FeatureNode;
}

export const MetadataDialog: React.FC<MetadataDialogProps> = ({ node }) => {
  const drawerId = `drawer-${node.parentKey}`;
  const { isOpen, setIsOpen, handleOpen } = useGlobalDrawer(drawerId);
  const isMobile = useIsMobile();

  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Memoize the metadata content to prevent unnecessary re-renders
  const metadataContent = useMemo(() => (
    <MetadataContent node={node}/>
  ), [node]);

  // InfoButton for different contexts
  const InfoButton = React.memo(
    React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
      (props, ref) => (
        <Button
          {...props}
          ref={ref}
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0"
        >
          <Info className="h-4 w-4 text-gray-400" />
        </Button>
      )
    )
  );
  InfoButton.displayName = "InfoButton";

  const renderTooltip = useCallback(() => {
    if (isMobile) {
      return <InfoButton onClick={handleOpen} />;
    }

    if (isOpen) {
      return <InfoButton onClick={handleOpen} />;
    }

    return (
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
            {metadataContent}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }, [isMobile, isOpen, handleOpen, metadataContent]);

  return (
    <div className="inline-block" style={{ position: "relative", zIndex: 30 }}>
      <Drawer
        open={isOpen}
        onOpenChange={setIsOpen}
        shouldScaleBackground={false}
      >
        <DrawerTrigger asChild>
          {renderTooltip()}
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
            {metadataContent}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
