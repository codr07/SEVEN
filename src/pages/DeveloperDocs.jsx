import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Terminal, 
  ShieldCheck, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Server, 
  Key, 
  Search,
  Lock
} from 'lucide-react';

const DeveloperDocs = () => {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const endpoints = [
    {
      id: 'authorize',
      title: 'Authorization Endpoint',
      url: 'https://grfvuhmptzqaxwlwbtsf.supabase.co/auth/v1/oauth/authorize',
      description: 'Used by third-party apps to start the OAuth 2.1 authorization flow.',
      icon: ExternalLink
    },
    {
      id: 'token',
      title: 'Token Endpoint',
      url: 'https://grfvuhmptzqaxwlwbtsf.supabase.co/auth/v1/oauth/token',
      description: 'Exchange authorization codes for access and refresh tokens.',
      icon: Key
    },
    {
      id: 'jwks',
      title: 'JWKS Endpoint',
      url: 'https://grfvuhmptzqaxwlwbtsf.supabase.co/auth/v1/.well-known/jwks.json',
      description: 'Public keys used to verify the signatures of IDs and Access tokens.',
      icon: Lock
    },
    {
      id: 'discovery',
      title: 'OIDC Discovery',
      url: 'https://grfvuhmptzqaxwlwbtsf.supabase.co/auth/v1/.well-known/openid-configuration',
      description: 'Manifest containing all metadata about the 5EVEN identity system.',
      icon: Search
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-28 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <header className="space-y-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest"
          >
            <Code2 size={14} /> Developer Portal
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter"
          >
            INTEGRATE WITH <span className="text-animate-gradient">5EVEN</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
          >
            Leverage our secure OAuth 2.1 and OpenID Connect (OIDC) infrastructure to build cross-platform integrations and custom student tools.
          </motion.p>
        </header>

        {/* Auth Section */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <ShieldCheck className="text-primary" /> Authentication Endpoints
              </h2>
              <p className="text-sm text-muted-foreground">Standardized OIDC and OAuth 2.1 protocol endpoints.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-card px-4 py-2 rounded-xl border border-border">
              <Server size={12} className="text-primary" /> Status: Operational
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {endpoints.map((ep, idx) => (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (idx * 0.05) }}
                className="group p-6 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all shadow-xl hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 text-primary">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ep.icon size={20} />
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-xs">{ep.title}</h3>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(ep.url, ep.id)}
                    className={`p-2 rounded-lg transition-all ${copiedId === ep.id ? 'bg-primary/20 text-primary' : 'bg-background hover:bg-accent text-muted-foreground'}`}
                  >
                    {copiedId === ep.id ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed h-[40px] line-clamp-2">
                    {ep.description}
                  </p>
                  <div className="relative">
                    <div className="p-4 rounded-xl bg-background border border-border font-mono text-[11px] text-foreground/80 break-all pr-12 group-hover:border-primary/20 transition-colors">
                      {ep.url}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Example */}
        <section className="space-y-8 pt-8">
          <div className="p-8 md:p-12 rounded-[40px] bg-gradient-to-br from-card to-background border border-border relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Terminal size={120} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-black uppercase tracking-tight">Ready to build?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our system supports standard OAuth 2.1 libraries. Whether you are building in React, Python, or Go, integrating 5EVEN identity is as simple as plugging in our Well-Known configuration.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 rounded-xl bg-background border border-border flex items-center gap-2">
                    <Globe size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Base: Netlify</span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-background border border-border flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Type: OAuth 2.1</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-background/80 backdrop-blur-xl p-6 rounded-3xl border border-border shadow-inner font-mono text-xs text-primary/80 overflow-x-auto">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
                  <span className="ml-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">Example Configuration</span>
                </div>
                <pre>{`{
  "issuer": "5EVEN Institution",
  "client_auth": "PKCE",
  "scopes": [
    "openid",
    "profile",
    "email"
  ],
  "discovery_url": "/.well-known/openid",
  "status": "Ready To Code"
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Footer */}
        <footer className="text-center space-y-4 pt-10">
          <p className="text-muted-foreground text-sm font-bold">Need help with integration?</p>
          <a href="mailto:espozindia@gmail.com" className="inline-flex items-center gap-2 text-primary hover:underline font-black uppercase tracking-widest text-xs">
            <Mail size={16} /> Contact Developer Support
          </a>
        </footer>
      </div>
    </div>
  );
};

export default DeveloperDocs;
