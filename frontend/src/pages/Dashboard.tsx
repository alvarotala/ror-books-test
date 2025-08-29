import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { state } = useAuth();
  const [data, setData] = useState<any>(null);
  const [q, setQ] = useState("");
  const [quickResults, setQuickResults] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const path = state.user?.role === 'librarian' ? '/dashboard/librarian' : '/dashboard/member';
      const res = await api.get(path);
      setData(res.data);
    })();
  }, [state.user?.role]);

  useEffect(() => {
    if (state.user?.role !== 'librarian') return;
    const id = setTimeout(async () => {
      const res = await api.get('/books', { params: { q } });
      setQuickResults(res.data);
    }, 300);
    return () => clearTimeout(id);
  }, [q, state.user?.role]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {state.user?.role === 'librarian' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Stat label="Total books" value={data?.total_books} />
            <Stat label="Currently borrowed" value={data?.currently_borrowed} />
            <Stat label="Due today" value={data?.due_today} />
            <Stat label="Members with overdue" value={data?.members_with_overdue} />
          </div>
          <div>
            <h2 className="font-semibold mb-2">Quick search</h2>
            <input className="border p-2 w-full" placeholder="Search books by title, author, or genre" value={q} onChange={(e) => setQ(e.target.value)} />
            {q && (
              <ul className="mt-2 divide-y border rounded">
                {quickResults.map((b: any) => (
                  <li key={b.id} className="p-2 flex justify-between">
                    <span>{b.title} <span className="text-gray-500">by {b.author}</span></span>
                    <a className="text-blue-600" href={`/`}>View</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="font-semibold mb-2">Top genres</h2>
            <ul className="list-disc ml-6">
              {data?.top_genres && Object.entries(data.top_genres).map(([genre, count]: any) => (
                <li key={genre}>{genre}: {count as any}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Recent borrowings</h2>
            <ul className="divide-y border rounded">
              {data?.recent_borrowings?.map((r: any) => (
                <li key={r.id} className="p-2">
                  <div className="text-sm text-gray-700">{new Date(r.created_at).toLocaleString()}</div>
                  <div><span className="font-medium">{r.user?.first_name || r.user?.last_name ? `${r.user?.first_name || ''} ${r.user?.last_name || ''}`.trim() : r.user?.email}</span> borrowed <span className="font-medium">{r.book?.title}</span></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="border rounded p-3">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-bold">{value ?? '-'}</div>
    </div>
  );
}


