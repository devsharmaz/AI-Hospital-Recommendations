import React from 'react';
import { Bot, User, AlertCircle } from 'lucide-react';

export interface Message {
  id: string;
  type: 'user' | 'bot' | 'error' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const renderMarkdown = (text: string) => {
    // Split by lines to process each line
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let listCounter = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ol key={`list-${listCounter++}`} className="list-decimal list-inside space-y-2 my-3 ml-4">
            {currentList}
          </ol>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      // Handle numbered lists (1. 2. 3. etc.)
      const numberedListMatch = trimmedLine.match(/^(\d+)\.\s*\*\*(.*?)\*\*:\s*(.*)/);
      if (numberedListMatch) {
        const [, number, title, description] = numberedListMatch;
        currentList.push(
          <li key={`item-${index}`} className="text-gray-800">
            <span className="font-semibold text-green-600">{title}</span>
            <span className="text-gray-600">: {description}</span>
          </li>
        );
        return;
      }

      // Handle simple numbered lists without bold
      const simpleNumberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)/);
      if (simpleNumberedMatch) {
        const [, number, content] = simpleNumberedMatch;
        currentList.push(
          <li key={`item-${index}`} className="text-gray-800">
            {content}
          </li>
        );
        return;
      }

      // If we have a list and encounter a non-list item, flush the list
      flushList();

      // Handle headers (lines that end with :)
      if (trimmedLine.endsWith(':') && !trimmedLine.includes('**')) {
        elements.push(
          <h3 key={`header-${index}`} className="font-semibold text-gray-900 mt-4 mb-2">
            {trimmedLine.slice(0, -1)}
          </h3>
        );
        return;
      }

      // Handle bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(trimmedLine)) {
        const parts = trimmedLine.split(boldRegex);
        const formattedLine = parts.map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            return <strong key={`bold-${index}-${partIndex}`} className="font-semibold text-gray-900">{part}</strong>;
          }
          return part;
        });
        elements.push(
          <p key={`p-${index}`} className="text-gray-800 leading-relaxed mb-2">
            {formattedLine}
          </p>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={`p-${index}`} className="text-gray-800 leading-relaxed mb-2">
          {trimmedLine}
        </p>
      );
    });

    // Flush any remaining list items
    flushList();

    return elements;
  };

  return <div className="markdown-content">{renderMarkdown(content)}</div>;
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping = false }) => {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const isSystem = message.type === 'system';
  const isBot = message.type === 'bot';

  const getIcon = () => {
    if (isUser) return <User size={16} />;
    if (isError) return <AlertCircle size={16} />;
    return <Bot size={16} />;
  };

  const getMessageStyles = () => {
    if (isSystem) {
      return 'bg-green-50 text-green-700 text-center text-sm py-2 px-4 rounded-full mx-auto max-w-xs border border-green-200';
    }
    if (isUser) {
      return 'bg-green-600 text-white ml-auto max-w-xs lg:max-w-md';
    }
    if (isError) {
      return 'bg-red-50 text-red-700 border border-red-200 max-w-xs lg:max-w-md';
    }
    return 'bg-white text-gray-800 border border-green-100 shadow-sm max-w-lg lg:max-w-2xl';
  };

  const getContainerStyles = () => {
    if (isSystem) return 'flex justify-center mb-4';
    return `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;
  };

  if (isSystem) {
    return (
      <div className={getContainerStyles()}>
        <div className={getMessageStyles()}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerStyles()}>
      <div className={`${getMessageStyles()} rounded-2xl px-4 py-3 relative group`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 mt-1 ${isUser ? 'text-green-200' : isError ? 'text-red-500' : 'text-green-600'}`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="break-words">
              {isBot && !isTyping ? (
                <MarkdownRenderer content={message.content} />
              ) : (
                <div className="whitespace-pre-wrap">
                  {message.content}
                  {isTyping && (
                    <span className="inline-flex ml-1">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse delay-100">●</span>
                      <span className="animate-pulse delay-200">●</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className={`text-xs mt-2 opacity-60 ${isUser ? 'text-green-200' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};