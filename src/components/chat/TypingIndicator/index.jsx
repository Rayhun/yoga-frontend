const TypingIndicator = () => (
  <div className="max-w-125 w-fit">
    <div className="mb-2.5 rounded-2xl rounded-tl-none bg-white px-5 py-3">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
