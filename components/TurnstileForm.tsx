"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    turnstile: any;
    onTurnstileSuccess: (token: string) => void;
    onTurnstileExpired: () => void;
  }
}

export default function TurnstileForm() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // ✅ register global callbacks
  useEffect(() => {
    window.onTurnstileSuccess = (t: string) => {
      console.log(t, "data callback");
      setToken(t);
    };

    window.onTurnstileExpired = () => {
      setToken(null);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setResult("Turnstile not verified");
      return;
    }

    setLoading(true);
    setResult("");

    const res = await fetch("/api/verify-turnstile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    setLoading(false);

    setResult(data.success ? "✅ Verified" : "❌ Failed");

    window.turnstile?.reset();
    setToken(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="cf-turnstile"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        data-callback="onTurnstileSuccess"
        data-expired-callback="onTurnstileExpired"
      />

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Verifying..." : "Submit"}
      </button>

      {result && <p>{result}</p>}
    </form>
  );
}
