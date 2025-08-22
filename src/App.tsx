import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

type AppView = 'login' | 'signup';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');

  const navigateToSignup = () => setCurrentView('signup');
  const navigateToLogin = () => setCurrentView('login');

  return (
    <div className="App">
      {currentView === 'login' ? (
        <LoginPage onNavigateToSignup={navigateToSignup} />
      ) : (
        <SignupPage onNavigateToLogin={navigateToLogin} />
      )}
    </div>
  );
}

export default App;