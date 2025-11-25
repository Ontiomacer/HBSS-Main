import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield, Fingerprint, Lock, Eye, EyeOff } from 'lucide-react';

interface CipherLoginProps {
  onLogin: () => void;
}

export default function CipherLogin({ onLogin }: CipherLoginProps) {
  const [passphrase, setPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleLogin = () => {
    if (!passphrase.trim()) return;
    
    setIsDecrypting(true);
    
    // Simulate passphrase validation and decryption process
    setTimeout(() => {
      // Simple validation - in production this would be proper authentication
      if (passphrase === 'cipher-core-2024' || passphrase.length >= 8) {
        setIsDecrypting(false);
        onLogin();
      } else {
        setIsDecrypting(false);
        // Could add error state here
        alert('Invalid passphrase. Try "cipher-core-2024" or any 8+ character phrase.');
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cipher-space via-background to-muted/20 flex items-center justify-center p-4 matrix-bg">
      <Card className="glass-panel w-full max-w-md p-8 animate-vault-unlock">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <Shield className="w-10 h-10 text-primary animate-cipher-spin" />
          </div>
          <h1 className="text-3xl font-bold holo-text mb-2">CipherCore</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Secure Terminal Access
          </p>
        </div>

        {isDecrypting ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
              <Lock className="w-8 h-8 text-primary animate-cipher-spin" />
            </div>
            <h3 className="text-lg font-mono text-primary mb-2">Decrypting Workspace...</h3>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Initializing secure environment...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter master passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="terminal-input pr-12"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <Button 
                onClick={handleLogin} 
                className="cipher-button w-full"
                disabled={!passphrase.trim()}
              >
                <Lock className="w-4 h-4 mr-2" />
                Decrypt & Enter
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full border-primary/50 hover:bg-primary/10"
              onClick={handleLogin}
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              Biometric Scan
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground font-mono">
                Military-grade encryption • BlackBerry Dynamics
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}