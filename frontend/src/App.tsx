import React from 'react';
import { Chatbot } from './components/Chatbot';

function App() {
  return (
    <div className="h-screen bg-gradient-to-br from-green-100 to-emerald-100">
      <div className="max-w-4xl mx-auto h-full bg-white shadow-2xl border border-green-100">
        <Chatbot />
      </div>
    </div>
  );
}

export default App;