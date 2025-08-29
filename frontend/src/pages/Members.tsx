import { useEffect, useState } from "react";
import { api } from "../api/client";

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
    <div>
      <h1 className="text-2xl font-bold mb-4">Members</h1>
      <div className="flex gap-2 items-center mb-4">
        <input className="border p-2 flex-1" placeholder="Search members" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={() => setCreating((v) => !v)}>
          {creating ? 'Cancel' : 'New Member'}
        </button>
      </div>
      {creating && (
        <form className="grid grid-cols-4 gap-2 items-end mb-4" onSubmit={(e) => { e.preventDefault(); onCreate(); }}>
          <input className="border p-2" placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="border p-2" placeholder="First name" value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <input className="border p-2" placeholder="Last name" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <div className="flex gap-2 items-center">
            <input className="border p-2" placeholder="Temp password" type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Create</button>
          </div>
        </form>
      )}
      <table className="w-full text-left border">
        <thead>
          <tr className="border-b">
            <th className="p-2">Email</th>
            <th className="p-2">First name</th>
            <th className="p-2">Last name</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <Row key={m.id} m={m} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
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
      <tr className="border-b">
        <td className="p-2">{m.email}</td>
        <td className="p-2">{m.first_name}</td>
        <td className="p-2">{m.last_name}</td>
        <td className="p-2">
          <button className="text-blue-600" onClick={() => setEditing(true)}>Edit</button>
          <button className="text-red-600 ml-3" onClick={() => onDelete(m.id)} disabled={loading}>Delete</button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b">
      <td className="p-2"><input className="border p-1 w-full" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></td>
      <td className="p-2"><input className="border p-1 w-full" value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></td>
      <td className="p-2"><input className="border p-1 w-full" value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></td>
      <td className="p-2">
        <button className="text-green-700" onClick={save} disabled={loading}>Save</button>
        <button className="text-gray-600 ml-3" onClick={() => setEditing(false)}>Cancel</button>
      </td>
    </tr>
  );
}


