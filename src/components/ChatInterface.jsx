
import React, { useState, useRef, useEffect } from 'react';

const ChatInterface = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showClinics, setShowClinics] = useState(false);
  const [clinics, setClinics] = useState([]);
  const messagesEndRef = useRef(null);

  const API_KEY = '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';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem(`healthmate_history_${user.email}`);
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setMessages(history.slice(-10));
    }
  }, [user.email]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveToHistory = (newMessages) => {
    const allHistory = JSON.parse(localStorage.getItem(`healthmate_history_${user.email}`) || '[]');
    const updatedHistory = [...allHistory, ...newMessages.slice(-2)];
    localStorage.setItem(`healthmate_history_${user.email}`, JSON.stringify(updatedHistory));
  };

  const getUrgencyLevel = (content) => {
    const highUrgencyKeywords = ['emergency', 'severe', 'urgent', 'chest pain', 'breathing', 'unconscious'];
    const mediumUrgencyKeywords = ['moderate', 'concerning', 'see doctor', 'medical attention'];
    
    const lowerContent = content.toLowerCase();
    
    if (highUrgencyKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'high';
    } else if (mediumUrgencyKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  };

  const callOpenAI = async (userMessage) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are HealthMate, a friendly and empathetic AI health advisor. Your purpose is to provide helpful, non-diagnostic health information and guidance. Always:

1. Be warm, supportive, and understanding
2. Clearly state you're not a doctor and can't diagnose
3. Classify urgency as LOW (minor symptoms), MEDIUM (should see doctor), or HIGH (urgent/emergency)
4. Provide practical self-care tips when appropriate
5. Encourage seeking professional help when needed
6. Be concise but thorough
7. End responses with reassurance

For symptoms, consider:
- Duration and severity
- Age-related factors
- Common vs concerning presentations
- When immediate care is needed

Format your response naturally, but include an urgency assessment.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, and if you're experiencing urgent symptoms, please contact emergency services or visit your nearest clinic.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiResponse = await callOpenAI(inputValue);
      const urgency = getUrgencyLevel(aiResponse);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        urgency
      };

      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        saveToHistory([userMessage, aiMessage]);
        return newMessages;
      });

      if (urgency === 'high') {
        setShowClinics(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const findNearbyClinics = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Mock clinic data
          const mockClinics = [
            {
              name: "City Medical Center",
              address: "123 Main St, Your City",
              distance: "0.5 miles",
              phone: "(555) 123-4567"
            },
            {
              name: "Urgent Care Plus",
              address: "456 Oak Ave, Your City",
              distance: "1.2 miles",
              phone: "(555) 234-5678"
            },
            {
              name: "Community Health Clinic",
              address: "789 Pine St, Your City",
              distance: "2.1 miles",
              phone: "(555) 345-6789"
            }
          ];
          
          setClinics(mockClinics);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setClinics([
            {
              name: "General Hospital",
              address: "Emergency services available 24/7",
              distance: "Call for directions",
              phone: "911 or (555) 000-0000"
            }
          ]);
        }
      );
    }
  };

  const quickActions = [
    "I have a headache",
    "I'm feeling nauseous",
    "I have a fever",
    "I'm experiencing chest pain",
    "I have a cut that won't stop bleeding",
    "I'm feeling dizzy"
  ];

  return (
    <div className="chat-container">
      {messages.length === 0 && (
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome to HealthMate, {user.name}! 👋</h2>
          <p className="welcome-subtitle">
            I'm here to help you understand your symptoms and provide health guidance. 
            Please describe how you're feeling, and I'll do my best to help.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🩺</div>
              <h4>Symptom Analysis</h4>
              <p>Describe your symptoms in natural language</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚦</div>
              <h4>Urgency Assessment</h4>
              <p>Get guidance on how urgent your situation is</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h4>Self-Care Tips</h4>
              <p>Receive safe, practical advice for managing symptoms</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h4>Find Nearby Clinics</h4>
              <p>Locate healthcare facilities in your area</p>
            </div>
          </div>
          
          <div className="action-buttons">
            <h4 style={{ width: '100%', marginBottom: '1rem' }}>Quick Actions:</h4>
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="action-button"
                onClick={() => setInputValue(action)}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' ? user.name[0].toUpperCase() : '🩺'}
            </div>
            <div className="message-content">
              {message.content}
              {message.urgency && (
                <div className={`urgency-badge urgency-${message.urgency}`}>
                  {message.urgency.toUpperCase()} URGENCY
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message ai">
            <div className="message-avatar">🩺</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span>HealthMate is thinking</span>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-section">
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms or ask a health question..."
            disabled={isTyping}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={isTyping || !inputValue.trim()}
          >
            {isTyping ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {showClinics && (
        <div className="clinic-finder">
          <h3>🏥 Find Nearby Healthcare Facilities</h3>
          <p>Based on your symptoms, you may want to seek medical attention. Here are nearby options:</p>
          
          <button className="find-clinics-button" onClick={findNearbyClinics}>
            📍 Find Clinics Near Me
          </button>
          
          {clinics.length > 0 && (
            <div className="clinics-list">
              {clinics.map((clinic, index) => (
                <div key={index} className="clinic-item">
                  <div className="clinic-name">{clinic.name}</div>
                  <div className="clinic-address">{clinic.address}</div>
                  <div className="clinic-address">📞 {clinic.phone} • 📍 {clinic.distance}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
