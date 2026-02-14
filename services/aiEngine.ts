import { Document, LineItem, AuditEntry } from '../types';
import { SUPPLIERS, HISTORICAL_MATCHES, VAT_CODES } from '../mockData';

// 1. Intelligent Routing (Step 2a & 2b)
export const classifyAndRoute = (fileName: string, rawText: string): Partial<Document> => {
  const lowerText = rawText.toLowerCase();
  const isReceipt = lowerText.includes('bon') || lowerText.includes('receipt') || lowerText.includes('kassa');
  
  let type: 'INVOICE' | 'RECEIPT' = isReceipt ? 'RECEIPT' : 'INVOICE';
  let matchedSupplier = SUPPLIERS.find(s => s.id === 'SUP999'); // Default: xxxxx Nog aan te maken
  let confidence = 0.65;
  let originalSupplierName = "Onbekend";

  if (isReceipt) {
    // Receipt Logic: Route to Collection Accounts
    if (lowerText.includes('shell') || lowerText.includes('esso') || lowerText.includes('tank')) {
      matchedSupplier = SUPPLIERS.find(s => s.category === 'FUEL');
      originalSupplierName = "Shell";
      confidence = 0.95;
    } else if (lowerText.includes('cafe') || lowerText.includes('restaurant') || lowerText.includes('lunch')) {
      matchedSupplier = SUPPLIERS.find(s => s.category === 'HORECA');
      originalSupplierName = "Restaurant";
      confidence = 0.92;
    } else if (lowerText.includes('ah') || lowerText.includes('jumbo') || lowerText.includes('albert heijn')) {
      matchedSupplier = SUPPLIERS.find(s => s.category === 'SUPERMARKET');
      originalSupplierName = "Albert Heijn";
      confidence = 0.98;
    } else {
      matchedSupplier = SUPPLIERS.find(s => s.category === 'OTHER');
      originalSupplierName = "Diverse";
      confidence = 0.85;
    }
  } else {
    // Invoice Logic: Historical Match
    const foundSupplier = SUPPLIERS.find(s => lowerText.includes(s.name.toLowerCase()));
    if (foundSupplier && foundSupplier.id !== 'SUP999') {
      matchedSupplier = foundSupplier;
      originalSupplierName = matchedSupplier.name;
      confidence = 0.99;
    } else {
        originalSupplierName = "Nieuwe Leverancier";
    }
  }

  // Helper to carry the "Real" supplier name for description generation, 
  // even if mapped to a collection account.
  // In a real app, we'd store this in metadata. 
  // Here we just return the matched collection account name as the main supplierName.

  return {
    type,
    supplierId: matchedSupplier?.id || 'SUP999',
    supplierName: matchedSupplier?.name || 'Unknown',
    confidence,
  };
};

// 2. 45-Character Limit Enforcer (Step 4a)
export const shortenDescription = (text: string): string => {
  if (text.length <= 45) return text;
  return text.substring(0, 42) + '...';
};

// 3. Generate Header Subject (Step 4a.i)
export const generateHeaderSubject = (type: 'INVOICE' | 'RECEIPT', supplierName: string, rawDesc: string): string => {
    let subject = "";
    
    if (type === 'RECEIPT') {
        // "als het een bon is neem dan ook een verkorte leveranciersnaam op"
        // Extract real name from the collection account string if needed, or use rawDesc hint
        // For this demo, let's assume we want "Supplier: Desc" format
        // Simplification: We use a short alias map for the visual demo
        let shortSup = "Div";
        if(supplierName.includes("tank")) shortSup = "Shell"; // Demo assumption
        if(supplierName.includes("supermarkt")) shortSup = "AH";
        if(supplierName.includes("horeca")) shortSup = "Lunch";
        
        subject = `${shortSup}: ${rawDesc}`;
    } else {
        subject = rawDesc;
    }

    if (subject.length > 45) {
        return subject.substring(0, 45);
    }
    return subject;
};

// 4. Cost Spreading Detection (Step 5c)
export const detectCostSpreading = (description: string): boolean => {
  const yearRegex = /202[3-9]/;
  const periodRegex = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|kwartaal|jaar|annual)/i;
  return yearRegex.test(description) && periodRegex.test(description);
};

// 5. Enhanced Self-Healing Validation (Step 6)
export const validateAndHeal = (
  doc: Document
): { healedLines: LineItem[]; log: AuditEntry[]; isValid: boolean; adjustedTotal: number } => {
  const log: AuditEntry[] = [];
  let healedLines = [...doc.lines];
  let adjustedTotal = doc.totalAmount;

  const sumLines = healedLines.reduce((sum, line) => sum + line.amount, 0);
  const diff = doc.totalAmount - sumLines;
  const absDiff = Math.abs(diff);

  // Step 6a: Valideer of regels + btw optellen tot totaal.
  // In deze mock gaan we er vanuit dat line.amount inclusief BTW is voor de check.
  
  if (absDiff < 0.01) {
    log.push({
      timestamp: new Date(),
      type: 'SUCCESS',
      message: 'Validatie geslaagd: Regels sluiten aan op Factuurtotaal.',
    });
    return { healedLines, log, isValid: true, adjustedTotal };
  }

  // Step 6a.ii: Afronding correctie
  if (absDiff <= 0.05) {
    // Find largest line to apply rounding fix
    const largestLineIndex = healedLines.reduce((maxIdx, current, idx, arr) => 
      current.amount > arr[maxIdx].amount ? idx : maxIdx, 0
    );

    const oldAmount = healedLines[largestLineIndex].amount;
    const newAmount = oldAmount + diff;
    
    // Apply Fix
    healedLines[largestLineIndex] = {
      ...healedLines[largestLineIndex],
      amount: Number(newAmount.toFixed(2))
    };

    log.push({
      timestamp: new Date(),
      type: 'FIX',
      message: `Afrondingsverschil gedetecteerd (${diff.toFixed(2)}).`,
      details: `AI correctie op regel #${largestLineIndex + 1}: bedrag aangepast van ${oldAmount.toFixed(2)} naar ${healedLines[largestLineIndex].amount.toFixed(2)} om aan te sluiten bij factuurtotaal.`
    });

    return { healedLines, log, isValid: true, adjustedTotal };
  }

  // Step 6a.i: Grote afwijking
  let analysis = 'Oorzaak onbekend.';
  
  // Simple heuristic analysis
  const estimatedVat = sumLines * 0.21; 
  if (Math.abs((sumLines + estimatedVat) - doc.totalAmount) < 0.10) {
    analysis = 'Mogelijk zijn regels exclusief BTW ingevoerd, maar is totaal inclusief.';
  } else if (diff > 0) {
    analysis = 'Totaal is hoger dan som van regels. Ontbrekende regels of verzendkosten?';
  } else {
    analysis = 'Totaal is lager dan som van regels. Korting toegepast?';
  }

  log.push({
    timestamp: new Date(),
    type: 'WARNING',
    message: `Groot verschil gedetecteerd (${diff.toFixed(2)}).`,
    details: `Validatie gefaald. ${analysis} Self-healing afgebroken. Menselijke controle vereist.`
  });

  return { healedLines, log, isValid: false, adjustedTotal };
};
