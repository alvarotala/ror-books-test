import { useEffect, useState } from "react";
import { api } from "../api/client";
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
  const [members, setMembers] = useState<Member[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Partial<Member> & { password?: string }>({ email: "", first_name: "", last_name: "", password: "" });

  const load = async () => {
    const res = await api.get('/members', { params: { q } });
    setMembers(res.data);
  };

  useEffect(() => { load(); }, [q]);

  const onCreate = async () => {
    const res = await api.post('/members', { member: form });
    setMembers((prev) => [res.data, ...prev]);
    setCreating(false);
    setForm({ email: "", first_name: "", last_name: "", password: "" });
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
          <Input placeholder="Search members" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button variant={creating ? 'ghost' : 'primary'} onClick={() => setCreating((v) => !v)}>
          {creating ? 'Cancel' : 'New Member'}
        </Button>
      </div>
      {creating && (
        <form className="grid grid-cols-4 items-end gap-2" onSubmit={(e) => { e.preventDefault(); onCreate(); }}>
          <Input placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="First name" value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input placeholder="Last name" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <div className="flex items-center gap-2">
            <Input placeholder="Temp password" type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button type="submit">Create</Button>
          </div>
        </form>
      )}
      <Table>
        <THead>
          <TR>
            <TH>Email</TH>
            <TH>First name</TH>
            <TH>Last name</TH>
            <TH>Actions</TH>
          </TR>
        </THead>
        <TBody>
          {members.map((m) => (
            <Row key={m.id} m={m} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function Row({ m, onUpdate, onDelete }: { m: Member; onUpdate: (id: number, attrs: Partial<Member>) => void; onDelete: (id: number) => void; }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Member>>(m);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await onUpdate(m.id, { email: form.email, first_name: form.first_name, last_name: form.last_name });
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <TR>
        <TD>{m.email}</TD>
        <TD>{m.first_name}</TD>
        <TD>{m.last_name}</TD>
        <TD>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="danger" onClick={() => onDelete(m.id)} disabled={loading}>Delete</Button>
          </div>
        </TD>
      </TR>
    )
  }

  return (
    <TR>
      <TD><Input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></TD>
      <TD><Input value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></TD>
      <TD><Input value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></TD>
      <TD>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={save} disabled={loading}>Save</Button>
          <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </TD>
    </TR>
  );
}


