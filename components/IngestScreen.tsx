import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, ArrowRight, Building2, MoreVertical, Plus, Bell } from 'lucide-react';
import { Document } from '../types';
import { classifyAndRoute, shortenDescription, generateHeaderSubject } from '../services/aiEngine';

interface IngestScreenProps {
  onProcessComplete: (docs: Document[]) => void;
}

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// Reusable Exact Widget Component
const Widget = ({ title, children, actions }: WidgetProps) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-exact rounded-sm flex flex-col h-full min-h-[160px]">
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 rounded-t-sm">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</h3>
      <div className="flex items-center gap-2">
         {actions}
         <button className="text-slate-400 hover:text-exact-blue"><MoreVertical className="w-4 h-4" /></button>
      </div>
    </div>
    <div className="p-4 flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

export const IngestScreen: React.FC<IngestScreenProps> = ({ onProcessComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocs, setProcessedDocs] = useState<Document[]>([]);
  const [progress, setProgress] = useState(0);

  const simulateProcessing = () => {
    setIsProcessing(true);
    setProgress(0);

    // Mock Simulation Steps
    const steps = [
      { p: 20, label: 'Bulk PDF splitsen...' },
      { p: 40, label: 'OCR Extractie...' },
      { p: 60, label: 'Verzamelcrediteuren identificeren...' },
      { p: 80, label: 'Booking Historie ophalen...' },
      { p: 100, label: 'Voltooid' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        finishProcessing();
        return;
      }
      setProgress(steps[currentStep].p);
      currentStep++;
    }, 600);
  };

  const finishProcessing = () => {
    // Generate simulated results based on "AI Logic"
    const doc1Info = classifyAndRoute('receipt_shell.pdf', 'Shell Station Den Haag Fuel Receipt');
    const doc2Info = classifyAndRoute('invoice_kpn.pdf', 'KPN Zakelijk Invoice #2993 Internet Services');
    
    // Create full dummy objects
    const newDocs: Document[] = [
      {
        ...doc1Info as any,
        id: 'DOC-001',
        fileName: 'scan_batch_001_p1.pdf',
        status: 'READY',
        invoiceDate: '2023-10-24',
        refNumber: '',
        totalAmount: 45.00,
        lines: [{
          id: 'L1', 
          description: generateHeaderSubject('RECEIPT', doc1Info.supplierName || '', 'Brandstof V-Power'), 
          glAccount: '4300', 
          vatCode: 'VHC', 
          amount: 37.19
        }, {
          id: 'L2', 
          description: shortenDescription('Koffie Grande'), 
          glAccount: '4600', 
          vatCode: 'VLC', 
          amount: 7.81
        }],
        auditLog: [],
        validationErrors: []
      },
      {
        ...doc2Info as any,
        id: 'DOC-002',
        fileName: 'scan_batch_001_p2.pdf',
        status: 'REVIEW', 
        invoiceDate: '2023-10-20',
        refNumber: 'INV-2023-998',
        totalAmount: 121.00, 
        lines: [{
          id: 'L1', 
          description: generateHeaderSubject('INVOICE', doc2Info.supplierName || '', 'Internet Services Q4 2023'), 
          glAccount: '4100', 
          vatCode: 'VHC', 
          amount: 100.00
        }],
        auditLog: [],
        validationErrors: []
      }
    ];

    setProcessedDocs(newDocs);
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    simulateProcessing();
  };

  return (
    <div className="h-full overflow-y-auto bg-exact-bg dark:bg-slate-900 p-2 md:p-6 animate-in fade-in duration-500">
      
      {/* Cockpit Header */}
      <div className="flex items-start gap-3 mb-6 px-2 md:px-0">
        <div className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
           <Building2 className="w-6 h-6 text-slate-500" />
        </div>
        <div>
           <h1 className="text-xl md:text-2xl font-normal text-slate-800 dark:text-white">9666 - Cycling World</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Financiële cockpit</p>
        </div>
      </div>

      {/* Cockpit Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-2 md:mb-4">
         {/* Top Summary Widgets */}
         {['Bank / Kas', 'Verkoop', 'Inkoop', 'Resultaat'].map((title, i) => (
           <Widget key={title} title={title}>
              <div className="flex-1 flex flex-col justify-between">
                <span className="text-slate-400 text-xs md:text-sm">Huidig saldo</span>
                <span className="text-right text-xl md:text-2xl font-light text-slate-300">0</span>
              </div>
           </Widget>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 pb-8">
        {/* Main "Smart Ingest" Widget - Replaces Bank/Kas interaction from screenshot */}
        <Widget 
          title="Smart Ingest & AI" 
          actions={
            <button className="text-exact-blue border border-exact-blue rounded px-2 py-0.5 text-xs font-medium hover:bg-blue-50">
               + Upload
            </button>
          }
        >
          {processedDocs.length > 0 ? (
            <div className="space-y-4">
               <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded text-sm text-green-800 dark:text-green-300 flex items-start gap-2">
                 <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                 <div>
                   <span className="font-bold">Verwerking voltooid!</span>
                   <p className="text-xs mt-1">2 documenten klaar voor controle.</p>
                 </div>
               </div>

               <div className="space-y-2">
                 {processedDocs.map((doc) => (
                   <div 
                     key={doc.id} 
                     onClick={() => onProcessComplete([doc])} 
                     className="group flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded hover:border-exact-blue hover:shadow-sm cursor-pointer transition-all bg-white dark:bg-slate-800"
                   >
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${doc.type === 'RECEIPT' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-exact-blue'}`}>
                           <FileText className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{doc.supplierName}</p>
                           <p className="text-xs text-slate-400">Match: {Math.round(doc.confidence * 100)}%</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">€ {doc.totalAmount.toFixed(2)}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-exact-blue" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          ) : !isProcessing ? (
             <div className="flex-1 flex flex-col">
               <div 
                 onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                 onDragLeave={() => setIsDragging(false)}
                 onDrop={handleDrop}
                 onClick={simulateProcessing}
                 className={`flex-1 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer transition-all p-6 min-h-[160px] ${
                   isDragging 
                     ? 'border-exact-blue bg-blue-50 dark:bg-slate-700' 
                     : 'border-slate-300 dark:border-slate-600 hover:border-exact-blue hover:bg-slate-50 dark:hover:bg-slate-800'
                 }`}
               >
                 <Upload className={`w-8 h-8 md:w-10 md:h-10 mb-3 ${isDragging ? 'text-exact-blue' : 'text-slate-400'}`} />
                 <button className="bg-exact-blue text-white text-sm font-medium px-4 py-2 rounded mb-2 hover:bg-exact-dark">
                    Selecteer bestanden
                 </button>
                 <p className="text-xs text-slate-500 text-center">
                    of sleep bestanden hierheen
                 </p>
               </div>
             </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
               <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-slate-100 border-t-exact-blue rounded-full animate-spin mb-4"></div>
               <h4 className="font-semibold text-slate-700 dark:text-white">Analyseren...</h4>
               <p className="text-sm text-slate-500 mb-6">{progress}% voltooid</p>
               <div className="w-full max-w-xs space-y-2">
                  <div className={`text-xs flex items-center ${progress > 20 ? 'text-green-600' : 'text-slate-400'}`}>
                    <CheckCircle className="w-3 h-3 mr-2" /> Splitsen & OCR
                  </div>
                  <div className={`text-xs flex items-center ${progress > 60 ? 'text-green-600' : 'text-slate-400'}`}>
                    <CheckCircle className="w-3 h-3 mr-2" /> Leverancier herkenning
                  </div>
                  <div className={`text-xs flex items-center ${progress > 80 ? 'text-green-600' : 'text-slate-400'}`}>
                    <CheckCircle className="w-3 h-3 mr-2" /> Validatie checks
                  </div>
               </div>
            </div>
          )}
        </Widget>

        {/* Placeholder Widget mimicking Screenshot "Verkoop" */}
        <Widget title="Verkoop" actions={<button className="border border-slate-300 rounded p-1"><MoreVertical className="w-3 h-3 text-slate-400"/></button>}>
           <div className="flex flex-col gap-4">
              <button className="w-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-2 rounded text-sm font-medium hover:bg-slate-50">
                Nieuwe verkoopfactuur
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                 <h4 className="text-sm font-semibold text-slate-700 dark:text-white mb-1">Openstaande posten</h4>
                 <p className="text-xs text-slate-500">Te vorderen</p>
                 <p className="text-xl font-light text-slate-800 dark:text-slate-200 mt-1">€ 12.450,00</p>
              </div>
           </div>
        </Widget>

        {/* Placeholder Widget "Inkoop" */}
         <Widget title="Inkoop" actions={<button className="border border-slate-300 rounded p-1"><MoreVertical className="w-3 h-3 text-slate-400"/></button>}>
           <div className="flex flex-col gap-4">
              <button className="w-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-2 rounded text-sm font-medium hover:bg-slate-50">
                Nieuwe inkoopboeking
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                 <h4 className="text-sm font-semibold text-slate-700 dark:text-white mb-1">Openstaande posten</h4>
                 <p className="text-xs text-slate-500">Te betalen</p>
                 <p className="text-xl font-light text-slate-800 dark:text-slate-200 mt-1">€ 0,00</p>
              </div>
           </div>
        </Widget>

        {/* To Do Widget */}
        <Widget title="To do">
           <div className="flex-1">
             <h4 className="text-sm font-medium text-slate-700 dark:text-white">1 Taken</h4>
             <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-800">
               Controleer 2 nieuwe documenten in Smart Ingest.
             </div>
           </div>
        </Widget>
      </div>

    </div>
  );
};
