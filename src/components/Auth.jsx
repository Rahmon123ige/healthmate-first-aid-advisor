
import React, { useState } from 'react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Simple login
      const userData = { email: formData.email, name: formData.name || 'User' };
      localStorage.setItem('healthmate_user', JSON.stringify(userData));
      onLogin(userData);
    } else {
      // Simple signup
      const userData = { email: formData.email, name: formData.name };
      localStorage.setItem('healthmate_user', JSON.stringify(userData));
      onLogin(userData);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isLogin ? 'Welcome Back' : 'Join HealthMate'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="auth-button">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-link">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={() => setIsLogin(false)}>
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="#" onClick={() => setIsLogin(true)}>
                Sign in
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
