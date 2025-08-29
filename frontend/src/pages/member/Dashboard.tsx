import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Card, CardContent, CardHeader } from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import BorrowButton from "../../components/BorrowButton";

export default function MemberDashboard() {
  const [data, setData] = useState<any>(null);
  const [q, setQ] = useState("");
  const [quickResults, setQuickResults] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get('/dashboard/member');
      setData(res.data);
    })();
  }, []);

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overdue" value={data?.alerts?.overdue_count ?? 0} />
        <Stat label="Due soon (3d)" value={data?.alerts?.due_soon_count ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <div className="font-medium">Search books</div>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search books by title, author, or genre" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && (
            <ul className="mt-3 divide-y rounded-md border">
              {quickResults.map((b: any) => (
                <li key={b.id} className="flex items-center justify-between p-3 text-sm">
                  <span>{b.title} <span className="text-gray-500">by {b.author}</span></span>
                  <BorrowButton bookId={b.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="font-medium">Top books</div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y rounded-md border text-sm">
            {data?.top_books?.map((b: any) => (
              <li key={b.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-gray-500">by {b.author}{b.genre ? ` • ${b.genre}` : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{b.borrowings_count} borrows</span>
                  <BorrowButton bookId={b.id} />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="font-medium">Current borrowings</div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y rounded-md border text-sm">
              {data?.current_borrowings?.length ? data.current_borrowings.map((r: any) => (
                <li key={r.id} className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{r.book?.title}</div>
                    <div className="text-gray-500">Due {new Date(r.due_date).toLocaleDateString()}</div>
                  </div>
                  <Button variant="ghost" onClick={async () => { await api.post(`/borrowings/${r.id}/return_book`); const res = await api.get('/dashboard/member'); setData(res.data); }}>Return</Button>
                </li>
              )) : (
                <li className="p-3 text-gray-500">No current borrowings</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="font-medium">Recent history</div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y rounded-md border text-sm">
              {data?.history?.map((r: any) => (
                <li key={r.id} className="p-3">
                  <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                  <div><span className="font-medium">{r.book?.title}</span> — {r.status}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
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


