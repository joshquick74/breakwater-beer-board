import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { setAuthToken } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Beer } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { mutateAsync: login } = useAdminLogin();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await login({ data });
      if (res.success && res.token) {
        setAuthToken(res.token);
        toast({ title: "Welcome back", variant: "default" });
        setLocation("/admin");
      }
    } catch (error) {
      toast({ 
        title: "Access Denied", 
        description: "Invalid password. Please try again.", 
        variant: "destructive" 
      });
      form.setValue("password", "");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[128px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 blur-[128px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <Beer className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Login</h1>
          <p className="text-muted-foreground mt-2">Enter your password to access the dashboard</p>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-card/80 border-border/50">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                className="h-12 text-lg px-4 bg-background/50"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
