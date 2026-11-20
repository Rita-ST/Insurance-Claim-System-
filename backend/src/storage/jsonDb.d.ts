import { ClaimRecord, DomainEvent } from '../events/types';
interface DatabaseSchema {
    claims: ClaimRecord[];
    eventLog: DomainEvent[];
    notifications: {
        id: string;
        claimId: string;
        email: string;
        message: string;
        timestamp: string;
    }[];
}
export declare function readDb(): DatabaseSchema;
export declare function writeDb(data: DatabaseSchema): void;
export {};
//# sourceMappingURL=jsonDb.d.ts.map