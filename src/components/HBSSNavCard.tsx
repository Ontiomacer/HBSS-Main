import { Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HBSSNavCard() {
  return (
    <Link 
      to="/hbss"
      className="block p-6 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl hover:border-emerald-500/50 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">HBSS Platform</h3>
            <p className="text-sm text-slate-400">Post-Quantum Signatures</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Quantum-Resistant</span>
        <span className="px-2 py-1 bg-teal-500/10 text-teal-400 text-xs rounded">Hash-Based</span>
        <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded">Stateless</span>
      </div>
    </Link>
  );
}
