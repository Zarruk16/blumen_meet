"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-toastify";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { RESELLER_NAV } from "@/components/dashboard/resellerNav";
import { resellerApi } from "@/services/dashboardApi";

export default function ResellerMeetingsPage() {
  const { data: session } = useSession();
  const [meetings, setMeetings] = useState([]);

  const load = () => resellerApi.meetings().then((d) => setMeetings(d.meetings || []));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/reseller/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: session?.user?.company || session?.user?.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.meeting?.hostKey) {
        localStorage.setItem(`hostKey:${data.meeting.roomId}`, data.meeting.hostKey);
      }
      toast.success("Meeting created");
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <DashboardShell
      navItems={RESELLER_NAV}
      title="Meetings"
      subtitle="Create and manage meetings for your customers"
      user={{ name: session?.user?.name, role: "Reseller" }}
    >
      <button
        type="button"
        onClick={handleCreate}
        className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white"
      >
        + New meeting
      </button>
      <DataTable
        columns={[
          {
            key: "room",
            label: "Room",
            render: (m) => (
              <Link href={m.joinUrl} className="text-sky-400 hover:underline">
                {m.roomId?.slice(0, 8)}…
              </Link>
            ),
          },
          { key: "status", label: "Status" },
          { key: "duration", label: "Duration", render: (m) => m.duration || "—" },
          {
            key: "created",
            label: "Created",
            render: (m) => new Date(m.createdAt).toLocaleString(),
          },
        ]}
        rows={meetings}
      />
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
