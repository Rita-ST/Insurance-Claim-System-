import fs from 'fs';
import path from 'path';
import { ClaimRecord, DomainEvent } from '../events/types';

const DB_PATH = path.join(__dirname, '../../data.json');

interface DatabaseSchema {
  claims: ClaimRecord[];
  eventLog: DomainEvent[];
  notifications: { id: string; claimId: string; email: string; message: string; timestamp: string }[];
}

const defaultData: DatabaseSchema = {
  claims: [],
  eventLog: [],
  notifications: [],
};

export function readDb(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

export function writeDb(data: DatabaseSchema): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
