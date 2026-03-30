import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLogin } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hexagon, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useAuth(false); // will redirect if already logged in

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data: any) => {
        if (data?.token) {
          localStorage.setItem('auth_token', data.token);
          setAuthTokenGetter(() => localStorage.getItem('auth_token'));
        }
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        setErrorMsg("Invalid email or password");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    loginMutation.mutate({ data: { email, password } });
  };

  const handleDemoFill = (role: 'admin' | 'manager' | 'employee') => {
    setEmail(`${role}@demo.com`);
    setPassword(`${role}123`);
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left panel - Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 sm:px-16 border-r border-border/50 bg-card relative z-10 shadow-2xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="flex items-center gap-2 mb-12 text-primary font-display font-bold text-2xl">
            <Hexagon className="h-8 w-8 fill-primary/10" strokeWidth={2} />
            Nexus
          </div>

          <h1 className="text-3xl font-bold font-display tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Enter your credentials to access the enterprise platform.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 px-4 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all"
              />
            </div>

            {errorMsg && (
              <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {errorMsg}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
              {!loginMutation.isPending && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          <div className="mt-12">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">Demo Accounts</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button variant="outline" size="sm" onClick={() => handleDemoFill('admin')} className="text-xs h-9 rounded-lg">Admin</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoFill('manager')} className="text-xs h-9 rounded-lg">Manager</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoFill('employee')} className="text-xs h-9 rounded-lg">Employee</Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel - Animated */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0a0f1a] flex-col items-center justify-center">

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Radial glow center */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 480,
            height: 480,
            background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.04) 60%, transparent 100%)',
            top: '50%', left: '50%',
            x: '-50%', y: '-50%',
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbit ring 1 */}
        <motion.div
          className="absolute border border-white/[0.07] rounded-full"
          style={{ width: 340, height: 340, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {/* Orbiting dot */}
          <motion.div
            className="absolute w-2.5 h-2.5 rounded-full bg-blue-400/80 shadow-[0_0_10px_2px_rgba(96,165,250,0.6)]"
            style={{ top: -5, left: '50%', x: '-50%' }}
          />
        </motion.div>

        {/* Orbit ring 2 */}
        <motion.div
          className="absolute border border-white/[0.05] rounded-full"
          style={{ width: 500, height: 500, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-sky-300/70 shadow-[0_0_8px_2px_rgba(125,211,252,0.5)]"
            style={{ top: -4, left: '50%', x: '-50%' }}
          />
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-blue-500/60"
            style={{ bottom: -3, left: '50%', x: '-50%' }}
          />
        </motion.div>

        {/* Orbit ring 3 */}
        <motion.div
          className="absolute border border-white/[0.04] rounded-full"
          style={{ width: 650, height: 650, top: '50%', left: '50%', x: '-50%', y: '-50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/60"
            style={{ top: -3, left: '50%', x: '-50%' }}
          />
        </motion.div>

        {/* Center logo */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Hexagon logo */}
          <motion.div
            className="w-24 h-24 flex items-center justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <polygon
                points="48,4 88,26 88,70 48,92 8,70 8,26"
                stroke="url(#hexGrad)"
                strokeWidth="2"
                fill="rgba(59,130,246,0.12)"
                filter="url(#glow)"
              />
              <polygon
                points="48,16 78,32 78,64 48,80 18,64 18,32"
                stroke="rgba(96,165,250,0.3)"
                strokeWidth="1"
                fill="none"
              />
              <text x="48" y="57" textAnchor="middle" fontSize="22" fontWeight="700" fill="url(#hexGrad)" fontFamily="Inter, sans-serif">N</text>
            </svg>
          </motion.div>

          {/* Brand name */}
          <motion.p
            className="text-2xl font-bold tracking-widest text-white/90 uppercase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Nexus
          </motion.p>
          <motion.p
            className="text-xs tracking-[0.3em] text-white/30 uppercase mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Enterprise Platform
          </motion.p>
        </motion.div>

        {/* Floating feature tags */}
        {[
          { label: 'Learning', icon: '📚', x: -200, y: -90, delay: 0.5 },
          { label: 'Tasks', icon: '✅', x: 180, y: -60, delay: 0.8 },
          { label: 'Automations', icon: '⚡', x: -160, y: 110, delay: 1.1 },
          { label: 'Analytics', icon: '📊', x: 170, y: 100, delay: 1.4 },
        ].map(({ label, icon, x, y, delay }) => (
          <motion.div
            key={label}
            className="absolute z-10 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-white/60 text-xs font-medium"
            style={{ top: '50%', left: '50%', x: x - 48, y: y - 12 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [y - 12, y - 18, y - 12] }}
            transition={{
              opacity: { delay, duration: 0.6 },
              scale: { delay, duration: 0.6 },
              y: { delay: delay + 0.6, duration: 3.5 + delay * 0.3, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </motion.div>
        ))}

        {/* Bottom text */}
        <motion.div
          className="absolute bottom-12 left-0 right-0 text-center z-10 px-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <p className="text-white/40 text-sm leading-relaxed">
            Empower your workforce with unified operations.<br />
            <span className="text-white/25 text-xs">Learning · Tasks · Files · Automations</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
