import { useState } from "react";
import Button from "./Button";
import { api } from "../api/client";

export default function BorrowButton({ bookId }: { bookId: number }) {
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


