"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { RESELLER_NAV } from "@/components/dashboard/resellerNav";
import { resellerApi } from "@/services/dashboardApi";

export default function ResellerCustomersPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", company: "" });

  const load = () => resellerApi.customers().then((d) => setCustomers(d.customers || []));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await resellerApi.createCustomer(form);
      toast.success("Customer created");
      setForm({ name: "", email: "", company: "" });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardShell
      navItems={RESELLER_NAV}
      title="Customers"
      subtitle="Manage your end customers"
      user={{ name: session?.user?.name, role: "Reseller" }}
    >
      <form
        onSubmit={handleCreate}
        className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-4"
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          required
        />
        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
        >
          Add customer
        </button>
      </form>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "company", label: "Company" },
          { key: "meetings", label: "Meetings", render: (c) => c.meetingsCount },
        ]}
        rows={customers}
      />
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
