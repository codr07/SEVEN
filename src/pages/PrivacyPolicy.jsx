import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Data Collection Protocol",
      icon: <Eye className="text-primary" size={24} />,
      content: "We collect biometric-inspired data identifiers to secure your '5EVEN' profile. This includes your username, encrypted credentials, and academic records necessary for operational performance tracking."
    },
    {
      title: "2. Intelligence Security",
      icon: <Shield className="text-primary" size={24} />,
      content: "All operative data is encrypted using high-level security protocols. Our 'Intelligence Command' infrastructure ensures that your identity remains anonymous and protected from external scraping."
    },
    {
      title: "3. Data Usage",
      icon: <Lock className="text-primary" size={24} />,
      content: "Your data is used solely to enhance your learning experience, provide personalized services, and maintain the integrity of the 5EVEN Institution academic ecosystem."
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
              <FileText size={32} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Legal Archive</h4>
              <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase italic tracking-tighter">Privacy Policy</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            At 5EVEN Institution, we prioritize the security of our operatives. This policy outlines our commitment to data privacy and tactical security.
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
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
                  {section.icon}
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">{section.title}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-16">
                {section.content}
              </p>
            </motion.section>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Last Updated: May 11, 2026 • 5EVEN Intelligence
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Security Link Established</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
