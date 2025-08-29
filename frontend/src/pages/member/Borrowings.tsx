import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { Table, THead, TBody, TR, TH, TD } from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";

type Borrowing = {
  id: number;
  book: { id: number; title: string; author: string };
  borrowed_at: string;
  due_date: string;
  returned_at?: string | null;
  status: "borrowed" | "returned" | "overdue";
};

export default function MemberBorrowingsPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Borrowing[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"borrowed_at" | "due_date">("borrowed_at");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [status, setStatus] = useState<"all" | "borrowed" | "returned" | "overdue">(() => {
    const statusParam = searchParams.get('status');
    return (statusParam === 'borrowed' || statusParam === 'returned' || statusParam === 'overdue') ? statusParam : 'all';
  });
  const [q, setQ] = useState("");
  const [date, setDate] = useState<string>("");

  const load = useCallback(async () => {
    const res = await api.get("/borrowings", { params: { page, sort, status, direction, q: q || undefined, date: date || undefined } });
    setItems(res.data);
  }, [page, sort, status, direction, q, date]);

  useEffect(() => {
    load();
  }, [load]);

  

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search book..."
            className="w-64 rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          />
          {(q || date) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setQ(""); setDate(""); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Status</label>
          <select
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            value={status}
            onChange={(e) => { setStatus(e.target.value as "all" | "borrowed" | "returned" | "overdue"); setPage(1); }}
          >
            <option value="all">All</option>
            <option value="borrowed">Borrowed</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>
      <Table className="table-fixed">
        <THead>
          <TR>
            <TH className="w-[50%]">Book</TH>
            <TH
              className="w-[16%] cursor-pointer select-none"
              onClick={() => {
                if (sort === 'borrowed_at') {
                  setDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                } else {
                  setSort('borrowed_at');
                  setDirection('desc');
                }
                setPage(1);
              }}
              aria-sort={sort === 'borrowed_at' ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}
            >
              <span className="inline-flex items-center gap-1">
                Borrowed
                {sort === 'borrowed_at' && (
                  <span aria-hidden="true">{direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </span>
            </TH>
            <TH
              className="w-[16%] cursor-pointer select-none"
              onClick={() => {
                if (sort === 'due_date') {
                  setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSort('due_date');
                  setDirection('asc');
                }
                setPage(1);
              }}
              aria-sort={sort === 'due_date' ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}
            >
              <span className="inline-flex items-center gap-1">
                Due
                {sort === 'due_date' && (
                  <span aria-hidden="true">{direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </span>
            </TH>
            <TH className="w-[10%]">Status</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((it) => (
            <TR key={it.id}>
              <TD className="w-[50%]">{it.book.title} <span className="text-gray-500">by {it.book.author}</span></TD>
              <TD className="w-[16%]">{new Date(it.borrowed_at).toLocaleDateString()}</TD>
              <TD className="w-[16%]">{new Date(it.due_date).toLocaleDateString()}</TD>
              <TD className="w-[10%]">
                {it.status === 'borrowed' && <Badge variant="info">Borrowed</Badge>}
                {it.status === 'returned' && <Badge variant="success">Returned</Badge>}
                {it.status === 'overdue' && <Badge variant="danger">Overdue</Badge>}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {(page > 1 || items.length === 25) && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-gray-600">Page {page}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={items.length < 25}>Next</Button>
        </div>
      )}
    </div>
  );
}


