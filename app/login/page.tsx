
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const loginValue = usernameOrEmail.trim();

      if (loginValue.includes("@")) {
        // Preserve existing email-and-password login.
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: loginValue,
            password,
          });

        if (loginError) {
          setError("Invalid username/email or password.");
          return;
        }
      } else {
        // Resolve the username securely on the server.
        const response = await fetch("/api/auth/login-username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loginValue,
            password,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(
            result.error || "Invalid username or password."
          );
          return;
        }

        // Establish the returned Supabase session in this browser.
        const { error: sessionError } =
          await supabase.auth.setSession({
            access_token: result.access_token,
            refresh_token: result.refresh_token,
          });

        if (sessionError) {
          console.error("Session setup failed:", sessionError);
          setError("Unable to complete sign-in. Please try again.");
          return;
        }
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: theme.colors.background,
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "white",
          borderRadius: theme.radius.lg,
          padding: 36,
          boxShadow: theme.shadow.card,
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Bashan FireHub
        </h1>

        <p
          style={{
            textAlign: "center",
            color: theme.colors.textLight,
            marginBottom: 30,
          }}
        >
          Sign in to your account
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="usernameOrEmail">
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              autoComplete="username"
              placeholder="Enter your username or email"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 12,
                marginTop: 6,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 16,
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 12,
                marginTop: 6,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontSize: 16,
              }}
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                color: "red",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              height: 48,
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
