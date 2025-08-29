import { useMemo, useState } from "react";
import axios from "axios";
import Button from "./Button";
import Modal from "./Modal";
import { api } from "../api/client";

export default function BorrowButton({ bookId }: { bookId: number }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [available, setAvailable] = useState(true);

  const dueDateText = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString();
  }, []);

  const confirmBorrow = async () => {
    setLoading(true);
    try {
      await api.post("/borrowings", { book_id: bookId });
      setErrorMessage("");
      setSuccessMessage("Borrowed! Please return by " + dueDateText);
      setAvailable(false);
    } catch (e: unknown) {
      let message = "Failed to borrow";
      if (axios.isAxiosError(e)) {
        const data = e.response?.data as { error?: string; details?: string[] | string } | undefined;
        if (Array.isArray(data?.details) && data.details.length) {
          message = data.details.join("\n");
        } else if (typeof data?.details === "string" && data.details) {
          message = data.details;
        } else if (typeof data?.error === "string" && data.error) {
          message = data.error;
        }
      } else if (e instanceof Error) {
        message = e.message || message;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {available ? (
        <Button variant="ghost" disabled={loading} onClick={() => { setErrorMessage(""); setSuccessMessage(""); setOpen(true); }}>{loading ? "…" : "Borrow"}</Button>
      ) : (
        <span className="text-xs text-gray-400">N/A</span>
      )}
      <Modal
        open={open}
        onClose={() => { setOpen(false); setErrorMessage(""); setSuccessMessage(""); }}
        title={successMessage ? "Borrowed" : "Confirm borrow"}
        footer={successMessage ? (
          <Button variant="secondary" onClick={() => { setOpen(false); setSuccessMessage(""); }}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => { setOpen(false); setErrorMessage(""); }} disabled={loading}>Cancel</Button>
            <Button variant="secondary" onClick={confirmBorrow} disabled={loading}>Confirm borrow</Button>
          </>
        )}
      >
        {successMessage ? (
          <div className="space-y-2 text-sm">
            <p className="text-green-700">{successMessage}</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p>Are you sure you want to borrow this book?</p>
            <p className="text-gray-600">If you confirm now, you should return it by <span className="font-medium">{dueDateText}</span>.</p>
            {errorMessage && (
              <div className="mt-2 rounded border border-red-200 bg-red-50 p-3 text-red-700">
                {errorMessage.split("\n").map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}


