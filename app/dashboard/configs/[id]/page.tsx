import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Play, Clock, Database } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

// Add these type definitions at the top of the file
interface ConfigField {
  name: string;
  type: string;
  options?: Record<string, any>;
}

interface Destination {
  type: string;
  credentials?: Record<string, any>;
}

interface ConfigData {
  description?: string;
  fields: ConfigField[];
  destination?: Destination;
  status?: string;
}

interface DataRun {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  recordsCount: number;
}

interface Config {
  id: string;
  name: string;
  config: ConfigData;
  createdAt: Date;
  updatedAt: Date;
  dataRuns: DataRun[];
}

export default async function ConfigDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const config = await prisma.dataConfig.findUnique({
    where: { id: params.id },
    include: {
      dataRuns: {
        orderBy: {
          startTime: 'desc'
        },
        take: 5,
      }
    }
  }) as Config | null;  // Add type assertion here

  if (!config) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link 
              href="/dashboard/configs" 
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{config.name}</h1>
              {config.config?.description && (
                <p className="text-gray-500 mt-1">{config.config.description}</p>
              )}
            </div>
          </div>
          <Link
            href={`/dashboard/configs/${config.id}/run`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Now
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fields */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Data Fields</h2>
              <div className="space-y-4">
                {config.config?.fields?.map((field: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-gray-500">{field.type}</div>
                    </div>
                  </div>
                ))}
                {(!config.config?.fields || config.config.fields.length === 0) && (
                  <div className="text-gray-500 text-center py-4">
                    No fields configured
                  </div>
                )}
              </div>
            </div>

            {/* Destination */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Destination</h2>
              {config.config?.destination ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium">
                      {config.config.destination.type.charAt(0).toUpperCase() + 
                       config.config.destination.type.slice(1)}
                    </div>
                    <div className="text-sm text-gray-500">Connected</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No destination configured
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Runs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Recent Runs</h2>
              {config.dataRuns.length > 0 ? (
                <div className="space-y-4">
                  {config.dataRuns.map((run) => (
                    <div 
                      key={run.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {run.recordsCount} records
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(run.startTime), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${run.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          run.status === 'failed' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}
                      `}>
                        {run.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No runs yet
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-gray-500">Total Runs</div>
                  <div className="font-medium">{config.dataRuns.length}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-500">Created</div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(config.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-500">Last Updated</div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(config.updatedAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}