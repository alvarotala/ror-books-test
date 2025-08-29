import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Table, THead, TBody, TR, TH, TD } from "../../components/Table";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

type Borrowing = {
  id: number;
  book: { id: number; title: string; author: string; };
  user?: { id: number; email: string; first_name?: string; last_name?: string };
  borrowed_at: string;
  due_date: string;
  returned_at?: string | null;
  status: "borrowed" | "returned" | "overdue";
};

export default function BorrowingsPage() {
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
  const { state } = useAuth();
  const [returningId, setReturningId] = useState<number | null>(null);
  const [returnComment, setReturnComment] = useState<string>("");

  const load = useCallback(async () => {
    try {
      const res = await api.get("/borrowings", { params: { page, sort, status, direction, q: q || undefined, date: date || undefined } });
      if (res?.data) {
        setItems(res.data);
      } else {
        console.error('Invalid API response format');
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load borrowings:', error);
      setItems([]);
    }
  }, [page, sort, status, direction, q, date]);

  useEffect(() => {
    load();
  }, [load]);

  // No client-side clamp needed; backend paginates per page

  const onReturn = async (id: number, comment?: string) => {
    try {
      await api.post(`/borrowings/${id}/return_book`, { comment: comment || undefined });
      await load();
    } catch (error) {
      console.error('Failed to return book:', error);
      alert('Failed to return book');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search member or book..."
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
            {state.user?.role === 'librarian'
              ? <TH className="w-[22%]">Member</TH>
              : null}
            <TH className={state.user?.role === 'librarian' ? "w-[34%]" : "w-[50%]"}>Book</TH>
            <TH
              className={state.user?.role === 'librarian' ? "w-[12%] cursor-pointer select-none" : "w-[16%] cursor-pointer select-none"}
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
              className={state.user?.role === 'librarian' ? "w-[12%] cursor-pointer select-none" : "w-[16%] cursor-pointer select-none"}
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
            <TH className={state.user?.role === 'librarian' ? "w-[12%]" : "w-[10%]"}>Status</TH>
            <TH className="w-[8%] text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((it) => (
            <TR key={it.id}>
              {state.user?.role === 'librarian' && (
                <TD className="w-[22%]">{it.user ? (it.user.first_name || it.user.last_name ? `${it.user.first_name || ''} ${it.user.last_name || ''}`.trim() : it.user.email) : '-'}</TD>
              )}
              <TD className={state.user?.role === 'librarian' ? "w-[34%]" : "w-[50%]"}>{it.book.title} <span className="text-gray-500">by {it.book.author}</span></TD>
              <TD className={state.user?.role === 'librarian' ? "w-[12%]" : "w-[16%]"}>{new Date(it.borrowed_at).toLocaleDateString()}</TD>
              <TD className={state.user?.role === 'librarian' ? "w-[12%]" : "w-[16%]"}>{new Date(it.due_date).toLocaleDateString()}</TD>
              <TD className={state.user?.role === 'librarian' ? "w-[12%]" : "w-[10%]"}>
                {it.status === 'borrowed' && (() => {
                  const today = new Date();
                  const dueDate = new Date(it.due_date);
                  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  if (daysUntilDue <= 3 && daysUntilDue >= 0) {
                    return <Badge variant="warning">Due soon ({daysUntilDue}d)</Badge>;
                  } else {
                    return <Badge variant="info">Borrowed</Badge>;
                  }
                })()}
                {it.status === 'returned' && <Badge variant="success">Returned</Badge>}
                {it.status === 'overdue' && <Badge variant="danger">Overdue</Badge>}
              </TD>
              <TD className="w-[8%] text-right">
                <span className="inline-flex w-full justify-end">
                  {(it.status === 'borrowed') && (
                    <Button variant="ghost" onClick={() => { setReturningId(it.id); setReturnComment(""); }}>Return</Button>
                  )}
                </span>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <Modal
        open={returningId !== null}
        onClose={() => { setReturningId(null); setReturnComment(""); }}
        title="Confirm Return"
        footer={(
          <>
            <Button
              variant="ghost"
              onClick={() => { setReturningId(null); setReturnComment(""); }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (returningId !== null) {
                  await onReturn(returningId, returnComment);
                }
                setReturningId(null);
                setReturnComment("");
              }}
            >
              Confirm Return
            </Button>
          </>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">Are you sure you want to mark this borrowing as returned?</p>
          <Input
            label="Optional comment"
            placeholder="Condition, notes, etc."
            value={returnComment}
            onChange={(e) => setReturnComment(e.target.value)}
          />
        </div>
      </Modal>
      {(page > 1 || items.length === 25) && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-gray-600">Page {page}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={items.length < 25}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}


