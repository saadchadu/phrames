'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface Campaign {
  id: string;
  campaignName: string;
  userId: string;
  isActive: boolean;
  isFreeCampaign?: boolean;
  planType?: string;
  createdAt: string;
}

interface RecentCampaignsProps {
  campaigns: Campaign[];
}

export default function RecentCampaigns({ campaigns }: RecentCampaignsProps) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h2>
        <p className="text-sm text-gray-500 text-center py-8">No campaigns yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Campaigns</h2>
        <Link 
          href="/admin/campaigns"
          className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <div 
            key={campaign.id} 
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {campaign.campaignName}
                </p>
                <Link
                  href={`/campaign/${campaign.id}`}
                  target="_blank"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">
                  {campaign.isFreeCampaign ? 'Free' : campaign.planType || 'Paid'}
                </p>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-500">
                  {new Date(campaign.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <span 
              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                campaign.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {campaign.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
