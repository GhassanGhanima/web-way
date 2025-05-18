import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import UsersList from '../../../../components/dashboard/admin/UsersList';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import ErrorAlert from '../../../../components/common/ErrorAlert';
import SuccessAlert from '../../../../components/common/SuccessAlert';
import { useAuth } from '../../../../contexts/AuthContext';
import { fetchAdminUsers, deleteUser } from '../../../../services/adminService';

export default function AdminUsers() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!authLoading && (!user || !user.roles.includes('admin'))) {
      router.push('/login?returnUrl=/dashboard/admin/users');
      return;
    }

    if (user && user.roles.includes('admin')) {
      loadUsers();
    }
  }, [user, authLoading, router]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully.');
      loadUsers(); // Reload the list
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (isLoading && users.length === 0)) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Manage Users | Admin Dashboard | Accessibility Tool</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">Manage Users</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage users for your websites
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                href="/dashboard/admin/users/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New User
              </Link>
            </div>
          </div>

          {/* Success/Error Alerts */}
          {success && <SuccessAlert message={success} />}
          {error && <ErrorAlert message={error} />}

          {/* Users List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <UsersList
              users={users}
              isLoading={isLoading}
              onDelete={handleDeleteUser}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}