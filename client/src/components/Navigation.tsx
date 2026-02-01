import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  if (user?.email) {
    navItems.push({ label: "Admin", href: "/admin" });
  }

  return (
    <nav className="fixed w-full z-50 top-0 left-0 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex-shrink-0 cursor-pointer">
            <span 
              className="text-3xl font-bold font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glitch-effect"
              data-text="5EVEN"
            >
              5EVEN
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`
                    font-display uppercase tracking-widest text-sm transition-colors duration-300
                    hover:text-primary hover:text-glow
                    ${location === item.href ? "text-primary text-glow" : "text-muted-foreground"}
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                  <User className="w-4 h-4 text-primary" />
                  <span>{user.firstName || user.email}</span>
                </div>
                <Button 
                  onClick={() => logout()}
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs border-primary/50 hover:bg-primary/10 hover:text-primary"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  LOGOUT
                </Button>
              </div>
            ) : (
              <a href="/api/login">
                <Button 
                  variant="outline"
                  className="font-display font-bold border-secondary/50 text-secondary hover:bg-secondary/10 hover:text-secondary-foreground uppercase tracking-widest"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </a>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  block px-3 py-2 text-base font-display uppercase tracking-wider
                  ${location === item.href ? "text-primary" : "text-muted-foreground hover:text-white"}
                `}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-base font-display uppercase tracking-wider text-destructive"
              >
                Logout
              </button>
            ) : (
              <a 
                href="/api/login"
                className="block px-3 py-2 text-base font-display uppercase tracking-wider text-secondary"
              >
                Login
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
