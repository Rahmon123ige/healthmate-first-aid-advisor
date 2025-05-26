
import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  urgency?: 'low' | 'medium' | 'high';
}

interface ChatHistoryProps {
  user: { email: string; name: string };
  onLoadConversation: (messages: Message[]) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ user, onLoadConversation }) => {
  const [history, setHistory] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    loadChatHistory();
  }, [user.email]);

  const loadChatHistory = () => {
    const savedHistory = localStorage.getItem(`healthmate_history_${user.email}`);
    if (savedHistory) {
      const historyData = JSON.parse(savedHistory);
      setHistory(historyData);
      
      // Group messages into conversations (pairs of user + AI messages)
      const grouped = [];
      for (let i = 0; i < historyData.length; i += 2) {
        if (historyData[i] && historyData[i + 1]) {
          grouped.push({
            id: historyData[i].id,
            userMessage: historyData[i].content,
            aiResponse: historyData[i + 1].content,
            timestamp: new Date(historyData[i].timestamp),
            urgency: historyData[i + 1].urgency
          });
        }
      }
      setConversations(grouped.reverse()); // Most recent first
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(`healthmate_history_${user.email}`);
    setHistory([]);
    setConversations([]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const loadConversation = (conversation: any) => {
    // Find the original messages in history
    const userMsg = history.find(msg => msg.id === conversation.id);
    const aiMsg = history.find(msg => msg.id === (parseInt(conversation.id) + 1).toString());
    
    if (userMsg && aiMsg) {
      onLoadConversation([userMsg, aiMsg]);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="history-container">
        <h3 className="history-title">📚 Chat History</h3>
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
          No previous conversations. Start chatting to build your health history!
        </p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="history-title">📚 Chat History</h3>
        <button 
          onClick={clearHistory}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Clear History
        </button>
      </div>
      
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="history-item"
          onClick={() => loadConversation(conversation)}
        >
          <div className="history-date">
            {formatDate(conversation.timestamp)}
            {conversation.urgency && (
              <span className={`urgency-badge urgency-${conversation.urgency}`} style={{ marginLeft: '0.5rem' }}>
                {conversation.urgency.toUpperCase()}
              </span>
            )}
          </div>
          <div className="history-preview">
            {conversation.userMessage.length > 60 
              ? conversation.userMessage.substring(0, 60) + '...'
              : conversation.userMessage
            }
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
