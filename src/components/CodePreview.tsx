
import React from 'react';
import { Code } from 'lucide-react';

interface CodePreviewProps {
  code: string;
  hasError: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code, hasError }) => {
  return (
    <div className={`${hasError ? 'bg-rose-900/20 border border-rose-800' : 'bg-gray-800'} p-2 rounded flex items-start gap-2`}>
      <Code size={16} className="mt-1 text-gray-400" />
      <pre className="text-xs overflow-x-auto whitespace-pre-wrap flex-1 text-gray-300">
        {code}
      </pre>
    </div>
  );
};
