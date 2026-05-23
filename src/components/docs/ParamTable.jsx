export function ParamTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            <th className="px-4 py-3 font-semibold text-zinc-300">Name</th>
            <th className="px-4 py-3 font-semibold text-zinc-300">Type</th>
            <th className="px-4 py-3 font-semibold text-zinc-300">Required</th>
            <th className="px-4 py-3 font-semibold text-zinc-300">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-white/5 last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-violet-300">{row.name}</td>
              <td className="px-4 py-3 text-zinc-400">{row.type}</td>
              <td className="px-4 py-3 text-zinc-500">{row.required ? "Yes" : "No"}</td>
              <td className="px-4 py-3 text-zinc-400">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
