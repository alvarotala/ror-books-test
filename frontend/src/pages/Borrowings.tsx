import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Table, THead, TBody, TR, TH, TD } from "../components/Table";
import Badge from "../components/Badge";
import Button from "../components/Button";

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
  const [items, setItems] = useState<Borrowing[]>([]);
  const [page, setPage] = useState(1);
  const { state } = useAuth();

  const load = async () => {
    const res = await api.get("/borrowings", { params: { page } });
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, [page]);

  // No client-side clamp needed; backend paginates per page

  const onReturn = async (id: number) => {
    await api.post(`/borrowings/${id}/return_book`);
    await load();
  };

  return (
    <div className="space-y-4">
      <Table className="table-fixed">
        <THead>
          <TR>
            {state.user?.role === 'librarian'
              ? <TH className="w-[22%]">Member</TH>
              : null}
            <TH className={state.user?.role === 'librarian' ? "w-[34%]" : "w-[50%]"}>Book</TH>
            <TH className={state.user?.role === 'librarian' ? "w-[12%]" : "w-[16%]"}>Borrowed</TH>
            <TH className={state.user?.role === 'librarian' ? "w-[12%]" : "w-[16%]"}>Due</TH>
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
                {it.status === 'borrowed' && <Badge variant="info">Borrowed</Badge>}
                {it.status === 'returned' && <Badge variant="success">Returned</Badge>}
                {it.status === 'overdue' && <Badge variant="danger">Overdue</Badge>}
              </TD>
              <TD className="w-[8%] text-right">
                <span className="inline-flex w-full justify-end">
                  {(it.status === 'borrowed') && (
                    <Button variant="ghost" onClick={() => onReturn(it.id)}>Return</Button>
                  )}
                </span>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
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


