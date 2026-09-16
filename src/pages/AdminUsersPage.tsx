import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useData } from '../context/DataContext';
import { Navigate } from 'react-router-dom';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export const AdminUsersPage: React.FC = () => {
  const { currentUser, isAdmin } = useData();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_all_users');
        
        if (error) throw error;
        
        setUsers(data || []);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUser?.id) {
      alert('Bạn không thể tự thay đổi quyền của chính mình.');
      return;
    }

    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      console.error('Error updating role:', err);
      alert(err.message || 'Không thể cập nhật quyền người dùng');
    }
  };

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-users-page animate-fade-in">
      <div className="page-header">
        <h2>Quản lý người dùng</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không có người dùng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="p-3 font-medium text-gray-600">Tên</th>
                  <th className="p-3 font-medium text-gray-600">Email</th>
                  <th className="p-3 font-medium text-gray-600">Vai trò</th>
                  <th className="p-3 font-medium text-gray-600">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{u.name || 'Chưa cập nhật'}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(u.id, u.role)}
                          disabled={u.id === currentUser?.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                            u.role === 'admin' ? 'bg-accent' : 'bg-gray-300'
                          } ${u.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                              u.role === 'admin' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role === 'admin' ? 'Admin' : 'Khách hàng'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
