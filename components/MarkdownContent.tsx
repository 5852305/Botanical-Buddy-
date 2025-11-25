import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <div className="prose prose-emerald prose-sm max-w-none text-slate-700 leading-relaxed">
      <ReactMarkdown
        components={{
          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-emerald-800 mt-4 mb-2" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-emerald-700" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
          p: ({node, ...props}) => <p className="my-2" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
