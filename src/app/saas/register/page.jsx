"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";
import { LandingBackground } from "@/components/layout/LandingBackground";
import { resellerApi } from "@/services/dashboardApi";

export default function SaasRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await resellerApi.register(form);
      if (data.apiCredentials) {
        setCredentials(data.apiCredentials);
        localStorage.setItem("reseller_api_secret_once", data.apiCredentials.apiSecret);
      }
      toast.success("Account created — sign in to open your dashboard");
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.ok) router.push("/reseller/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] text-white">
      <LandingBackground />
      <div className="relative z-10 mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-2xl font-bold">Become a reseller</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Get API keys, 10,000 free minutes for 30 days, and a full reseller dashboard.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {["name", "company", "email"].map((field) => (
            <input
              key={field}
              type={field === "email" ? "email" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
              required={field !== "company"}
            />
          ))}
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            required
            minLength={8}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create reseller account"}
          </button>
        </form>
        {credentials && (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="font-medium text-amber-200">Save your API secret</p>
            <p className="mt-2 break-all font-mono text-xs">{credentials.apiSecret}</p>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/user-auth" className="text-sky-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
