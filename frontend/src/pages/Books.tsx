import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import { Table, THead, TBody, TR, TH, TD } from "../components/Table";

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
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [newBook, setNewBook] = useState<Partial<Book>>({ title: "", author: "", genre: "", isbn: "", total_copies: 1 });
  const { state } = useAuth();

  useEffect(() => {
    (async () => {
      const res = await api.get("/books", { params: { q, page } });
      setBooks(res.data);
    })();
  }, [q, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input placeholder="Search books" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        {state.user?.role === 'librarian' && (
          <Button variant={creating ? "ghost" : "primary"} onClick={() => setCreating((v) => !v)}>
            {creating ? "Cancel" : "New Book"}
          </Button>
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
      <Table>
        <THead>
          <TR>
            <TH>Title</TH>
            <TH>Author</TH>
            <TH>Genre</TH>
            <TH>ISBN</TH>
            <TH>Copies</TH>
            <TH>Actions</TH>
          </TR>
        </THead>
        <TBody>
          {books.map((b) => (
            <TR key={b.id}>
              <TD>{b.title}</TD>
              <TD>{b.author}</TD>
              <TD>{b.genre}</TD>
              <TD>{b.isbn}</TD>
              <TD>{b.total_copies}</TD>
              <TD>
                {state.user && state.user.role !== 'librarian' && (
                  <BorrowButton bookId={b.id} />
                )}
                {state.user?.role === 'librarian' && (
                  <span className="flex gap-3">
                    <EditBookInline book={b} onChange={(updated) => setBooks((prev) => prev.map((x) => x.id === updated.id ? updated : x))} onDelete={() => setBooks((prev) => prev.filter((x) => x.id !== b.id))} />
                  </span>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-gray-600">Page {page}</span>
        <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
        <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={books.length < 25}>Next</Button>
      </div>
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
    <Button variant="ghost" disabled={loading} onClick={onBorrow}>{loading ? "…" : "Borrow"}</Button>
  );
}

function CreateBookForm({ value, onChange, onSubmit }: { value: Partial<Book>; onChange: (v: Partial<Book>) => void; onSubmit: () => Promise<void>; }) {
  return (
    <form className="grid grid-cols-5 items-end gap-2" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <Input placeholder="Title" value={value.title || ''} onChange={(e) => onChange({ ...value, title: e.target.value })} />
      <Input placeholder="Author" value={value.author || ''} onChange={(e) => onChange({ ...value, author: e.target.value })} />
      <Input placeholder="Genre" value={value.genre || ''} onChange={(e) => onChange({ ...value, genre: e.target.value })} />
      <Input placeholder="ISBN" value={value.isbn || ''} onChange={(e) => onChange({ ...value, isbn: e.target.value })} />
      <div className="flex items-center gap-2">
        <Input className="w-24" placeholder="Copies" type="number" value={value.total_copies || 1} onChange={(e) => onChange({ ...value, total_copies: Number(e.target.value) })} />
        <Button type="submit">Create</Button>
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
        <Button variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
        <Button variant="danger" onClick={onRemove} disabled={loading}>Delete</Button>
      </>
    );
  }

  return (
    <div className="grid grid-cols-5 items-end gap-2">
      <Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Input value={form.author || ''} onChange={(e) => setForm({ ...form, author: e.target.value })} />
      <Input value={form.genre || ''} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
      <Input value={form.isbn || ''} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
      <div className="flex items-center gap-2">
        <Input className="w-20" type="number" value={form.total_copies || 1} onChange={(e) => setForm({ ...form, total_copies: Number(e.target.value) })} />
        <Button variant="secondary" onClick={onSave} disabled={loading}>Save</Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}


