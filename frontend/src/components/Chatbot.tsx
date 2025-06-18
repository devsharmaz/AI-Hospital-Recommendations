import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Message } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome! I\'m here to help you find the best hospitals. Ask me for recommendations!',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage,
    });

    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8080/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_query: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setIsTyping(false);
      
      // Extract the response content from the API response
      let responseContent = '';
      if (data && typeof data === 'object' && data.response) {
        responseContent = data.response;
      } else if (typeof data === 'string') {
        responseContent = data;
      } else {
        responseContent = JSON.stringify(data, null, 2);
      }
      
      // Add bot response
      addMessage({
        type: 'bot',
        content: responseContent,
      });

    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
      
      let errorMessage = 'Sorry, I encountered an error while processing your request.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check if the service is running on port 8080.';
        } else if (error.message.includes('HTTP error')) {
          errorMessage = 'The server returned an error. Please try again later.';
        }
      }

      addMessage({
        type: 'error',
        content: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Find the last user message and resend it
    const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  const isServerError = messages.some(msg => 
    msg.type === 'error' && 
    msg.content.includes('Unable to connect to the server')
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Hospital-themed background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-8 h-8 text-green-300">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="absolute top-32 right-20 w-6 h-6 text-green-200">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H6v-4h4V5h4v4h4v4h-4v4z"/>
          </svg>
        </div>
        <div className="absolute bottom-20 left-16 w-10 h-10 text-emerald-200">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="absolute top-1/2 right-10 w-7 h-7 text-green-300">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4H6v-4h4V5h4v4h4v4h-4v4z"/>
          </svg>
        </div>
        <div className="absolute bottom-32 right-32 w-5 h-5 text-emerald-300">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      </div>

      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative z-10">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <ChatMessage
            message={{
              id: 'typing',
              type: 'bot',
              content: 'Searching for hospitals...',
              timestamp: new Date(),
            }}
            isTyping={true}
          />
        )}
        
        {isServerError && (
          <div className="flex justify-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertTriangle size={16} />
                <span className="font-medium">Connection Issue</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Make sure the recommendation service is running on port 8080.
              </p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-sm font-medium transition-colors"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={false}
      />
    </div>
  );
};