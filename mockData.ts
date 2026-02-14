import { Supplier, GlAccount, VatCode, Document } from './types';

export const SUPPLIERS: Supplier[] = [
  // Verzamelcrediteuren (Collection Accounts)
  { id: 'VC_FUEL', name: 'xxxxx verzamelcrediteur tankbonnen', isCollectionAccount: true, category: 'FUEL' },
  { id: 'VC_SUPER', name: 'xxxxx verzamelcrediteur supermarktbonnen', isCollectionAccount: true, category: 'SUPERMARKET' },
  { id: 'VC_HORECA', name: 'xxxxx verzamelcrediteur horeca', isCollectionAccount: true, category: 'HORECA' },
  { id: 'VC_OTHER', name: 'xxxxx verzamelcrediteur overige bonnen', isCollectionAccount: true, category: 'OTHER' },
  
  // Regular Suppliers
  { id: 'SUP005', name: 'KPN Zakelijk', isCollectionAccount: false, defaultGl: '4100' },
  { id: 'SUP006', name: 'Coolblue Coolbusiness', isCollectionAccount: false, defaultGl: '4500' },
  
  // Fallback
  { id: 'SUP999', name: 'xxxxx Nog aan te maken leveranciers', isCollectionAccount: false },
];

export const GL_ACCOUNTS: GlAccount[] = [
  { code: '4000', description: 'Kantoorkosten' },
  { code: '4100', description: 'Huisvestingskosten' },
  { code: '4200', description: 'Verkoopkosten' },
  { code: '4300', description: 'Autokosten en transport' },
  { code: '4500', description: 'Inventaris en inrichting' },
  { code: '4600', description: 'Representatiekosten' },
  { code: '4900', description: 'Algemene kosten' },
];

export const VAT_CODES: VatCode[] = [
  { code: 'VHE', rate: 21 }, // Verkoop Hoog
  { code: 'VLE', rate: 9 },  // Verkoop Laag
  { code: 'VHC', rate: 21 }, // Inkoop Hoog
  { code: 'VLC', rate: 9 },  // Inkoop Laag
  { code: 'VNU', rate: 0 },  // Nul
];

export const HISTORICAL_MATCHES = {
  'KPN Zakelijk': { gl: '4100', description: 'Internet & Bellen' },
  'Shell': { gl: '4300', description: 'Brandstof' },
  'Coolblue': { gl: '4500', description: 'Hardware' },
};

// Mock history data
export const PAST_INVOICES: Partial<Document>[] = [
    { id: 'DOC-HIST-001', fileName: 'factuur_coolblue_2023.pdf', supplierName: 'Coolblue Coolbusiness', invoiceDate: '2023-09-12', totalAmount: 899.00, status: 'POSTED', confidence: 0.99 },
    { id: 'DOC-HIST-002', fileName: 'lunch_bon_sept.jpg', supplierName: 'xxxxx verzamelcrediteur horeca', invoiceDate: '2023-09-15', totalAmount: 42.50, status: 'POSTED', confidence: 0.88 },
    { id: 'DOC-HIST-003', fileName: 'shell_brandstof.pdf', supplierName: 'xxxxx verzamelcrediteur tankbonnen', invoiceDate: '2023-09-18', totalAmount: 65.22, status: 'POSTED', confidence: 0.95 },
    { id: 'DOC-HIST-004', fileName: 'jumbo_kantoor.jpg', supplierName: 'xxxxx verzamelcrediteur supermarktbonnen', invoiceDate: '2023-09-20', totalAmount: 12.45, status: 'POSTED', confidence: 0.92 },
];
