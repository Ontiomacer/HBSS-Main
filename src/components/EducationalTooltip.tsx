import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Book, Code, Shield, Zap } from 'lucide-react';

interface EducationalTooltipProps {
  term: string;
  children: React.ReactNode;
  type?: 'crypto' | 'quantum' | 'network' | 'security';
}

export default function EducationalTooltip({ term, children, type = 'crypto' }: EducationalTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getTermInfo = (termName: string) => {
    const definitions: Record<string, {
      title: string;
      description: string;
      example?: string;
      icon: React.ReactNode;
    }> = {
      'AES-256': {
        title: 'Advanced Encryption Standard (256-bit)',
        description: 'A symmetric encryption algorithm that uses a 256-bit key. It\'s considered quantum-resistant up to a certain threshold and is widely used in government and military applications.',
        example: 'Used in: HTTPS, VPNs, file encryption',
        icon: <Shield className="w-4 h-4" />
      },
      'Quantum Key Distribution': {
        title: 'Quantum Key Distribution (QKD)',
        description: 'A secure communication method that uses quantum mechanics to detect eavesdropping. Any attempt to intercept the quantum channel changes the quantum state, alerting both parties.',
        example: 'BB84 Protocol: Uses photon polarization to create unbreakable keys',
        icon: <Zap className="w-4 h-4" />
      },
      'BlackBerry Dynamics': {
        title: 'BlackBerry Dynamics SDK',
        description: 'Enterprise mobility management solution that creates secure containers for apps and data. Provides encrypted communication channels and policy enforcement.',
        example: 'Features: App wrapping, secure tunneling, remote wipe capabilities',
        icon: <Shield className="w-4 h-4" />
      },
      'BB84 Protocol': {
        title: 'Bennett-Brassard 1984 Protocol',
        description: 'The first quantum cryptography protocol. Uses four quantum states (photon polarizations) to establish a shared secret key between two parties.',
        example: 'States: |0⟩, |1⟩, |+⟩, |-⟩ (rectilinear and diagonal bases)',
        icon: <Zap className="w-4 h-4" />
      },
      'RSA-2048': {
        title: 'RSA with 2048-bit key',
        description: 'Asymmetric cryptographic algorithm based on the difficulty of factoring large prime numbers. 2048-bit keys are currently considered secure but vulnerable to quantum attacks.',
        example: 'Quantum threat: Shor\'s algorithm could break RSA in polynomial time',
        icon: <Code className="w-4 h-4" />
      },
      'End-to-End Encryption': {
        title: 'End-to-End Encryption (E2EE)',
        description: 'Communication system where only the communicating users can read the messages. Messages are encrypted on the sender\'s device and only decrypted on the recipient\'s device.',
        example: 'Used in: Signal, WhatsApp, encrypted email',
        icon: <Shield className="w-4 h-4" />
      },
      'Forward Secrecy': {
        title: 'Perfect Forward Secrecy (PFS)',
        description: 'Property of secure communication protocols where compromise of long-term keys doesn\'t compromise past session keys. Each session uses unique keys.',
        example: 'Implementation: Ephemeral Diffie-Hellman key exchange',
        icon: <Shield className="w-4 h-4" />
      },
      'Photon Polarization': {
        title: 'Photon Polarization States',
        description: 'Quantum property of light particles used in quantum cryptography. Photons can be polarized in different directions, creating quantum bits (qubits).',
        example: 'Measurements: Horizontal/Vertical or Diagonal polarizations',
        icon: <Zap className="w-4 h-4" />
      },
      'Entropy': {
        title: 'Cryptographic Entropy',
        description: 'Measure of randomness in cryptographic systems. High entropy ensures unpredictable keys and strong security. Low entropy can lead to predictable patterns.',
        example: 'Sources: Mouse movements, keyboard timings, hardware noise',
        icon: <Code className="w-4 h-4" />
      },
      'Quantum Entanglement': {
        title: 'Quantum Entanglement',
        description: 'Quantum phenomenon where pairs of particles remain connected and instantly affect each other regardless of distance. Used in quantum communication protocols.',
        example: 'Application: Quantum internet, ultra-secure communications',
        icon: <Zap className="w-4 h-4" />
      }
    };

    return definitions[termName] || {
      title: termName,
      description: 'Technical term used in cryptography and secure communications.',
      example: undefined,
      icon: <HelpCircle className="w-4 h-4" />
    };
  };

  const termInfo = getTermInfo(term);

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <span 
          className="inline-flex items-center space-x-1 cursor-help border-b border-dotted border-primary/50 hover:border-primary transition-colors"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {children}
          <HelpCircle className="w-3 h-3 opacity-50" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="educational-tooltip max-w-sm">
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <div className="text-primary mt-0.5">
              {termInfo.icon}
            </div>
            <div>
              <h4 className="font-semibold text-primary text-sm">{termInfo.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {termInfo.description}
              </p>
            </div>
          </div>
          
          {termInfo.example && (
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-start space-x-2">
                <Book className="w-3 h-3 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-400 font-medium">Example:</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {termInfo.example}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground italic">
              💡 Click to learn more about {type} concepts
            </p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}