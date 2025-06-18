import React from 'react';
import { MessageSquare, Zap } from 'lucide-react';

export const ChatHeader: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <MessageSquare size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online and ready to help</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <Zap size={16} />
          <span>Powered by AI</span>
        </div>
      </div>
    </div>
  );
};