import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import Modal from "../components/Modal";
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
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
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
      <Modal
        open={creating && state.user?.role === 'librarian'}
        onClose={() => setCreating(false)}
        title="New Book"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={async () => {
                // Client-side validation
                const errs: Record<string, string> = {};
                if (!newBook.title || !newBook.title.trim()) errs.title = "Title is required";
                if (!newBook.author || !newBook.author.trim()) errs.author = "Author is required";
                if (!newBook.genre || !newBook.genre.trim()) errs.genre = "Genre is required";
                if (!newBook.isbn || !newBook.isbn.trim()) errs.isbn = "ISBN is required";
                if (newBook.total_copies === undefined || newBook.total_copies === null || Number.isNaN(Number(newBook.total_copies))) {
                  errs.total_copies = "Copies must be a number";
                } else if (Number(newBook.total_copies) < 0) {
                  errs.total_copies = "Copies must be 0 or more";
                }
                setCreateErrors(errs);
                if (Object.keys(errs).length > 0) return;

                try {
                  const res = await api.post('/books', { book: newBook });
                  setBooks((prev) => [res.data, ...prev]);
                  setCreating(false);
                  setNewBook({ title: "", author: "", genre: "", isbn: "", total_copies: 1 });
                  setCreateErrors({});
                } catch (e: any) {
                  const serverErrors = e?.response?.data?.errors;
                  if (serverErrors) {
                    const mapped: Record<string, string> = {};
                    Object.keys(serverErrors).forEach((key) => {
                      const messages = serverErrors[key];
                      const first = Array.isArray(messages) ? messages[0] : String(messages);
                      mapped[key] = first;
                    });
                    setCreateErrors(mapped);
                  } else {
                    alert('Failed to create');
                  }
                }
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Title" value={newBook.title || ''} error={createErrors.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} />
          <Input label="Author" value={newBook.author || ''} error={createErrors.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} />
          <Input label="Genre" value={newBook.genre || ''} error={createErrors.genre} onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })} />
          <Input label="ISBN" value={newBook.isbn || ''} error={createErrors.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} />
          <Input label="Copies" type="number" value={newBook.total_copies ?? 1} error={createErrors.total_copies} onChange={(e) => setNewBook({ ...newBook, total_copies: Number(e.target.value) })} />
        </div>
      </Modal>
      <Table className="table-fixed">
        <THead>
          <TR>
            <TH className="w-[28%]">Title</TH>
            <TH className="w-[18%]">Author</TH>
            <TH className="w-[16%]">Genre</TH>
            <TH className="w-[18%]">ISBN</TH>
            <TH className="w-[10%]">Copies</TH>
            <TH className="w-[10%] text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {books.map((b) => (
            <TR key={b.id}>
              <TD className="w-[28%]">{b.title}</TD>
              <TD className="w-[18%]">{b.author}</TD>
              <TD className="w-[16%]">{b.genre}</TD>
              <TD className="w-[18%]">{b.isbn}</TD>
              <TD className="w-[10%]">{b.total_copies}</TD>
              <TD className="w-[10%] text-right">
                {state.user && state.user.role !== 'librarian' && (
                  <BorrowButton bookId={b.id} />
                )}
                {state.user?.role === 'librarian' && (
                  <span className="flex justify-end gap-3 w-full">
                    <EditBookInline book={b} onChange={(updated) => setBooks((prev) => prev.map((x) => x.id === updated.id ? updated : x))} onDelete={() => setBooks((prev) => prev.filter((x) => x.id !== b.id))} />
                  </span>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {(page > 1 || books.length === 25) && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-gray-600">Page {page}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={books.length < 25}>Next</Button>
        </div>
      )}
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSave = async () => {
    // Frontend basic validation
    const nextErrors: Record<string, string> = {};
    if (!form.title || !form.title.trim()) nextErrors.title = "Title is required";
    if (!form.author || !form.author.trim()) nextErrors.author = "Author is required";
    if (!form.genre || !form.genre.trim()) nextErrors.genre = "Genre is required";
    if (!form.isbn || !form.isbn.trim()) nextErrors.isbn = "ISBN is required";
    if (form.total_copies === undefined || form.total_copies === null || Number.isNaN(Number(form.total_copies))) {
      nextErrors.total_copies = "Copies must be a number";
    } else if (Number(form.total_copies) < 0) {
      nextErrors.total_copies = "Copies must be 0 or more";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await api.put(`/books/${book.id}`, { book: form });
      onChange(res.data);
      setEditing(false);
      setErrors({});
    } catch (e: any) {
      const serverErrors = e?.response?.data?.errors;
      if (serverErrors) {
        const mapped: Record<string, string> = {};
        Object.keys(serverErrors).forEach((key) => {
          const messages = serverErrors[key];
          const first = Array.isArray(messages) ? messages[0] : String(messages);
          mapped[key] = first;
        });
        setErrors(mapped);
      } else {
        alert("Failed to save");
      }
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

  return (
    <>
      <Button variant="ghost" onClick={() => { setForm(book); setEditing(true); }}>Edit</Button>
      <Button variant="danger" onClick={onRemove} disabled={loading}>Delete</Button>
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit Book"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button variant="secondary" onClick={onSave} disabled={loading}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Title" value={form.title || ''} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Author" value={form.author || ''} error={errors.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <Input label="Genre" value={form.genre || ''} error={errors.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
          <Input label="ISBN" value={form.isbn || ''} error={errors.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          <Input label="Copies" type="number" value={form.total_copies ?? 1} error={errors.total_copies} onChange={(e) => setForm({ ...form, total_copies: Number(e.target.value) })} />
        </div>
      </Modal>
    </>
  );
}


