"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { ADMIN_NAV } from "@/components/dashboard/adminNav";
import { adminApi } from "@/services/dashboardApi";

export default function AdminMeetingsPage() {
  const { data: session } = useSession();
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    adminApi.meetings().then((d) => setMeetings(d.meetings || []));
  }, []);

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      title="Meetings"
      subtitle="All platform meetings"
      user={{ name: session?.user?.name, role: "Super Admin" }}
    >
      <DataTable
        columns={[
          {
            key: "room",
            label: "Room",
            render: (m) => (
              <Link href={`/join/${m.roomId}`} className="text-sky-400 hover:underline">
                {m.roomId?.slice(0, 8)}…
              </Link>
            ),
          },
          { key: "host", label: "Host", render: (m) => m.hostName },
          { key: "status", label: "Status" },
          { key: "participants", label: "Participants", render: (m) => m.participantCount },
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
