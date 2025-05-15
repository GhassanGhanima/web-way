import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import IntegrationSettings from '../../../components/dashboard/IntegrationSettings';
import IntegrationStats from '../../../components/dashboard/IntegrationStats';
import CodeSnippet from '../../../components/dashboard/CodeSnippet';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorAlert from '../../../components/common/ErrorAlert';
import SuccessAlert from '../../../components/common/SuccessAlert';
import { fetchIntegration, updateIntegration, generateNewApiKey } from '../../../services/integrationService';

export default function IntegrationDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [integration, setIntegration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadIntegration();
    }
  }, [id]);

  const loadIntegration = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchIntegration(id);
      setIntegration(data);
    } catch (err) {
      console.error('Failed to load integration:', err);
      setError('Failed to load integration details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIntegration = async (updates) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedIntegration = await updateIntegration(id, updates);
      setIntegration(updatedIntegration);
      setSuccess('Integration updated successfully');
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update integration:', err);
      setError('Failed to update integration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewApiKey = async () => {
    if (!confirm('Are you sure you want to generate a new API key? This will invalidate the current key and may cause disruption to your website.')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedIntegration = await generateNewApiKey(id);
      setIntegration(updatedIntegration);
      setSuccess('New API key generated successfully');
      
      // Clear success message after a delay
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to generate new API key:', err);
      setError('Failed to generate new API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !integration) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !integration) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <ErrorAlert message={error} />
        </div>
      </DashboardLayout>
    );
  }

  if (!integration) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <ErrorAlert message="Integration not found" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>{integration.name} | Integrations | Accessibility Tool</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900">{integration.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Domain: {integration.domain}
                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  integration.status === 'active' ? 'bg-green-100 text-green-800' :
                  integration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {integration.status}
                </span>
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/integrations')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to List
              </button>
            </div>
          </div>

          {/* Success/Error Alerts */}
          {success && <SuccessAlert message={success} />}
          {error && <ErrorAlert message={error} />}

          {/* Integration Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`${
                  activeTab === 'settings'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`${
                  activeTab === 'code'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Installation Code
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {isLoading && (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            )}

            {!isLoading && activeTab === 'overview' && (
              <IntegrationStats integration={integration} />
            )}

            {!isLoading && activeTab === 'settings' && (
              <IntegrationSettings 
                integration={integration} 
                onUpdate={handleUpdateIntegration}
                onGenerateNewApiKey={handleGenerateNewApiKey}
              />
            )}

            {!isLoading && activeTab === 'code' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Installation Code</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Add this script to your website's <code>&lt;head&gt;</code> section:</p>
                  </div>
                  <div className="mt-4">
                    <CodeSnippet 
                      code={`<script src="https://accessibility-tool.example.com/api/v1/cdn/loader.js?apiKey=${integration.apiKey}" async></script>`}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900">Domain Verification</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {integration.isDomainVerified 
                        ? 'Your domain has been verified.'
                        : 'Please verify your domain by adding this meta tag to your website:'}
                    </p>
                    
                    {!integration.isDomainVerified && (
                      <div className="mt-2">
                        <CodeSnippet 
                          code={`<meta name="accessibility-verification" content="${integration.verificationCode}" />`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
