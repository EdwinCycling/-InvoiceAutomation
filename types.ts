export type Screen = 'LOGIN' | 'INGEST' | 'DETAIL' | 'AUDIT' | 'HISTORY';

export interface Supplier {
  id: string;
  name: string;
  isCollectionAccount: boolean; // verzamelcrediteur
  category?: 'FUEL' | 'HORECA' | 'SUPERMARKET' | 'OTHER';
  defaultGl?: string;
}

export interface GlAccount {
  code: string;
  description: string;
}

export interface VatCode {
  code: string;
  rate: number;
}

export interface LineItem {
  id: string;
  description: string;
  glAccount: string;
  vatCode: string;
  amount: number;
  isSpread?: boolean; // Cost spreading active
  originalDescription?: string; // For audit
}

export interface AuditEntry {
  timestamp: Date;
  type: 'INFO' | 'WARNING' | 'FIX' | 'SUCCESS';
  message: string;
  details?: string;
}

export interface Document {
  id: string;
  fileName: string;
  type: 'INVOICE' | 'RECEIPT' | 'UNKNOWN';
  status: 'PROCESSING' | 'READY' | 'REVIEW' | 'POSTED';
  confidence: number;
  supplierId: string;
  supplierName: string;
  invoiceDate: string;
  refNumber: string;
  totalAmount: number;
  lines: LineItem[];
  auditLog: AuditEntry[];
  validationErrors: string[];
}
