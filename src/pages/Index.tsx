
import React, { useState, useEffect } from 'react';
import Auth from '../components/Auth';
import ChatInterface from '../components/ChatInterface';
import ChatHistory from '../components/ChatHistory';

interface User {
  email: string;
  name: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  urgency?: 'low' | 'medium' | 'high';
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('healthmate_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('healthmate_user');
    setUser(null);
    setShowHistory(false);
  };

  const handleLoadConversation = (messages: Message[]) => {
    setShowHistory(false);
    // In a real implementation, you'd pass these messages to the chat interface
    console.log('Loading conversation:', messages);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          🩺 HealthMate
        </div>
        <div className="user-info">
          <span>Welcome, {user.name}</span>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            {showHistory ? 'Chat' : 'History'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showHistory ? (
          <div style={{ maxWidth: '800px', margin: '2rem auto', width: '100%', padding: '0 2rem' }}>
            <ChatHistory user={user} onLoadConversation={handleLoadConversation} />
          </div>
        ) : (
          <ChatInterface user={user} />
        )}
      </main>

      <footer style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '1rem', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <p>
          ⚠️ <strong>Important:</strong> HealthMate provides general health information only. 
          For medical emergencies, call emergency services immediately. 
          Always consult healthcare professionals for serious concerns.
        </p>
      </footer>
    </div>
  );
};

export default Index;
