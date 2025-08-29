import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { Card, CardContent, CardHeader } from "../../components/Card";
import Input from "../../components/Input";
import BorrowButton from "../../components/BorrowButton";
import Badge from "../../components/Badge";

type BookResult = { id: number; title: string; author: string; can_borrow?: boolean };
type TopBook = { id: number; title: string; author: string; genre?: string | null; borrowings_count: number; can_borrow?: boolean };
type BorrowingItem = { id: number; due_date: string; borrowed_at?: string; created_at?: string; status?: string; book?: { title?: string; author?: string } };
type DashboardData = {
  current_borrowings: BorrowingItem[];
  history: BorrowingItem[];
  top_books: TopBook[];
  alerts: { overdue_count: number; due_soon_count: number };
};

export default function MemberDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [q, setQ] = useState("");
  const [quickResults, setQuickResults] = useState<BookResult[]>([]);
  const navigate = useNavigate();

  const dueBadge = (dueDateStr: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dueDateStr);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const msInDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.ceil((dueDay.getTime() - today.getTime()) / msInDay);

    if (diffDays < 0) {
      return <Badge variant="danger">Overdue since {due.toLocaleDateString()}</Badge>;
    } else if (diffDays === 0) {
      return <Badge variant="danger">Due today</Badge>;
    } else if (diffDays <= 3) {
      return <Badge variant="warning">Due in {diffDays} day{diffDays === 1 ? '' : 's'}</Badge>;
    } else {
      return <Badge variant="success">Due {due.toLocaleDateString()}</Badge>;
    }
  };

  useEffect(() => {
    (async () => {
      const res = await api.get<DashboardData>('/dashboard/member');
      setData(res.data);
    })();
  }, []);

  useEffect(() => {
    if (!q) {
      setQuickResults([]);
      return;
    }
    const id = setTimeout(async () => {
      const res = await api.get<BookResult[]>('/books', { params: { q } });
      setQuickResults(res.data);
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.alerts?.overdue_count && data.alerts.overdue_count > 0 && (
          <div 
            className="border-2 border-red-500 rounded-lg p-4 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => navigate('/borrowings?status=overdue')}
          >
            <div className="text-red-700 text-sm font-semibold">OVERDUE</div>
            <div className="text-red-800 text-3xl font-bold">{data.alerts.overdue_count}</div>
          </div>
        )}
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
              {quickResults.map((b) => (
                <li key={b.id} className="flex items-center justify-between p-3 text-sm">
                  <span>{b.title} <span className="text-gray-500">by {b.author}</span></span>
                  {b.can_borrow ? <BorrowButton bookId={b.id} /> : <span className="text-xs text-gray-400">N/A</span>}
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
            {data?.top_books?.map((b) => (
              <li key={b.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-gray-500">by {b.author}{b.genre ? ` • ${b.genre}` : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{b.borrowings_count} borrows</span>
                  {b.can_borrow ? <BorrowButton bookId={b.id} /> : <span className="text-xs text-gray-400">N/A</span>}
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
              {data?.current_borrowings?.length ? data.current_borrowings.map((r) => {
                const now = new Date();
                const due = new Date(r.due_date);
                const diffDays = Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                const isOverdue = diffDays < 0;
                const isDueSoon = diffDays >= 0 && diffDays <= 3;
                
                return (
                  <li key={r.id} className={`flex items-center justify-between p-3 ${isOverdue ? 'bg-red-50 border-l-4 border-l-red-500' : isDueSoon ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''}`}>
                    <div>
                      <div className="font-medium">{r.book?.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {r.book?.author ? <span>by {r.book.author}</span> : null}
                        {r.borrowed_at ? (
                          <span>
                            {r.book?.author ? ' • ' : ''}
                            Borrowed {new Date(r.borrowed_at).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div>{dueBadge(r.due_date)}</div>
                  </li>
                );
              }) : (
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
              {data?.history?.map((r) => (
                <li key={r.id} className="p-3">
                  <div className="text-xs text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</div>
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

function Stat({ label, value }: { label: string; value: number | string | null | undefined }) {
  return (
    <div className="border rounded p-3">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-bold">{value ?? '-'}</div>
    </div>
  );
}


