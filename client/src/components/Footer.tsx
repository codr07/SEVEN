import { Link } from "wouter";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/5 backdrop-blur-lg pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-display font-bold text-white mb-4">5EVEN</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              We build, not train. Redefining education with futuristic methodologies and advanced learning paths for the next generation of creators.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-2" />
                info@5even.edu
              </li>
              <li className="text-muted-foreground">
                Kolkata, West Bengal
                <br />India
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} 5EVEN Institution. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
