import { useEffect, useState } from "react";
import { api } from "../../api/client";
import Input from "../../components/Input";
import { Table, THead, TBody, TR, TH, TD } from "../../components/Table";
import Button from "../../components/Button";
import BorrowButton from "../../components/BorrowButton";

type Book = {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  total_copies: number;
};

export default function MemberBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

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
      </div>
      <Table className="table-fixed">
        <THead>
          <TR>
            <TH className="w-[36%]">Title</TH>
            <TH className="w-[24%]">Author</TH>
            <TH className="w-[20%]">Genre</TH>
            <TH className="w-[10%]">ISBN</TH>
            <TH className="w-[10%] text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {books.map((b) => (
            <TR key={b.id}>
              <TD className="w-[36%]">{b.title}</TD>
              <TD className="w-[24%]">{b.author}</TD>
              <TD className="w-[20%]">{b.genre}</TD>
              <TD className="w-[10%]">{b.isbn}</TD>
              <TD className="w-[10%] text-right">
                <BorrowButton bookId={b.id} />
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


