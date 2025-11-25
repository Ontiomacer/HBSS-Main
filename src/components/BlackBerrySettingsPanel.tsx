import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Shield, 
  Lock, 
  Clock, 
  Globe, 
  Users, 
  FileX, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  Settings2,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface BlackBerrySettingsPanelProps {
  onBack: () => void;
}

export default function BlackBerrySettingsPanel({ onBack }: BlackBerrySettingsPanelProps) {
  const [settings, setSettings] = useState({
    // Data Leakage Prevention
    copyPasteRestriction: true,
    screenshotBlocking: true,
    watermarking: false,
    
    // File Security
    secureWipeTimer: 24, // hours
    allowedFileTypes: ['pdf', 'docx', 'xlsx', 'jpg', 'png'],
    maxFileSize: 50, // MB
    
    // Network Security
    vpnPassthrough: false,
    allowedDomains: ['cyberdyne.corp', 'defense.mil', 'justice.gov'],
    blockedDomains: ['consumer-email.com', 'social-media.com'],
    
    // Authentication
    biometricRequired: true,
    pinComplexity: 'high',
    sessionTimeout: 30, // minutes
    
    // Encryption
    encryptionLevel: 'AES-256-GCM',
    keyRotationInterval: 24, // hours
    quantumSafeEnabled: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addDomain = (type: 'allowed' | 'blocked', domain: string) => {
    if (!domain.trim()) return;
    
    const listKey = type === 'allowed' ? 'allowedDomains' : 'blockedDomains';
    updateSetting(listKey, [...settings[listKey], domain.trim()]);
  };

  const removeDomain = (type: 'allowed' | 'blocked', domain: string) => {
    const listKey = type === 'allowed' ? 'allowedDomains' : 'blockedDomains';
    updateSetting(listKey, settings[listKey].filter(d => d !== domain));
  };

  return (
    <div className="min-h-screen bg-background p-4 matrix-bg">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold holo-text flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-400" />
                BlackBerry Dynamics Settings
              </h1>
              <p className="text-muted-foreground font-mono text-sm">Enterprise Security Configuration</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" className="border-blue-500 text-blue-400">
              <Download className="w-4 h-4 mr-2" />
              Export Config
            </Button>
            <Button className="cipher-button">
              <Upload className="w-4 h-4 mr-2" />
              Apply Changes
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/50">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
          </TabsList>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-400" />
                Data Leakage Prevention
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Copy/Paste Restriction</h4>
                    <p className="text-sm text-muted-foreground">Prevent copying sensitive data outside the app</p>
                  </div>
                  <Switch
                    checked={settings.copyPasteRestriction}
                    onCheckedChange={(checked) => updateSetting('copyPasteRestriction', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Screenshot Blocking</h4>
                    <p className="text-sm text-muted-foreground">Block screenshots and screen recording</p>
                  </div>
                  <Switch
                    checked={settings.screenshotBlocking}
                    onCheckedChange={(checked) => updateSetting('screenshotBlocking', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dynamic Watermarking</h4>
                    <p className="text-sm text-muted-foreground">Add user identification to displayed content</p>
                  </div>
                  <Switch
                    checked={settings.watermarking}
                    onCheckedChange={(checked) => updateSetting('watermarking', checked)}
                  />
                </div>
              </div>
            </Card>
            
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                Security Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-400">Policies Active</p>
                  <p className="text-xs text-muted-foreground">All security policies enforced</p>
                </div>
                
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-400">Compliance Score</p>
                  <p className="text-lg font-bold">98.7%</p>
                </div>
                
                <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-amber-400">Last Audit</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* File Settings */}
          <TabsContent value="files" className="space-y-6">
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileX className="w-5 h-5 mr-2 text-red-400" />
                Secure File Management
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Secure Wipe Timer (hours)</label>
                  <Input
                    type="number"
                    value={settings.secureWipeTimer}
                    onChange={(e) => updateSetting('secureWipeTimer', parseInt(e.target.value))}
                    className="terminal-input w-32"
                    min="1"
                    max="168"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Files will be securely deleted after this period
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Maximum File Size (MB)</label>
                  <Input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => updateSetting('maxFileSize', parseInt(e.target.value))}
                    className="terminal-input w-32"
                    min="1"
                    max="500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Allowed File Types</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.allowedFileTypes.map((type) => (
                      <Badge
                        key={type}
                        variant="outline"
                        className="border-green-500 text-green-400"
                      >
                        .{type}
                        <button
                          onClick={() => updateSetting('allowedFileTypes', 
                            settings.allowedFileTypes.filter(t => t !== type)
                          )}
                          className="ml-1 hover:text-red-400"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Network Settings */}
          <TabsContent value="network" className="space-y-6">
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-green-400" />
                Network Access Control
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">VPN Passthrough</h4>
                    <p className="text-sm text-muted-foreground">Allow traffic through enterprise VPN</p>
                  </div>
                  <Switch
                    checked={settings.vpnPassthrough}
                    onCheckedChange={(checked) => updateSetting('vpnPassthrough', checked)}
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Allowed Domains</h4>
                  <div className="space-y-2">
                    {settings.allowedDomains.map((domain) => (
                      <div key={domain} className="flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/20">
                        <span className="text-sm font-mono text-green-400">{domain}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDomain('allowed', domain)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Blocked Domains</h4>
                  <div className="space-y-2">
                    {settings.blockedDomains.map((domain) => (
                      <div key={domain} className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/20">
                        <span className="text-sm font-mono text-red-400">{domain}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDomain('blocked', domain)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Authentication Settings */}
          <TabsContent value="auth" className="space-y-6">
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Authentication & Access
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Biometric Authentication Required</h4>
                    <p className="text-sm text-muted-foreground">Enforce fingerprint/face recognition</p>
                  </div>
                  <Switch
                    checked={settings.biometricRequired}
                    onCheckedChange={(checked) => updateSetting('biometricRequired', checked)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    className="terminal-input w-32"
                    min="5"
                    max="480"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">PIN Complexity</label>
                  <select
                    value={settings.pinComplexity}
                    onChange={(e) => updateSetting('pinComplexity', e.target.value)}
                    className="terminal-input w-48"
                  >
                    <option value="low">Low (4 digits)</option>
                    <option value="medium">Medium (6 alphanumeric)</option>
                    <option value="high">High (8+ mixed characters)</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Encryption Settings */}
          <TabsContent value="encryption" className="space-y-6">
            <Card className="glass-panel p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-cyan-400" />
                Encryption Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Encryption Algorithm</label>
                  <select
                    value={settings.encryptionLevel}
                    onChange={(e) => updateSetting('encryptionLevel', e.target.value)}
                    className="terminal-input w-64"
                  >
                    <option value="AES-256-GCM">AES-256-GCM (Military Grade)</option>
                    <option value="ChaCha20-Poly1305">ChaCha20-Poly1305 (High Performance)</option>
                    <option value="CRYSTALS-Kyber">CRYSTALS-Kyber (Quantum Safe)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Key Rotation Interval (hours)</label>
                  <Input
                    type="number"
                    value={settings.keyRotationInterval}
                    onChange={(e) => updateSetting('keyRotationInterval', parseInt(e.target.value))}
                    className="terminal-input w-32"
                    min="1"
                    max="168"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Quantum-Safe Cryptography</h4>
                    <p className="text-sm text-muted-foreground">Enable post-quantum encryption algorithms</p>
                  </div>
                  <Switch
                    checked={settings.quantumSafeEnabled}
                    onCheckedChange={(checked) => updateSetting('quantumSafeEnabled', checked)}
                  />
                </div>
                
                <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-medium text-cyan-400">Current Encryption Status</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Algorithm:</span>
                      <span className="ml-2 font-mono">{settings.encryptionLevel}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Key Strength:</span>
                      <span className="ml-2 font-mono text-green-400">256-bit</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Rotation:</span>
                      <span className="ml-2 font-mono">2 hours ago</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantum Safe:</span>
                      <span className={`ml-2 font-mono ${settings.quantumSafeEnabled ? 'text-green-400' : 'text-amber-400'}`}>
                        {settings.quantumSafeEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}