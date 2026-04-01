import React from 'react';
import { 
  Zap, 
  CheckCircle2, 
  CreditCard, 
  History, 
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const Subscription: React.FC = () => {
  const paymentHistory = [
    { id: 'INV-2026-001', date: '2026-03-01', amount: '₹1000', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'INV-2026-002', date: '2026-02-01', amount: '₹1000', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'INV-2026-003', date: '2026-01-01', amount: '₹1000', status: 'Paid', method: 'Visa •••• 4242' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              Enterprise Management
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
              Elevate Your Institution to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Gradox Pro</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed">
              Unlock the full potential of high-performance educational management with our most advanced tools.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                <ShieldCheck className="text-indigo-500" size={18} />
                99.9% Uptime Guarantee
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                <ShieldCheck className="text-indigo-500" size={18} />
                Bank-Grade Security
              </div>
            </div>
          </div>

          <div className="lg:w-[400px] shrink-0">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative group transition-all hover:border-indigo-500/50">
                <div className="absolute -top-4 -right-4 bg-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-indigo-600/30">Most Popular</div>
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-1">Gradox Pro</h3>
                    <p className="text-slate-400 text-sm font-medium">For scaling institutions</p>
                </div>
                <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black tracking-tighter text-white">₹1000</span>
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">/ Month</span>
                </div>
                <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mb-8">
                    Upgrade Now
                </button>
                <div className="space-y-4">
                    <FeatureItem text="Advanced AI Timetable Builder" />
                    <FeatureItem text="Conflict Resolution Engine" />
                    <FeatureItem text="Analytical Staff Reports" />
                    <FeatureItem text="Custom Branding (Your Logo)" />
                    <FeatureItem text="Priority 24/7 Support" />
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History and Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <History size={24} className="text-indigo-600" />
                    Billing History
                </h2>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Download All</button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                            <th className="py-5 px-8">Invoice ID</th>
                            <th className="py-5 px-8">Date</th>
                            <th className="py-5 px-8 font-center">Amount</th>
                            <th className="py-5 px-8">Status</th>
                            <th className="py-5 px-8 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paymentHistory.map((invoice) => (
                            <tr key={invoice.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-6 px-8 text-sm font-black text-slate-700 font-mono">{invoice.id}</td>
                                <td className="py-6 px-8 text-sm font-bold text-slate-500">{invoice.date}</td>
                                <td className="py-6 px-8 text-sm font-black text-indigo-600">{invoice.amount}</td>
                                <td className="py-6 px-8">
                                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">{invoice.status}</span>
                                </td>
                                <td className="py-6 px-8 text-right">
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-lg hover:shadow-indigo-100 flex items-center justify-center ml-auto">
                                        <ArrowUpRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3 px-2">
                <CreditCard size={24} className="text-indigo-600" />
                Active Plan
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Zap size={24} fill="white" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pricing Plan</p>
                        <h4 className="font-black text-slate-800 text-lg">Gradox Standard</h4>
                    </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                   <div className="flex justify-between text-xs font-bold text-slate-500">
                       <span>Cycle Progress</span>
                       <span>24 days left</span>
                   </div>
                   <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-600 rounded-full" style={{ width: '30%' }} />
                   </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                   <div className="flex justify-between items-center text-sm">
                       <span className="font-medium text-slate-500">Next billing date</span>
                       <span className="font-black text-slate-800 tracking-tight">Apr 24, 2026</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                       <span className="font-medium text-slate-500">Payment method</span>
                       <span className="font-black text-slate-800 tracking-tight italic">VISA •••• 4242</span>
                   </div>
                </div>
                
                <button className="w-full py-4 text-xs font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl hover:bg-rose-100 transition-colors">
                    Manage Subscription
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
    <CheckCircle2 size={18} className="text-indigo-400 shrink-0" />
    {text}
  </div>
);

export default Subscription;
