'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Database } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FormData = {
  name: string;
  description: string;
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

type FieldType = {
  id: string;
  name: string;
  type: string;
  options?: any;
};

export default function NewConfigPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState<FieldType[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    fields: [],
  });
  const [selectedDestination, setSelectedDestination] = useState('');
  
  const fieldTypes = [
    'firstName', 'lastName', 'email', 'phone', 
    'company', 'address', 'date', 'number',
    'boolean', 'uuid', 'custom'
  ];

  const destinations = [
    { id: 'klaviyo', name: 'Klaviyo', icon: Database },
    { id: 'snowflake', name: 'Snowflake', icon: Database },
    { id: 'braze', name: 'Braze', icon: Database },
  ];

  const addField = () => {
    const newField = {
      id: `field-${fields.length + 1}`,
      name: '',
      type: fieldTypes[0],
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldType>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(current => ({
      ...current,
      ...updates
    }));
  };

  const saveConfiguration = async () => {
    try {
      // Transform fields array to remove the temporary IDs
      const cleanedFields = fields.map(({ id, ...field }) => field);
  
      const payload = {
        name: formData.name,
        description: formData.description,
        fields: cleanedFields,
        destination: selectedDestination ? {
          type: selectedDestination,
          credentials: {}, // We'll add credentials handling later
        } : undefined,
      };
  
      console.log('Saving config with payload:', payload); // Debug log
  
      const response = await fetch('/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }
  
      const data = await response.json();
      console.log('Save successful:', data); // Debug log
  
      router.push('/dashboard/configs');
    } catch (error) {
      console.error('Error saving configuration:', error);
      // TODO: Add proper error notification here
      alert('Failed to save configuration: ' + (error as Error).message);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/dashboard/configs" 
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Create New Configuration</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className={`flex-1 ${step >= stepNumber ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2 
                      ${step >= stepNumber ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                      {stepNumber}
                    </div>
                    <span className="font-medium">
                      {stepNumber === 1 ? 'Basic Info' : 
                       stepNumber === 2 ? 'Data Schema' : 'Destination'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Customer Data, Product Catalog"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what this configuration will generate..."
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Define Data Fields</h3>
                <button
                  onClick={addField}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </button>
              </div>
              
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Field Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value })}
                      >
                        {fieldTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Add fields to define your data structure</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Select Destination</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.map((dest) => {
                  const Icon = dest.icon;
                  return (
                    <button
                      key={dest.id}
                      onClick={() => setSelectedDestination(dest.id)}
                      className={`p-4 border rounded-lg text-left transition-colors
                        ${selectedDestination === dest.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-200'
                        }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <div className="font-medium">{dest.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setStep(step - 1)}
              className={`px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50
                ${step === 1 ? 'invisible' : ''}`}
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (step < 3) {
                  if (step === 2) {
                    // Update fields in form data before moving to next step
                    updateFormData({ fields: fields.map(({ id, ...field }) => field) });
                  }
                  setStep(step + 1);
                } else {
                  saveConfiguration();
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {step === 3 ? 'Create Configuration' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}