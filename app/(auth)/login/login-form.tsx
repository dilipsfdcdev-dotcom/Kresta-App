"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const emailSchema = z.object({ email: z.string().email("Enter a valid email") });
const otpSchema = z.object({ token: z.string().min(6, "6-digit code").max(10) });

type Stage = "email" | "otp";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: "" },
  });

  async function sendOtp({ email: inputEmail }: z.infer<typeof emailSchema>) {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: inputEmail,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setEmail(inputEmail);
      setStage("otp");
      toast.success("Code sent. Check your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp({ token }: z.infer<typeof otpSchema>) {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (error) throw error;
      if (!data.session) throw new Error("Signed in, but no session was issued.");

      toast.success("Signed in");

      // Full reload (not router.push) so the freshly-set session cookies
      // definitely reach the middleware on the next request. router.push can
      // fire before the cookies are flushed, leaving the middleware still
      // seeing an unauthenticated request and redirecting back to /login.
      const target = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
      window.location.replace(target);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          {stage === "email" ? "We'll email you a one-time code." : `Enter the 6-digit code sent to ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === "email" ? (
          <form onSubmit={emailForm.handleSubmit(sendOtp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...emailForm.register("email")}
                disabled={loading}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-[var(--color-destructive)]">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send code
            </Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">One-time code</Label>
              <Input
                id="token"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={10}
                {...otpForm.register("token")}
                disabled={loading}
              />
              {otpForm.formState.errors.token && (
                <p className="text-sm text-[var(--color-destructive)]">{otpForm.formState.errors.token.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStage("email");
                  otpForm.reset();
                }}
                disabled={loading}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
