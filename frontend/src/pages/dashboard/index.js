import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import IntegrationsList from '../../components/dashboard/IntegrationsList';
import OverviewChart from '../../components/dashboard/OverviewChart';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDashboardData } from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login?returnUrl=/dashboard');
      return;
    }

    // Fetch dashboard data
    if (user) {
      setIsLoading(true);
      fetchDashboardData()
        .then((data) => {
          setDashboardData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch dashboard data:', err);
          setError('Failed to load dashboard data. Please try again later.');
          setIsLoading(false);
        });
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorAlert message={error} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard | Accessibility Tool</title>
      </Head>

      <div className="py-6">
        <div className="px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        <div className="px-4 sm:px-6 md:px-8 mt-8">
          {/* Overview Section */}
          <section className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Page Views" 
                value={dashboardData?.stats.totalPageViews.toLocaleString() || '0'}
                change={dashboardData?.stats.pageViewsChange || 0}
                icon="chart-bar"
              />
              <StatCard 
                title="Active Integrations" 
                value={dashboardData?.stats.activeIntegrations.toString() || '0'}
                change={dashboardData?.stats.integrationsChange || 0}
                icon="code"
              />
              <StatCard 
                title="Feature Usage" 
                value={dashboardData?.stats.featureUsageCount.toLocaleString() || '0'}
                change={dashboardData?.stats.featureUsageChange || 0}
                icon="cursor-click"
              />
              <StatCard 
                title="Subscription Status" 
                value={dashboardData?.subscription.status || 'None'}
                type="status"
                statusColor={
                  dashboardData?.subscription.status === 'Active' ? 'green' :
                  dashboardData?.subscription.status === 'Trial' ? 'yellow' :
                  dashboardData?.subscription.status === 'Expired' ? 'red' : 'gray'
                }
                icon="credit-card"
              />
            </div>
          </section>

          {/* Usage Charts */}
          <section className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Usage Analytics</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <OverviewChart data={dashboardData?.charts.usageData || []} />
            </div>
          </section>

          {/* Quick Actions and Integrations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Integrations</h2>
              <div className="bg-white rounded-lg shadow">
                <IntegrationsList 
                  integrations={dashboardData?.integrations || []}
                  isLoading={isLoading}
                />
                <div className="px-6 py-4 border-t border-gray-100">
                  <Link 
                    href="/dashboard/integrations/new" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    + Add New Integration
                  </Link>
                </div>
              </div>
            </section>

            <section className="lg:col-span-1">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-white rounded-lg shadow">
                <ActivityFeed activities={dashboardData?.activities || []} />
                <div className="px-6 py-4 border-t border-gray-100">
                  <Link 
                    href="/dashboard/activity" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View All Activity
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
