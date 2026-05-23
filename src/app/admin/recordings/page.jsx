"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { ADMIN_NAV } from "@/components/dashboard/adminNav";
import { adminApi } from "@/services/dashboardApi";

export default function AdminRecordingsPage() {
  const { data: session } = useSession();
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    adminApi.recordings().then((d) => setRecordings(d.recordings || []));
  }, []);

  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      title="Recordings"
      subtitle="Platform-wide recordings"
      user={{ name: session?.user?.name, role: "Super Admin" }}
    >
      <DataTable
        columns={[
          { key: "id", label: "ID", render: (r) => r.recordingId?.slice(0, 8) },
          { key: "room", label: "Room", render: (r) => r.roomName?.slice(0, 8) },
          { key: "host", label: "Host", render: (r) => r.hostName },
          { key: "status", label: "Status" },
          { key: "duration", label: "Duration", render: (r) => r.duration ?? "—" },
        ]}
        rows={recordings}
      />
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
