import { useEffect, useState } from "react";
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
  const [creating, setCreating] = useState(false);
  const [newBook, setNewBook] = useState<Partial<Book>>({ title: "", author: "", genre: "", isbn: "", total_copies: 1 });
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
        {state.user?.role === 'librarian' && (
          <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={() => setCreating((v) => !v)}>
            {creating ? "Cancel" : "New Book"}
          </button>
        )}
      </div>
      {creating && state.user?.role === 'librarian' && (
        <CreateBookForm
          value={newBook}
          onChange={setNewBook}
          onSubmit={async () => {
            const payload = { book: newBook };
            const res = await api.post('/books', payload);
            setBooks((prev) => [res.data, ...prev]);
            setCreating(false);
            setNewBook({ title: "", author: "", genre: "", isbn: "", total_copies: 1 });
          }}
        />
      )}
      <table className="w-full text-left border">
        <thead>
          <tr className="border-b">
            <th className="p-2">Title</th>
            <th className="p-2">Author</th>
            <th className="p-2">Genre</th>
            <th className="p-2">ISBN</th>
            <th className="p-2">Copies</th>
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
              <td className="p-2">{b.total_copies}</td>
              <td className="p-2">
                {state.user && state.user.role !== 'librarian' && (
                  <BorrowButton bookId={b.id} />
                )}
                {state.user?.role === 'librarian' && (
                  <span className="flex gap-3">
                    <EditBookInline book={b} onChange={(updated) => setBooks((prev) => prev.map((x) => x.id === updated.id ? updated : x))} onDelete={() => setBooks((prev) => prev.filter((x) => x.id !== b.id))} />
                  </span>
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

function CreateBookForm({ value, onChange, onSubmit }: { value: Partial<Book>; onChange: (v: Partial<Book>) => void; onSubmit: () => Promise<void>; }) {
  return (
    <form className="mb-4 grid grid-cols-5 gap-2 items-end" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <input className="border p-2" placeholder="Title" value={value.title || ''} onChange={(e) => onChange({ ...value, title: e.target.value })} />
      <input className="border p-2" placeholder="Author" value={value.author || ''} onChange={(e) => onChange({ ...value, author: e.target.value })} />
      <input className="border p-2" placeholder="Genre" value={value.genre || ''} onChange={(e) => onChange({ ...value, genre: e.target.value })} />
      <input className="border p-2" placeholder="ISBN" value={value.isbn || ''} onChange={(e) => onChange({ ...value, isbn: e.target.value })} />
      <div className="flex gap-2">
        <input className="border p-2 w-24" placeholder="Copies" type="number" value={value.total_copies || 1} onChange={(e) => onChange({ ...value, total_copies: Number(e.target.value) })} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Create</button>
      </div>
    </form>
  );
}

function EditBookInline({ book, onChange, onDelete }: { book: Book; onChange: (b: Book) => void; onDelete: () => void; }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Book>>(book);
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/books/${book.id}`, { book: form });
      onChange(res.data);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async () => {
    if (!confirm('Delete this book?')) return;
    setLoading(true);
    try {
      await api.delete(`/books/${book.id}`);
      onDelete();
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <>
        <button className="text-blue-600" onClick={() => setEditing(true)}>Edit</button>
        <button className="text-red-600" onClick={onRemove} disabled={loading}>Delete</button>
      </>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2 items-end">
      <input className="border p-1" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input className="border p-1" value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} />
      <input className="border p-1" value={form.genre || ''} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
      <input className="border p-1" value={form.isbn || ''} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
      <div className="flex gap-2 items-center">
        <input className="border p-1 w-20" type="number" value={form.total_copies || 1} onChange={(e) => setForm({ ...form, total_copies: Number(e.target.value) })} />
        <button className="text-green-700" onClick={onSave} disabled={loading}>Save</button>
        <button className="text-gray-600" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}


