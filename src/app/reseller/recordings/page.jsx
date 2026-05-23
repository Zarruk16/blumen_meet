"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DataTable } from "@/components/dashboard/DataTable";
import { RESELLER_NAV } from "@/components/dashboard/resellerNav";
import { resellerApi } from "@/services/dashboardApi";

export default function ResellerRecordingsPage() {
  const { data: session } = useSession();
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    resellerApi.recordings().then((d) => setRecordings(d.recordings || []));
  }, []);

  return (
    <DashboardShell
      navItems={RESELLER_NAV}
      title="Recordings"
      subtitle="Your meeting recordings"
      user={{ name: session?.user?.name, role: "Reseller" }}
    >
      <DataTable
        columns={[
          { key: "room", label: "Room", render: (r) => r.roomName?.slice(0, 8) },
          { key: "status", label: "Status" },
          { key: "duration", label: "Duration", render: (r) => r.duration ?? "—" },
          {
            key: "download",
            label: "",
            render: (r) =>
              r.downloadUrl ? (
                <a href={r.downloadUrl} className="text-sky-400 text-xs hover:underline">
                  Download
                </a>
              ) : (
                "—"
              ),
          },
        ]}
        rows={recordings}
      />
      <div className="h-20 lg:hidden" />
    </DashboardShell>
  );
}
