import { useEffect, useState } from "react";
import { api } from "../api/client";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Button from "../components/Button";
import { Table, THead, TBody, TR, TH, TD } from "../components/Table";

type Member = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
};

export default function MembersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<Member> & { password?: string }>({ email: "", first_name: "", last_name: "", password: "" });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  const load = async () => {
    const res = await api.get('/members', { params: { q, page } });
    setMembers(res.data);
  };

  useEffect(() => { load(); }, [q, page]);

  const onCreate = async () => {
    // client-side validation
    const errs: Record<string, string> = {};
    if (!form.email || !form.email.trim()) errs.email = "Email is required";
    if (!form.password || !form.password.trim()) errs.password = "Temp password is required";
    setCreateErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const res = await api.post('/members', { member: form });
      setMembers((prev) => [res.data, ...prev]);
      setCreating(false);
      setForm({ email: "", first_name: "", last_name: "", password: "" });
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
  };

  const onUpdate = async (id: number, attrs: Partial<Member>) => {
    const res = await api.put(`/members/${id}`, { member: attrs });
    setMembers((prev) => prev.map((m) => (m.id === id ? res.data : m)));
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this member?')) return;
    await api.delete(`/members/${id}`);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input placeholder="Search members" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <Button variant={creating ? 'ghost' : 'primary'} onClick={() => setCreating((v) => !v)}>
          {creating ? 'Cancel' : 'New Member'}
        </Button>
      </div>
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New Member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="secondary" onClick={onCreate}>Create</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Email" value={form.email || ''} error={createErrors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="First name" value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input label="Last name" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <Input label="Temp password" type="password" value={form.password || ''} error={createErrors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
      </Modal>
      <Table className="table-fixed">
        <THead>
          <TR>
            <TH className="w-[40%]">Email</TH>
            <TH className="w-[25%]">First name</TH>
            <TH className="w-[25%]">Last name</TH>
            <TH className="w-[10%] text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {members.map((m) => (
            <Row key={m.id} m={m} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </TBody>
      </Table>
      {(page > 1 || members.length === 25) && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-gray-600">Page {page}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={members.length < 25}>Next</Button>
        </div>
      )}
    </div>
  );
}

function Row({ m, onUpdate, onDelete }: { m: Member; onUpdate: (id: number, attrs: Partial<Member>) => void; onDelete: (id: number) => void; }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Member>>(m);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = async () => {
    // client-side validation
    const next: Record<string, string> = {};
    if (!form.email || !form.email.trim()) next.email = "Email is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setLoading(true);
    try {
      await onUpdate(m.id, { email: form.email, first_name: form.first_name, last_name: form.last_name });
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
        alert('Failed to save');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TR>
      <TD className="w-[40%]">{m.email}</TD>
      <TD className="w-[25%]">{m.first_name}</TD>
      <TD className="w-[25%]">{m.last_name}</TD>
      <TD className="w-[10%] text-right">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setForm(m); setEditing(true); }}>Edit</Button>
          <Button variant="danger" onClick={() => onDelete(m.id)} disabled={loading}>Delete</Button>
        </div>
        <Modal
          open={editing}
          onClose={() => setEditing(false)}
          title="Edit Member"
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="secondary" onClick={save} disabled={loading}>Save</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input label="Email" value={form.email || ''} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="First name" value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last name" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
        </Modal>
      </TD>
    </TR>
  );
}


