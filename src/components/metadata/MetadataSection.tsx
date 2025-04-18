
import React from 'react';

interface MetadataSectionProps {
  title: string;
  children: React.ReactNode;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({ title, children }) => {
  if (!children) return null;
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      {children}
    </div>
  );
};
