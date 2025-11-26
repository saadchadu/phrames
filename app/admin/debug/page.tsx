'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import PageHeader from '@/components/admin/PageHeader';

export default function AdminDebugPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [envAdminUid, setEnvAdminUid] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserInfo({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      });
    }

    // Fetch the expected admin UID from API
    fetch('/api/admin/debug-uid')
      .then(res => res.json())
      .then(data => setEnvAdminUid(data.adminUid))
      .catch(err => console.error('Failed to fetch admin UID:', err));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAdmin = userInfo && envAdminUid && userInfo.uid === envAdminUid;

  return (
    <PageHeader
      title="Admin Debug"
      description="Check your admin authentication status"
    >
      <div className="space-y-6">
        {/* Current User Info */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User</h2>
          {userInfo ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Email:</label>
                <p className="text-sm text-gray-900 mt-1">{userInfo.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Display Name:</label>
                <p className="text-sm text-gray-900 mt-1">{userInfo.displayName || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Your UID:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-gray-100 px-3 py-2 rounded font-mono flex-1 text-gray-900 break-all">
                    {userInfo.uid}
                  </code>
                  <button
                    onClick={() => copyToClipboard(userInfo.uid)}
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex-shrink-0"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email Verified:</label>
                <p className="text-sm text-gray-900 mt-1">
                  {userInfo.emailVerified ? '✅ Yes' : '❌ No'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading user info...</p>
          )}
        </div>

        {/* Expected Admin UID */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Admin UID</h2>
          {envAdminUid ? (
            <div>
              <label className="text-sm font-medium text-gray-700">ADMIN_UID from .env.local:</label>
              <code className="block text-sm bg-gray-100 px-3 py-2 rounded font-mono mt-1 text-gray-900 break-all">
                {envAdminUid}
              </code>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading...</p>
          )}
        </div>

        {/* Status Check */}
        {userInfo && envAdminUid && (
          <div className={`shadow-sm rounded-lg border p-6 ${
            isAdmin ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: isAdmin ? '#065f46' : '#991b1b' }}>
              Admin Status
            </h2>
            {isAdmin ? (
              <div>
                <p className="text-green-800 font-medium mb-2">✅ You ARE the admin!</p>
                <p className="text-sm text-green-700">
                  Your UID matches the ADMIN_UID in .env.local. You have full admin access.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-800 font-medium mb-2">❌ You are NOT the admin!</p>
                <p className="text-sm text-red-700 mb-4">
                  Your UID does not match the ADMIN_UID in .env.local.
                </p>
                <div className="bg-white border border-red-300 rounded p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">To fix this:</p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                    <li>Copy your UID using the button above</li>
                    <li>Open <code className="bg-gray-100 px-1 rounded text-gray-900">.env.local</code> file</li>
                    <li>Update the line: <code className="bg-gray-100 px-1 rounded text-gray-900">ADMIN_UID=your-uid-here</code></li>
                    <li>Restart your development server</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Quick Fix</h3>
          <p className="text-sm text-blue-800">
            If you're not the admin, copy your UID above and update it in <code className="bg-blue-100 px-1 rounded text-blue-900">.env.local</code>:
          </p>
          <pre className="mt-2 text-xs bg-blue-100 p-3 rounded overflow-x-auto text-blue-900 break-all whitespace-pre-wrap">
ADMIN_UID={userInfo?.uid || 'your-uid-here'}
          </pre>
        </div>
      </div>
    </PageHeader>
  );
}
