import React from 'react';
import { motion } from 'framer-motion';
import { Gavel, Scale, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  const rules = [
    {
      title: "1. Operational Conduct",
      icon: <Scale className="text-primary" size={24} />,
      content: "Users must adhere to the highest standards of academic integrity. Any attempt to exploit system vulnerabilities or misrepresent identification records will result in immediate session termination."
    },
    {
      title: "2. Intellectual Assets",
      icon: <Gavel className="text-primary" size={24} />,
      content: "All courses, notes, and academic materials within the 5EVEN ecosystem are protected intellectual assets. Unauthorized reproduction or distribution is strictly prohibited."
    },
    {
      title: "3. Service Eligibility",
      icon: <CheckCircle2 className="text-primary" size={24} />,
      content: "Access to 'Student Zone' and 'Intelligence Command' features is granted upon successful verification. 5EVEN Institution reserves the right to revoke access at its sole discretion."
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-12 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">Return to Dashboard</span>
        </button>

        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
              <Gavel size={32} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Operational Protocol</h4>
              <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase italic tracking-tighter">Terms of Service</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            By accessing the 5EVEN Institution network, you agree to comply with our tactical operational protocols and intellectual property guidelines.
          </p>
        </div>

        <div className="space-y-12">
          {rules.map((rule, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:text-black transition-all">
                  {rule.icon}
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{rule.title}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-16">
                {rule.content}
              </p>
            </motion.section>
          ))}
        </div>

        <div className="mt-12 p-8 rounded-3xl bg-destructive/5 border border-destructive/20 flex items-start gap-4">
          <AlertTriangle className="text-destructive shrink-0" size={24} />
          <p className="text-sm text-destructive/80 leading-relaxed font-medium">
            <strong className="uppercase">Warning:</strong> Violation of these terms may result in permanent exclusion from the 5EVEN Institutional database and legal action where applicable.
          </p>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Protocol Version: 7.03.26 • 5EVEN Intelligence
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary">
            <span>Terms Approved</span>
            <CheckCircle2 size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
