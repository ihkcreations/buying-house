"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BriefcaseBusiness, Loader2, Lock, Mail, ArrowRight } from "lucide-react";

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
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      
      {/* LEFT SIDE: BRANDING PANEL */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 text-white relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-900 opacity-80 z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>

        <div className="relative z-10 flex items-center gap-2 font-bold text-2xl">
          <BriefcaseBusiness className="w-8 h-8 text-blue-500" />
          <span>PI Ocean ERP</span>
        </div>

        <div className="relative z-10 max-w-md">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed text-slate-200">
              &ldquo;Streamlining the global garment trade through precision, transparency, and efficiency. Manage your orders from booking to shipment in one unified platform.&rdquo;
            </p>
            <footer className="text-sm text-slate-400 font-semibold pt-4">
              — P.I. Ocean Trade Management
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2026 PI Ocean Trade Co. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
             <div className="flex items-center gap-2 font-bold text-2xl text-slate-900">
                <BriefcaseBusiness className="w-8 h-8 text-blue-600" />
                <span>PI Ocean</span>
             </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Please enter your credentials to access the workspace.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="name@piocean.com" 
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-500" onClick={() => toast.info("Please contact the Administrator to reset your password.")}>
                        Forgot password?
                    </button>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
              </div>
            </div>

            <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all hover:shadow-lg" type="submit" disabled={isLoading}>
              {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <span className="flex items-center">Sign In <ArrowRight className="ml-2 w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Restricted System. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}