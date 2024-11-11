import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import prisma from '@/lib/prisma';

interface Config {
  id: string;
  name: string;
  config: {
    description?: string;
    fields: Array<{
      name: string;
      type: string;
      options?: any;
    }>;
    destination?: {
      type: string;
      credentials?: any;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  dataRuns: {
    status: string;
    recordsCount: number;
  }[];
}

export default async function ConfigsPage() {
  const configs: Config[] = await prisma.dataConfig.findMany({
    include: {
      dataRuns: {
        select: {
          status: true,
          recordsCount: true,
        },
        orderBy: {
          startTime: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Configurations</h1>
        <Link 
          href="/dashboard/configs/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Config
        </Link>
      </div>

      {configs.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fields</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {configs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{config.name}</div>
                      {config.config.description && (
                        <div className="text-sm text-gray-500">{config.config.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{config.config.fields?.length || 0} fields</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {config.config.destination?.type || 'None'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {config.dataRuns[0] ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {config.dataRuns[0].recordsCount} records
                          </div>
                          <div className="text-sm text-gray-500">
                            {config.dataRuns[0].status}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Never run</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(config.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/dashboard/configs/${config.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/dashboard/configs/${config.id}/run`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Run
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center bg-white rounded-lg shadow p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-blue-50 rounded-full p-3">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium">No configurations yet</h3>
            <p className="text-gray-500 max-w-sm">
              Create your first data configuration to start generating dummy data for your applications.
            </p>
            <Link 
              href="/dashboard/configs/new"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Config
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}