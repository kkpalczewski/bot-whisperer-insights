
import { useState, useCallback, useEffect } from 'react';

// Global state to ensure only one drawer is open at a time
const globalState = {
  activeDrawerId: null as string | null,
  setActiveDrawer: (id: string | null) => {},
};

export const useGlobalDrawer = (drawerId: string) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    globalState.setActiveDrawer(drawerId);
  }, [drawerId]);

  // Handle closing
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    setIsOpen,
    handleOpen,
    handleClose
  };
};
