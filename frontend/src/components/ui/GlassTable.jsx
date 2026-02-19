export default function GlassTable({ headers, children, className = '' }) {
  return (
    <div className={`glass rounded-2xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/30">
              {headers.map((h, i) => (
                <th key={i} className="px-5 py-3 text-left font-semibold text-secondary whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`px-5 py-3.5 text-text whitespace-nowrap ${className}`}>{children}</td>;
}
