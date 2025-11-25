import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Shield, 
  Lock, 
  Zap, 
  Eye,
  Activity,
  Cpu,
  HardDrive
} from 'lucide-react';

interface CryptoStrengthIndicatorProps {
  algorithm: string;
  keyLength: number;
  quantumResistant: boolean;
  isBlackBerry: boolean;
  className?: string;
}

export default function CryptoStrengthIndicator({ 
  algorithm, 
  keyLength, 
  quantumResistant, 
  isBlackBerry, 
  className 
}: CryptoStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0);
  const [entropy, setEntropy] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);

  useEffect(() => {
    // Calculate strength based on algorithm and key length
    let baseStrength = 0;
    
    switch (algorithm) {
      case 'AES-256':
        baseStrength = 85;
        break;
      case 'AES-128':
        baseStrength = 70;
        break;
      case 'RSA-2048':
        baseStrength = 75;
        break;
      case 'RSA-4096':
        baseStrength = 90;
        break;
      case 'ECC-P256':
        baseStrength = 80;
        break;
      case 'ChaCha20':
        baseStrength = 85;
        break;
      case 'CUSTOM':
        baseStrength = 60;
        break;
      default:
        baseStrength = 50;
    }

    // Adjust for key length
    const keyBonus = Math.min((keyLength / 256) * 10, 15);
    
    // Quantum resistance bonus
    const quantumBonus = quantumResistant ? 20 : 0;
    
    // BlackBerry Dynamics bonus
    const bbBonus = isBlackBerry ? 15 : 0;

    const finalStrength = Math.min(baseStrength + keyBonus + quantumBonus + bbBonus, 100);
    setStrength(finalStrength);

    // Simulate real-time metrics
    const metricsInterval = setInterval(() => {
      setEntropy(Math.random() * 100);
      setCpuUsage(Math.random() * 30 + 10); // 10-40% usage
    }, 2000);

    return () => clearInterval(metricsInterval);
  }, [algorithm, keyLength, quantumResistant, isBlackBerry]);

  const getStrengthColor = () => {
    if (strength >= 90) return 'text-neon-green border-neon-green';
    if (strength >= 75) return 'text-neon-blue border-neon-blue';
    if (strength >= 60) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  const getStrengthText = () => {
    if (strength >= 90) return 'MILITARY GRADE';
    if (strength >= 75) return 'HIGH SECURITY';
    if (strength >= 60) return 'STANDARD';
    return 'WEAK';
  };

  const renderStrengthBars = () => {
    const bars = [];
    const numBars = 10;
    const barsActive = Math.ceil((strength / 100) * numBars);

    for (let i = 0; i < numBars; i++) {
      const isActive = i < barsActive;
      const isQuantum = quantumResistant && i >= numBars - 2;
      
      bars.push(
        <div
          key={i}
          className={`strength-bar ${isActive ? (isQuantum ? 'quantum' : 'active') : ''}`}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      );
    }

    return bars;
  };

  return (
    <Card className={`glass-panel p-4 ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium holo-text">Crypto Strength</span>
          </div>
          <Badge variant="outline" className={getStrengthColor()}>
            {getStrengthText()}
          </Badge>
        </div>

        {/* Algorithm Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Algorithm:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono">{algorithm}</span>
            {quantumResistant && (
              <Badge variant="outline" className="text-neon-purple border-neon-purple text-xs">
                <Zap className="w-3 h-3 mr-1" />
                QUANTUM
              </Badge>
            )}
            {isBlackBerry && (
              <Badge variant="outline" className="text-neon-blue border-neon-blue text-xs">
                BB
              </Badge>
            )}
          </div>
        </div>

        {/* Key Length */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Key Length:</span>
          <span className="font-mono">{keyLength} bits</span>
        </div>

        {/* Strength Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Encryption Strength</span>
            <span className={`font-medium ${getStrengthColor().split(' ')[0]}`}>
              {strength.toFixed(0)}%
            </span>
          </div>
          <div className="crypto-strength-indicator">
            {renderStrengthBars()}
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Activity className="w-3 h-3" />
              <span>Entropy</span>
            </div>
            <div className="text-sm font-mono">{entropy.toFixed(1)}%</div>
            <div className="w-full bg-muted/30 rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-500"
                style={{ width: `${entropy}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Cpu className="w-3 h-3" />
              <span>CPU Usage</span>
            </div>
            <div className="text-sm font-mono">{cpuUsage.toFixed(1)}%</div>
            <div className="w-full bg-muted/30 rounded-full h-1">
              <div 
                className="bg-amber-400 h-1 rounded-full transition-all duration-500"
                style={{ width: `${cpuUsage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
          <Badge variant="outline" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            E2E Encrypted
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Forward Secrecy
          </Badge>
          {isBlackBerry && (
            <Badge variant="outline" className="text-neon-blue border-neon-blue text-xs">
              <HardDrive className="w-3 h-3 mr-1" />
              Containerized
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}