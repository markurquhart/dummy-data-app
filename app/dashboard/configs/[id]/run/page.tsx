'use client';

import { useState } from 'react';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface RunSettings {
  recordCount: number;
  batchSize: number;
  delayBetweenBatches: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RunConfigPage({ params }: PageProps) {
  // Unwrap params using React.use()
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<RunSettings>({
    recordCount: 100,
    batchSize: 10,
    delayBetweenBatches: 1000, // milliseconds
  });

  const startDataGeneration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/configs/${id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to start data generation');
      }

      const data = await response.json();
      router.push(`/dashboard/configs/${id}`);
    } catch (error) {
      console.error('Error starting data generation:', error);
      alert('Failed to start data generation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href={`/dashboard/configs/${id}`}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Run Configuration</h1>
        </div>

        {/* Rest of your JSX stays the same */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Settings className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium">Generation Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Records
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.recordCount}
                onChange={(e) => setSettings({
                  ...settings,
                  recordCount: parseInt(e.target.value) || 0
                })}
              />
              <p className="mt-1 text-sm text-gray-500">
                How many records to generate in total
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.batchSize}
                onChange={(e) => setSettings({
                  ...settings,
                  batchSize: parseInt(e.target.value) || 0
                })}
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of records to generate in each batch
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delay Between Batches (ms)
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.delayBetweenBatches}
                onChange={(e) => setSettings({
                  ...settings,
                  delayBetweenBatches: parseInt(e.target.value) || 0
                })}
              />
              <p className="mt-1 text-sm text-gray-500">
                Time to wait between generating batches (in milliseconds)
              </p>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={startDataGeneration}
                disabled={isLoading}
                className={`w-full flex justify-center items-center px-4 py-2 rounded-md text-white 
                  ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Generation...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Generation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}