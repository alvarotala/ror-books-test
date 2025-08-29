import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  total_copies: number;
};

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState("");
  const { state } = useAuth();

  useEffect(() => {
    (async () => {
      const res = await api.get("/books", { params: { q } });
      setBooks(res.data);
    })();
  }, [q]);

  return (
    <div>
      <div className="flex gap-2 items-center mb-4">
        <input className="border p-2 flex-1" placeholder="Search books" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <table className="w-full text-left border">
        <thead>
          <tr className="border-b">
            <th className="p-2">Title</th>
            <th className="p-2">Author</th>
            <th className="p-2">Genre</th>
            <th className="p-2">ISBN</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id} className="border-b">
              <td className="p-2">{b.title}</td>
              <td className="p-2">{b.author}</td>
              <td className="p-2">{b.genre}</td>
              <td className="p-2">{b.isbn}</td>
              <td className="p-2">
                {state.user && (
                  <BorrowButton bookId={b.id} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BorrowButton({ bookId }: { bookId: number }) {
  const [loading, setLoading] = useState(false);
  const onBorrow = async () => {
    setLoading(true);
    try {
      await api.post("/borrowings", { book_id: bookId });
      alert("Borrowed!");
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to borrow");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button className="text-blue-600" disabled={loading} onClick={onBorrow}>{loading ? "..." : "Borrow"}</button>
  );
}


