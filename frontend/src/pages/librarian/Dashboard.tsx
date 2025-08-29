import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader } from "../../components/Card";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";

type LibrarianData = {
  total_books: number;
  currently_borrowed: number;
  due_today: number;
  overdue_books_count: number;
  top_genres: Record<string, number>;
  recent_borrowings: Array<{
    id: number;
    created_at: string;
    user: { id: number; email: string; first_name?: string; last_name?: string };
    book: { id: number; title: string };
  }>;
};

export default function Dashboard() {
  const { state } = useAuth();
  const [data, setData] = useState<LibrarianData | null>(null);
  const [q, setQ] = useState("");
  const [quickResults, setQuickResults] = useState<Array<{ id: number; title: string; author: string }>>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (state.user?.role === 'librarian') {
        const res = await api.get('/dashboard/librarian');
        setData(res.data as LibrarianData);
      } else {
        setData(null);
      }
    })();
  }, [state.user?.role]);

  useEffect(() => {
    if (!q) {
      setQuickResults([]);
      return;
    }
    const id = setTimeout(async () => {
      const res = await api.get('/books', { params: { q } });
      setQuickResults(res.data);
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      {state.user?.role === 'librarian' ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total books" value={data?.total_books} />
            {data && data.currently_borrowed > 0 && (
              <Stat 
                label="Currently borrowed" 
                value={data.currently_borrowed} 
                onClick={() => navigate('/borrowings?status=borrowed')}
                clickable
              />
            )}
            {data && data.due_today > 0 && (
              <div 
                className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => navigate('/borrowings?status=borrowed')}
              >
                <div className="text-yellow-700 text-sm font-semibold">Due soon (3d)</div>
                <div className="text-yellow-800 text-3xl font-bold">{data.due_today}</div>
              </div>
            )}
            {data && data.overdue_books_count > 0 && (
              <div 
                className="border-2 border-red-500 rounded-lg p-4 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => navigate('/borrowings?status=overdue')}
              >
                <div className="text-red-700 text-sm font-semibold">Overdue books</div>
                <div className="text-red-800 text-3xl font-bold">{data.overdue_books_count}</div>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="font-medium">Quick search</div>
            </CardHeader>
            <CardContent>
              <Input placeholder="Search books by title, author, or genre" value={q} onChange={(e) => setQ(e.target.value)} />
              {q && (
                <ul className="mt-3 divide-y rounded-md border">
                  {quickResults.map((b) => (
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
                  {data?.top_genres && Object.entries(data.top_genres).map(([genre, count]) => (
                    <li key={genre} className="flex items-center justify-between">
                      <span className="text-gray-700">{genre}</span>
                      <span className="font-medium">{count as number}</span>
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
                  {data?.recent_borrowings?.map((r) => (
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
      ) : null}
    </div>
  );
}

function Stat({ label, value, onClick, clickable }: { label: string; value: number | string | null | undefined; onClick?: () => void; clickable?: boolean }) {
  return (
    <div 
      className={`border rounded p-3 cursor-pointer ${clickable ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-bold">{value ?? '-'}</div>
    </div>
  );
}


