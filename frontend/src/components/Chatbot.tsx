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
      content: 'Welcome! I\'m your AI assistant. How can I help you today?',
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
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <ChatMessage
            message={{
              id: 'typing',
              type: 'bot',
              content: 'Thinking...',
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