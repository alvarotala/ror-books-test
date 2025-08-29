import React, { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-xl text-left">
        {title && (
          <div className="border-b p-4 text-base font-semibold">
            {title}
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="border-t p-3">
            <div className="flex items-center justify-end gap-2">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;


