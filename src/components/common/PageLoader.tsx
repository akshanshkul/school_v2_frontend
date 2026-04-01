import React from 'react'

const PageLoader: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative group">
        {/* Outer Pulsing Ring */}
        <div className="absolute inset-0 rounded-3xl bg-indigo-600/20 animate-ping duration-[2000ms]" />
        
        {/* Main Icon Container */}
        <div className="relative h-24 w-24 rounded-3xl bg-white shadow-2xl border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden">
          {/* Moving Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-slate-50 animate-pulse" />
          
          {/* Logo Placeholder / Symbol */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-2 w-12 rounded-full bg-indigo-600 animate-bounce shadow-sm shadow-indigo-200" />
            <div className="h-2 w-8 rounded-full bg-slate-300 mt-2 animate-bounce [animation-delay:200ms]" />
            <div className="h-2 w-10 rounded-full bg-slate-200 mt-2 animate-bounce [animation-delay:400ms]" />
          </div>
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-8 text-center space-y-2">
        <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Processing Request</h3>
        <div className="flex items-center justify-center gap-1">
          <div className="h-1 w-1 rounded-full bg-indigo-600 animate-bounce" />
          <div className="h-1 w-1 rounded-full bg-indigo-600 animate-bounce [animation-delay:200ms]" />
          <div className="h-1 w-1 rounded-full bg-indigo-600 animate-bounce [animation-delay:400ms]" />
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-4">Syncing Institutional Directory</p>
      </div>
    </div>
  )
}

export default PageLoader
