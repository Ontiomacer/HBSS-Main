import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Fingerprint, 
  Eye, 
  Scan, 
  Shield, 
  Lock, 
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BiometricModal({ isOpen, onClose, onSuccess }: BiometricModalProps) {
  const [authMethod, setAuthMethod] = useState<'biometric' | 'passphrase'>('biometric');
  const [passphrase, setPassphrase] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [authStatus, setAuthStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (authMethod === 'biometric' && authStatus === 'scanning') {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setAuthStatus('success');
            setTimeout(() => {
              onSuccess();
              handleClose();
            }, 1500);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [authMethod, authStatus, onSuccess]);

  const handleBiometricScan = () => {
    setIsScanning(true);
    setAuthStatus('scanning');
    setScanProgress(0);
  };

  const handlePassphraseSubmit = () => {
    if (!passphrase.trim()) return;
    
    // Accept the demo passphrase or any reasonable length passphrase
    if (passphrase === 'cipher-core-2024' || passphrase.length >= 8) {
      setAuthStatus('success');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } else {
      setAuthStatus('failed');
      setTimeout(() => setAuthStatus('idle'), 2000);
    }
  };

  const handleClose = () => {
    setAuthStatus('idle');
    setIsScanning(false);
    setScanProgress(0);
    setPassphrase('');
    onClose();
  };

  const getBiometricIcon = () => {
    switch (authMethod) {
      case 'biometric':
        return authStatus === 'scanning' ? Scan : Fingerprint;
      default:
        return Lock;
    }
  };

  const getStatusColor = () => {
    switch (authStatus) {
      case 'scanning': return 'text-[hsl(var(--cipher-amber))] border-[hsl(var(--cipher-amber))]';
      case 'success': return 'text-[hsl(var(--cipher-terminal))] border-[hsl(var(--cipher-terminal))]';
      case 'failed': return 'text-destructive border-destructive';
      default: return 'text-primary border-primary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-panel max-w-md mx-auto">
        <DialogTitle className="sr-only">Secure Access Authentication</DialogTitle>
        <DialogDescription className="sr-only">
          Authenticate using biometric scan or master passphrase to access CipherCore
        </DialogDescription>
        <div className="space-y-6 p-6">
          
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary mr-2" />
              <h2 className="text-xl font-bold holo-text">Secure Access</h2>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Authenticate to access CipherCore
            </p>
          </div>

          {/* Auth Method Toggle */}
          <div className="flex space-x-2">
            <Button
              variant={authMethod === 'biometric' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setAuthMethod('biometric')}
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              Biometric
            </Button>
            <Button
              variant={authMethod === 'passphrase' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setAuthMethod('passphrase')}
            >
              <Lock className="w-4 h-4 mr-2" />
              Passphrase
            </Button>
          </div>

          {/* Biometric Scanner */}
          {authMethod === 'biometric' && (
            <div className="space-y-4">
              <div className="relative">
                <div className={`w-32 h-32 mx-auto rounded-full border-4 ${getStatusColor()} flex items-center justify-center transition-all duration-300`}>
                  {(() => {
                    const Icon = getBiometricIcon();
                    return (
                      <Icon 
                        className={`w-16 h-16 ${authStatus === 'scanning' ? 'animate-pulse' : ''}`} 
                      />
                    );
                  })()}
                  
                  {authStatus === 'scanning' && (
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[hsl(var(--cipher-amber))] animate-spin" />
                  )}
                  
                  {authStatus === 'success' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="w-20 h-20 text-[hsl(var(--cipher-terminal))] animate-scale-in" />
                    </div>
                  )}
                  
                  {authStatus === 'failed' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <AlertTriangle className="w-20 h-20 text-destructive animate-scale-in" />
                    </div>
                  )}
                </div>
                
                {authStatus === 'scanning' && (
                  <div className="mt-4">
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div 
                        className="bg-[hsl(var(--cipher-amber))] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center mt-2 font-mono text-[hsl(var(--cipher-amber))]">
                      Scanning... {Math.round(scanProgress)}%
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                {authStatus === 'idle' && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Place your finger on the scanner
                    </p>
                    <Button 
                      onClick={handleBiometricScan}
                      className="cipher-button"
                      disabled={isScanning}
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      Start Scan
                    </Button>
                  </>
                )}
                
                {authStatus === 'scanning' && (
                  <p className="text-sm text-[hsl(var(--cipher-amber))] font-mono">
                    Analyzing biometric data...
                  </p>
                )}
                
                {authStatus === 'success' && (
                  <p className="text-sm text-[hsl(var(--cipher-terminal))] font-mono">
                    Authentication successful
                  </p>
                )}
                
                {authStatus === 'failed' && (
                  <p className="text-sm text-destructive font-mono">
                    Authentication failed
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Passphrase Input */}
          {authMethod === 'passphrase' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Master Passphrase
                </label>
                <Input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter master passphrase..."
                  className="terminal-input"
                  onKeyPress={(e) => e.key === 'Enter' && handlePassphraseSubmit()}
                />
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  Hint: cipher-core-2024
                </p>
              </div>
              
              <Button 
                onClick={handlePassphraseSubmit}
                className="cipher-button w-full"
                disabled={!passphrase.trim() || authStatus === 'success'}
              >
                {authStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Authenticated
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Authenticate
                  </>
                )}
              </Button>
              
              {authStatus === 'failed' && (
                <div className="text-center">
                  <p className="text-sm text-destructive font-mono">
                    Invalid passphrase
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Badges */}
          <div className="flex justify-center space-x-2">
            <Badge variant="outline" className="border-primary text-primary text-xs">
              <Shield className="w-3 h-3 mr-1" />
              AES-256
            </Badge>
            <Badge variant="outline" className="border-[hsl(var(--cipher-terminal))] text-[hsl(var(--cipher-terminal))] text-xs">
              <Lock className="w-3 h-3 mr-1" />
              SECURE
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}