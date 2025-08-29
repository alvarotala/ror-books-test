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
  const { state } = useAuth();

  const load = async () => {
    const res = await api.get("/borrowings");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const onReturn = async (id: number) => {
    await api.post(`/borrowings/${id}/return_book`);
    await load();
  };

  return (
    <div className="space-y-4">
      <Table>
        <THead>
          <TR>
            {state.user?.role === 'librarian' && <TH>Member</TH>}
            <TH>Book</TH>
            <TH>Borrowed</TH>
            <TH>Due</TH>
            <TH>Status</TH>
            <TH>Actions</TH>
          </TR>
        </THead>
        <TBody>
          {items.map((it) => (
            <TR key={it.id}>
              {state.user?.role === 'librarian' && (
                <TD>{it.user ? (it.user.first_name || it.user.last_name ? `${it.user.first_name || ''} ${it.user.last_name || ''}`.trim() : it.user.email) : '-'}</TD>
              )}
              <TD>{it.book.title} <span className="text-gray-500">by {it.book.author}</span></TD>
              <TD>{new Date(it.borrowed_at).toLocaleDateString()}</TD>
              <TD>{new Date(it.due_date).toLocaleDateString()}</TD>
              <TD>
                {it.status === 'borrowed' && <Badge variant="info">Borrowed</Badge>}
                {it.status === 'returned' && <Badge variant="success">Returned</Badge>}
                {it.status === 'overdue' && <Badge variant="danger">Overdue</Badge>}
              </TD>
              <TD>
                {(it.status === 'borrowed') && (
                  <Button variant="ghost" onClick={() => onReturn(it.id)}>Return</Button>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}


