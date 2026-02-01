import { motion } from "framer-motion";
import { User, Code, Database, BookOpen, Users } from "lucide-react";

export default function About() {
  const team = [
    {
      name: "Ritam Roy",
      role: "Founder & Lead Faculty",
      bio: "Visionary educator blending traditional academics with modern tech.",
      color: "text-primary",
      borderColor: "border-primary"
    },
    {
      name: "Sankha Saha",
      role: "Co-Founder & Tech Lead",
      bio: "Architecting the future of digital learning platforms.",
      color: "text-secondary",
      borderColor: "border-secondary"
    },
    {
      name: "Tanushree Biswas",
      role: "Senior Faculty",
      bio: "Specializing in advanced mathematics and statistical analysis.",
      color: "text-accent",
      borderColor: "border-accent"
    },
    {
      name: "Aveek",
      role: "Instructor",
      bio: "Expert in competitive programming and algorithmic thinking.",
      color: "text-blue-400",
      borderColor: "border-blue-400"
    },
    {
      name: "Payel",
      role: "Instructor",
      bio: "Guiding students through the complexities of science.",
      color: "text-green-400",
      borderColor: "border-green-400"
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-background">
      {/* Header */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6 text-white"
          >
            ABOUT <span className="text-primary">5EVEN</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto font-light"
          >
            A place where you can learn in a completely different environment with advanced methodologies that secure your future.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur-xl" />
              {/* Unsplash image of futuristic classroom or collaboration */}
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" 
                alt="Team collaboration" 
                className="relative rounded-xl border border-white/10"
              />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold mb-6 text-white">Our Mission</h2>
              <div className="space-y-6 text-muted-foreground">
                <p>
                  At 5EVEN, we believe traditional education is no longer sufficient for the rapid pace of technological evolution. We bridge the gap between academic theory and industry reality.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <Code className="w-8 h-8 text-primary mb-2" />
                    <h4 className="font-bold text-white">Practical Coding</h4>
                    <p className="text-sm">Real-world projects, not just theory.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <Database className="w-8 h-8 text-secondary mb-2" />
                    <h4 className="font-bold text-white">Data Mastery</h4>
                    <p className="text-sm">Analytics and ML at the core.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <BookOpen className="w-8 h-8 text-accent mb-2" />
                    <h4 className="font-bold text-white">Academic Excellence</h4>
                    <p className="text-sm">Class 5-12 & Graduation support.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <Users className="w-8 h-8 text-blue-400 mb-2" />
                    <h4 className="font-bold text-white">Mentorship</h4>
                    <p className="text-sm">Personal guidance from experts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-center mb-16 text-white">Meet The Faculty</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group bg-card p-6 rounded-xl border border-white/10 hover:${member.borderColor} transition-all duration-300 relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                   <User className={`w-24 h-24 ${member.color}`} />
                </div>
                
                <h3 className={`text-2xl font-display font-bold mb-1 ${member.color}`}>{member.name}</h3>
                <p className="text-white font-mono text-sm mb-4 uppercase tracking-wider opacity-70">{member.role}</p>
                <p className="text-muted-foreground relative z-10">{member.bio}</p>
                
                <div className={`mt-6 h-1 w-12 bg-current opacity-50 rounded-full ${member.color}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
