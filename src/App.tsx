import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import DonorDashboard from './DonorDashboard';
import RecipientDashboard from './RecipientDashboard';

type AppView = 'login' | 'signup' | 'phone-verification' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [userInfo, setUserInfo] = useState<any>(null);

  const navigateToSignup = () => setCurrentView('signup');
  const navigateToLogin = () => setCurrentView('login');
  const navigateToPhoneVerification = (user: any) => {
    setUserInfo(user);
    setCurrentView('phone-verification');
  };
  const navigateToDashboard = () => setCurrentView('dashboard');

  const handleAuthSuccess = (data: any) => {
    console.log('Auth Success:', data);
    console.log('User Info:', data.user);
    console.log('User Role:', data.user?.role);
    setUserInfo(data.user);
    localStorage.setItem('token', data.token);
    if (data.requiresPhoneVerification) {
      setCurrentView('phone-verification');
    } else {
      setCurrentView('dashboard');
    }
  };
  return (
    <div className="App">
      {currentView === 'login' && (
        <LoginPage 
          onNavigateToSignup={navigateToSignup}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      {currentView === 'signup' && (
        <SignupPage 
          onNavigateToLogin={navigateToLogin}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      {currentView === 'dashboard' && (
        <>
          {String(userInfo?.role).trim().toLowerCase() === 'donor' ? (
            <DonorDashboard 
              user={userInfo}
              onLogout={() => {
                localStorage.removeItem('token');
                setUserInfo(null);
                setCurrentView('login');
              }}
            />
          ) : String(userInfo?.role).trim().toLowerCase() === 'recipient' ? (
            <RecipientDashboard 
              user={userInfo}
              onLogout={() => {
                localStorage.removeItem('token');
                setUserInfo(null);
                setCurrentView('login');
              }}
            />
          ) : (
            <div>
              <h2>Unknown role: {String(userInfo?.role)}</h2>
              <button onClick={() => setCurrentView('login')}>Back to Login</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;