export interface Field {
    name: string;
    type: string;
    options?: any;
  }
  
  export interface ConfigData {
    fields: Field[];
    description?: string;
    destination?: {
      type: string;
      credentials?: any;
    };
    status?: string;
  }
  
  export interface Config {
    id: string;
    name: string;
    config: ConfigData;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface DataRun {
    id: string;
    configId: string;
    userId: string;
    status: 'running' | 'completed' | 'failed';
    recordsCount: number;
    startTime: Date;
    endTime?: Date;
  }
  
  export interface RunSettings {
    recordCount: number;
    batchSize: number;
    delayBetweenBatches: number;
  }

  export interface Field {
    name: string;
    type: string;
    options?: any;
  }
  
  export interface FieldWithId extends Field {
    id: string;
  }