import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { state } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const path = state.user?.role === 'librarian' ? '/dashboard/librarian' : '/dashboard/member';
      const res = await api.get(path);
      setData(res.data);
    })();
  }, [state.user?.role]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}


