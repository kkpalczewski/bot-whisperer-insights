
import React from 'react';
import { Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodePreviewProps {
  code: string;
  hasError: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code, hasError }) => {
  return (
    <div className={`${hasError ? 'bg-rose-900/20 border border-rose-800' : 'bg-gray-800'} p-2 rounded flex items-start gap-2`}>
      <Code size={16} className="mt-1 text-gray-400" />
      <SyntaxHighlighter 
        language="javascript"
        style={oneDark}
        customStyle={{
          background: 'transparent',
          padding: 0,
          margin: 0,
          fontSize: '0.75rem',
          overflowX: 'auto',
          flex: 1,
        }}
        codeTagProps={{
          style: { 
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
