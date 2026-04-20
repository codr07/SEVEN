import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12 animate-in slide-in-from-left-20 duration-1000">
          <div>
            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 text-animate-gradient">Connect</h1>
            <p className="text-xl md:text-2xl font-light tracking-widest uppercase opacity-70">
              With 5EVEN Institution
            </p>
          </div>

          <div className="space-y-8">
            <ContactItem icon={<Mail />} title="Email" value="institution5even@gmail.com" />
            <ContactItem icon={<Phone />} title="Phone" value="+91 80178 74821" />
            <ContactItem icon={<MapPin />} title="Campus" value="Masalandapur, North 24 Parganas, West Bengal" />
          </div>

          <div className="pt-12 flex gap-6">
            <SocialIcon icon={<Mail />} />
            <SocialIcon icon={<Phone />} />
            <SocialIcon icon={<MapPin />} />
          </div>
        </div>

        <div className="p-12 glass rounded-[60px] border border-white/20 animate-in slide-in-from-right-20 duration-1000 shadow-2xl">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-10">Send a Mission</h2>
          <form className="space-y-8">
            <InputField label="Full Name" type="text" placeholder="John Doe" />
            <InputField label="Email Address" type="email" placeholder="john@example.com" />
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3 opacity-60">Message</label>
              <textarea
                rows="4"
                className="w-full px-6 py-4 bg-muted/30 border border-border rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>
            <button
              className="w-full py-5 bg-primary text-primary-foreground rounded-3xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
            >
              <Send size={20} />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon, title, value }) => (
  <div className="flex items-center gap-6 group">
    <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm font-black uppercase tracking-widest opacity-50">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const InputField = ({ label, type, placeholder }) => (
  <div>
    <label className="block text-sm font-bold uppercase tracking-widest mb-3 opacity-60">{label}</label>
    <input
      type={type}
      className="w-full px-6 py-4 bg-muted/30 border border-border rounded-full outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      placeholder={placeholder}
    />
  </div>
);

const SocialIcon = ({ icon }) => (
  <button className="w-16 h-16 bg-muted/50 hover:bg-primary hover:text-primary-foreground rounded-3xl flex items-center justify-center transition-all hover:-translate-y-2 border border-border">
    {icon}
  </button>
);

export default Contact;
