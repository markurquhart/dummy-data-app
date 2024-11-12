import { faker } from '@faker-js/faker';
import type { Field } from '@/types/config';

export class DataGenerator {
  generateValue(fieldType: string): any {
    switch (fieldType) {
      case 'firstName':
        return faker.person.firstName();
      case 'lastName':
        return faker.person.lastName();
      case 'email':
        return faker.internet.email();
      case 'phone':
        return faker.phone.number();
      case 'company':
        return faker.company.name();
      case 'address':
        return faker.location.streetAddress();
      case 'date':
        return faker.date.past().toISOString();
      case 'number':
        return faker.number.int({ min: 0, max: 1000 });
      case 'boolean':
        return faker.datatype.boolean();
      case 'uuid':
        return faker.string.uuid();
      default:
        return faker.lorem.word();
    }
  }

  generateRecord(fields: Field[]): Record<string, any> {
    const record: Record<string, any> = {};
    for (const field of fields) {
      record[field.name] = this.generateValue(field.type);
    }
    return record;
  }

  generateBatch(fields: Field[], batchSize: number): Record<string, any>[] {
    return Array.from({ length: batchSize }, () => this.generateRecord(fields));
  }
}