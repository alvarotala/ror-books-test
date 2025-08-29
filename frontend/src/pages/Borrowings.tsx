import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

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
    <div>
      <h1 className="text-2xl font-bold mb-4">Borrowings</h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="border-b">
            {state.user?.role === 'librarian' && <th className="p-2">Member</th>}
            <th className="p-2">Book</th>
            <th className="p-2">Borrowed</th>
            <th className="p-2">Due</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b">
              {state.user?.role === 'librarian' && (
                <td className="p-2">{it.user ? (it.user.first_name || it.user.last_name ? `${it.user.first_name || ''} ${it.user.last_name || ''}`.trim() : it.user.email) : '-'}</td>
              )}
              <td className="p-2">{it.book.title} <span className="text-gray-500">by {it.book.author}</span></td>
              <td className="p-2">{new Date(it.borrowed_at).toLocaleDateString()}</td>
              <td className="p-2">{new Date(it.due_date).toLocaleDateString()}</td>
              <td className="p-2">{it.status}</td>
              <td className="p-2">
                {(it.status === 'borrowed') && (
                  <button className="text-blue-600" onClick={() => onReturn(it.id)}>Return</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


