import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import CipherLogin from '@/components/CipherLogin';
import Dashboard from '@/components/Dashboard';
import CipherChat from '@/components/CipherChat';
import CipherBuilder from '@/components/CipherBuilder';
import { NetworkSimulator } from '@/components/NetworkSimulator';
import NetworkSimulatorExtended from '@/components/NetworkSimulatorExtended';
import SecureMessenger from '@/components/SecureMessenger';
import BlackBerrySecureChat from '@/components/BlackBerrySecureChat';
import BlackBerrySettingsPanel from '@/components/BlackBerrySettingsPanel';

export default function Index() {
  const { isSignedIn, isLoaded } = useUser();
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'chat' | 'builder' | 'network' | 'messenger' | 'bb-chat' | 'bb-settings'>('login');

  // Skip CipherCore login if user is authenticated with Clerk
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setCurrentPage('dashboard');
    }
  }, [isLoaded, isSignedIn]);

  const handleLogin = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: 'chat' | 'builder' | 'network' | 'messenger' | 'bb-chat' | 'bb-settings') => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <div className="cyber-particles" />
      
      {currentPage === 'login' && <CipherLogin onLogin={handleLogin} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'chat' && <CipherChat onBack={handleBack} />}
      {currentPage === 'builder' && <CipherBuilder onBack={handleBack} />}
      {currentPage === 'network' && <NetworkSimulatorExtended onBack={handleBack} />}
      {currentPage === 'messenger' && <SecureMessenger onBack={handleBack} />}
      {currentPage === 'bb-chat' && <BlackBerrySecureChat onBack={handleBack} />}
      {currentPage === 'bb-settings' && <BlackBerrySettingsPanel onBack={handleBack} />}
    </div>
  );
}
