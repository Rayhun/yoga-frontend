import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const StreamingMarkdown = ({ content, isStreaming }) => {
  return (
    <div className="text-black w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          strong: ({ children }) => <strong className="font-bold text-black">{children}</strong>,

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-words"
            >
              {children}
            </a>
          ),

          b: ({ children }) => <strong className="font-bold text-black">{children}</strong>,

          ul: ({ children }) => <ul className="list-disc ml-6 space-y-2 my-2">{children}</ul>,

          ol: ({ children }) => <ol className="list-decimal ml-6 space-y-2 my-2">{children}</ol>,

          li: ({ children }) => (
            <li className="text-black leading-relaxed">
              <div className="inline">{children}</div>
            </li>
          ),

          p: ({ children }) => <p className="mb-3 text-black leading-relaxed break-words">{children}</p>,

          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 break-words">
                  {children}
                </code>
              );
            }

            return (
              <div className="my-3 rounded overflow-hidden bg-gray-100">
                <pre className="overflow-x-auto p-4 text-sm">
                  <code className="font-mono text-gray-800 block" {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },

          pre: ({ children }) => <div className="my-3 w-full overflow-hidden">{children}</div>,

          h1: ({ children }) => (
            <h1 className="text-xl font-bold mb-3 mt-4 text-black break-words">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mb-3 mt-3 text-black break-words">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold mb-2 mt-2 text-black break-words">{children}</h3>
          ),

          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 text-gray-700 break-words">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default StreamingMarkdown;
