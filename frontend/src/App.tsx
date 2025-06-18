import React from 'react';
import { Chatbot } from './components/Chatbot';

function App() {
  return (
    <div className="h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto h-full bg-white shadow-xl">
        <Chatbot />
      </div>
    </div>
  );
}

export default App;