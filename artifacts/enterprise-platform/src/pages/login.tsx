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

      {/* Right panel - Image */}
      <div className="hidden lg:block flex-1 relative overflow-hidden bg-muted">
        <img 
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
          alt="Abstract background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-16 pb-24">
          <div className="max-w-xl">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4 leading-tight">Empower your workforce with unified operations.</h2>
            <p className="text-lg text-foreground/80 font-medium">Seamlessly connect learning, tasks, automations, and people in one premium platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
