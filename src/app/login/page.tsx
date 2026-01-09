"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BriefcaseBusiness, Loader2, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
        fetchOptions: {
            onSuccess: () => {
                toast.success("Welcome back to PI Ocean");
                router.push("/dashboard");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
                setIsLoading(false);
            }
        }
    });
  };

  return (
    <div className="w-full h-screen grid lg:grid-cols-2">
      
      {/* LEFT SIDE: BRANDING (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 z-0"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
              <BriefcaseBusiness className="w-6 h-6 text-blue-400" />
          </div>
          <span className="font-bold text-xl tracking-tight">PI Ocean ERP</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
              <blockquote className="space-y-4">
                <p className="text-lg font-medium leading-relaxed text-slate-200">
                  &ldquo;Streamlining the global garment trade through precision. Manage your orders from booking to shipment in one unified platform.&rdquo;
                </p>
                <footer className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">PI</div>
                  <div className="text-sm">
                      <p className="font-semibold text-white">Management Team</p>
                      <p className="text-xs text-slate-400">P.I. Ocean Trade Co.</p>
                  </div>
                </footer>
              </blockquote>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center text-xs text-slate-500">
          <p>© 2026 PI Ocean Trade Co.</p>
          <div className="flex gap-4">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 lg:bg-white relative">
        <div className="lg:hidden absolute top-0 left-0 w-full h-64 bg-slate-900 z-0"></div>
        <div className="lg:hidden absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-600/30 rounded-full blur-[80px] z-0"></div>

        <div className="w-full max-w-[400px] space-y-6 relative z-10">
          
          <div className="bg-white p-8 rounded-2xl shadow-xl lg:shadow-none lg:p-0">
              
              {/* Header */}
              <div className="text-center mb-8">
                
                {/* --- UPDATED MOBILE LOGO --- */}
                <div className="lg:hidden flex flex-col items-center justify-center mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl shadow-sm mb-3">
                        <BriefcaseBusiness className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">PI Ocean</span>
                </div>
                {/* --------------------------- */}

                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Enter credentials to access your workspace.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@piocean.com" 
                            className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700" onClick={() => toast.info("Contact Admin to reset.")}>
                            Forgot password?
                        </button>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all rounded-lg mt-2" type="submit" disabled={isLoading}>
                  {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                      <span className="flex items-center">Sign In <ArrowRight className="ml-2 w-4 h-4" /></span>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Secure Enterprise System</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}