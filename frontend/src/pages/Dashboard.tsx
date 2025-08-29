import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader } from "../components/Card";
import Input from "../components/Input";

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
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      {state.user?.role === 'librarian' ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total books" value={data?.total_books} />
            <Stat label="Currently borrowed" value={data?.currently_borrowed} />
            <Stat label="Due today" value={data?.due_today} />
            <Stat label="Members with overdue" value={data?.members_with_overdue} />
          </div>

          <Card>
            <CardHeader>
              <div className="font-medium">Quick search</div>
            </CardHeader>
            <CardContent>
              <Input placeholder="Search books by title, author, or genre" value={q} onChange={(e) => setQ(e.target.value)} />
              {q && (
                <ul className="mt-3 divide-y rounded-md border">
                  {quickResults.map((b: any) => (
                    <li key={b.id} className="flex items-center justify-between p-3 text-sm">
                      <span>{b.title} <span className="text-gray-500">by {b.author}</span></span>
                      <a className="text-blue-600" href={`/`}>View</a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="font-medium">Top genres</div>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-2 text-sm">
                  {data?.top_genres && Object.entries(data.top_genres).map(([genre, count]: any) => (
                    <li key={genre} className="flex items-center justify-between">
                      <span className="text-gray-700">{genre}</span>
                      <span className="font-medium">{count as any}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="font-medium">Recent borrowings</div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y rounded-md border text-sm">
                  {data?.recent_borrowings?.map((r: any) => (
                    <li key={r.id} className="p-3">
                      <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                      <div><span className="font-medium">{r.user?.first_name || r.user?.last_name ? `${r.user?.first_name || ''} ${r.user?.last_name || ''}`.trim() : r.user?.email}</span> borrowed <span className="font-medium">{r.book?.title}</span></div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="font-medium">Your activity</div>
          </CardHeader>
          <CardContent>
            <pre className="rounded bg-gray-50 p-3 text-sm">{JSON.stringify(data, null, 2)}</pre>
          </CardContent>
        </Card>
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


