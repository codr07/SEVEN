import React, { forwardRef } from 'react';

const CertificateGenerator = forwardRef(({ studentName, courseName, date, isDemo }, ref) => {
  // Generate a mock ID for realism
  const certId = React.useMemo(() => Math.random().toString(36).substring(2, 10).toUpperCase(), []);
  const formattedDate = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div 
      ref={ref}
      style={{
        width: '1123px',
        height: '794px',
        backgroundColor: 'hsl(220, 30%, 4%)',
        backgroundImage: 'linear-gradient(135deg, hsl(220, 30%, 2%) 0%, hsl(220, 30%, 6%) 100%)',
        color: '#ffffff',
        padding: '40px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
      className={`flex items-center justify-center font-sans select-none ${isDemo ? 'grayscale-[50%] opacity-90' : ''}`}
    >
       {/* Background decorations */}
       <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
       <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

       {/* DEMO Watermark */}
       {isDemo && (
         <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none overflow-hidden opacity-[0.03] mix-blend-overlay">
           <div className="text-[15rem] font-black uppercase rotate-[-30deg] tracking-tighter text-white">DEMO ONLY</div>
           <div className="text-[5rem] font-black uppercase rotate-[-30deg] tracking-widest text-white mt-10">NOT FOR OFFICIAL USE</div>
         </div>
       )}

       {/* Main Glass Panel */}
       <div className="w-full h-full border border-white/10 rounded-[2.5rem] bg-black/60 relative z-10 flex flex-col items-center justify-center text-center p-16 shadow-2xl">
          
          {/* Logo */}
          <div className="absolute top-12 left-12 flex items-center gap-2">
            <span className="text-3xl font-black italic tracking-tighter"><span className="text-primary">5</span>EVEN</span>
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2 border-l border-white/20 pl-2">Institution</span>
          </div>

          <div className="absolute top-12 right-12 text-xs font-black uppercase tracking-widest text-muted-foreground">
             CERT ID: {isDemo ? 'DEMO-' + certId : certId}
          </div>

          <h1 className={`text-[3.5rem] font-black uppercase tracking-tight ${isDemo ? 'text-muted-foreground' : 'text-white'} mb-2 leading-none`}>
            {isDemo ? 'Demo Certificate' : 'Certificate of Completion'}
          </h1>
          <div className={`w-24 h-1.5 ${isDemo ? 'bg-muted-foreground shadow-none' : 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]'} mb-12 rounded-full`}></div>

          <p className="text-lg font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4">This is to certify that</p>
          
          <h2 className="text-6xl font-black italic tracking-tighter text-white mb-8 pb-2">
            {studentName}
          </h2>

          <p className="text-lg font-bold uppercase tracking-[0.3em] text-muted-foreground mb-4">has successfully completed</p>
          
          <h3 className="text-3xl font-black text-primary mb-16 tracking-tight">{courseName}</h3>

          {/* Footer Area */}
          <div className="w-full flex justify-between items-end mt-auto pt-8 border-t border-white/10">
             <div className="text-left w-1/3">
                <p className="text-lg font-black uppercase tracking-widest text-white mb-1">{formattedDate}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Date of Completion</p>
             </div>
             
             <div className="text-center flex flex-col items-center w-1/3">
                <div className="h-16 flex items-center justify-center mb-1">
                   <img src="/assets/images/sign/sign2.png" alt="Co-Founder Signature" className="h-14 object-contain brightness-0 invert opacity-90" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-white mb-1">Co-Founder, 5EVEN</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Authorized Signature</p>
             </div>

             <div className="text-right flex flex-col items-end w-1/3">
                <div className="h-16 flex items-center justify-end mb-1 pr-4">
                   <img src="/assets/images/sign/sign1.png" alt="Founder Signature" className="h-14 object-contain brightness-0 invert opacity-90" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-white mb-1 mr-4">Founder, 5EVEN</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mr-4">Authorized Signature</p>
             </div>
          </div>
       </div>
    </div>
  );
});

export default CertificateGenerator;
