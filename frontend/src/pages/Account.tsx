import React, { useEffect, useState } from "react";
import { api, ensureCsrfToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import { Card, CardContent, CardHeader } from "../components/Card";

export default function Account() {
  const { refresh, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/account");
        const u = res.data?.user;
        setProfile({ first_name: u?.first_name || "", last_name: u?.last_name || "", email: u?.email || "" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    setMessage(undefined);
    await ensureCsrfToken();
    try {
      await api.put("/account", { user: profile });
      await refresh();
      setMessage("Profile updated");
    } catch (e: any) {
      setError(e?.response?.data?.details?.join?.("; ") || e?.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPwd(true);
    setError(undefined);
    setMessage(undefined);
    await ensureCsrfToken();
    try {
      await api.patch("/account/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      setMessage("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
    } catch (e: any) {
      setError(e?.response?.data?.details?.join?.("; ") || e?.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Account settings</h1>

      {message && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <Card>
        <CardHeader>
          <div className="font-medium">Profile</div>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={saveProfile}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">First name</label>
                <Input value={profile.first_name} onChange={(e) => setProfile(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Last name</label>
                <Input value={profile.last_name} onChange={(e) => setProfile(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Email</label>
              <Input type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="font-medium">Password</div>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={changePassword}>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Current password</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">New password</label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Confirm new password</label>
                <Input type="password" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} />
              </div>
            </div>
            <div>
              <Button type="submit" disabled={changingPwd}>{changingPwd ? "Changing…" : "Change password"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="font-medium">Sign out</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Sign out of your account on this device.</div>
            <Button variant="danger" onClick={logout}>Logout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


