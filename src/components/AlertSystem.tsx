import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  Zap, 
  Eye, 
  X, 
  Bell,
  Activity,
  Lock
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'threat' | 'secure' | 'quantum' | 'blackberry' | 'info';
  title: string;
  message: string;
  timestamp: number;
  critical: boolean;
}

interface AlertSystemProps {
  className?: string;
}

export default function AlertSystem({ className }: AlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate real-time alerts
    const alertInterval = setInterval(() => {
      const alertTypes = [
        {
          type: 'threat' as const,
          titles: ['Intrusion Detected', 'Suspicious Activity', 'Eavesdropper Alert'],
          messages: [
            'Unauthorized access attempt on quantum channel #7',
            'Packet interception detected on Router-Alpha',
            'Potential man-in-the-middle attack detected'
          ]
        },
        {
          type: 'secure' as const,
          titles: ['Channel Secured', 'Encryption Success', 'Key Exchange Complete'],
          messages: [
            'AES-256 encryption established successfully',
            'Quantum key distribution completed',
            'BlackBerry Dynamics tunnel activated'
          ]
        },
        {
          type: 'quantum' as const,
          titles: ['Quantum State Change', 'Entanglement Success', 'Photon Analysis'],
          messages: [
            'Quantum bits generated successfully',
            'Photon polarization verified',
            'BB84 protocol execution complete'
          ]
        }
      ];

      if (Math.random() > 0.7) { // 30% chance every interval
        const category = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const titleIndex = Math.floor(Math.random() * category.titles.length);
        const messageIndex = Math.floor(Math.random() * category.messages.length);

        const newAlert: Alert = {
          id: Date.now().toString(),
          type: category.type,
          title: category.titles[titleIndex],
          message: category.messages[messageIndex],
          timestamp: Date.now(),
          critical: category.type === 'threat' && Math.random() > 0.5
        };

        setAlerts(prev => [newAlert, ...prev].slice(0, 5)); // Keep only 5 latest alerts
      }
    }, 8000);

    return () => clearInterval(alertInterval);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="w-4 h-4" />;
      case 'secure': return <Shield className="w-4 h-4" />;
      case 'quantum': return <Zap className="w-4 h-4" />;
      case 'blackberry': return <Lock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertClass = (type: Alert['type']) => {
    switch (type) {
      case 'threat': return 'threat-alert';
      case 'secure': return 'secure-alert';
      case 'quantum': return 'quantum-alert';
      case 'blackberry': return 'bb-secure-channel';
      default: return 'glass-panel';
    }
  };

  const getAlertColors = (type: Alert['type']) => {
    switch (type) {
      case 'threat': return 'text-neon-red border-neon-red';
      case 'secure': return 'text-neon-green border-neon-green';
      case 'quantum': return 'text-neon-purple border-neon-purple';
      case 'blackberry': return 'text-neon-blue border-neon-blue';
      default: return 'text-primary border-primary';
    }
  };

  if (!isVisible || alerts.length === 0) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="glass-panel border-primary/50 hover:border-primary"
        >
          <Bell className="w-4 h-4 mr-2" />
          Alerts ({alerts.length})
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-50 w-96 space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium holo-text">Live Alerts</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={`${getAlertClass(alert.type)} p-4 animate-scale-in`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getAlertColors(alert.type)}>
                {getAlertIcon(alert.type)}
                <span className="ml-1 uppercase text-xs">{alert.type}</span>
              </Badge>
              {alert.critical && (
                <Badge variant="destructive" className="text-xs animate-threat-pulse">
                  CRITICAL
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAlert(alert.id)}
              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
          <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>Live</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}