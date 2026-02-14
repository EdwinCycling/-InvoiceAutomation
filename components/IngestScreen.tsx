import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { Document } from '../types';
import { classifyAndRoute, shortenDescription, generateHeaderSubject } from '../services/aiEngine';

interface IngestScreenProps {
  onProcessComplete: (docs: Document[]) => void;
}

export const IngestScreen: React.FC<IngestScreenProps> = ({ onProcessComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedDocs, setProcessedDocs] = useState<Document[]>([]);
  const [progress, setProgress] = useState(0);

  const simulateProcessing = () => {
    setIsProcessing(true);
    setProgress(0);

    // Mock Simulation Steps (Steps 1 & 2)
    const steps = [
      { p: 20, label: 'Splitting bulk PDF...' },
      { p: 40, label: 'OCR Extraction...' },
      { p: 60, label: 'Identifying Suppliers...' },
      { p: 80, label: 'Retrieving Booking History...' },
      { p: 100, label: 'Complete' },
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
        // Step 4a: Generate Subject (Receipt gets supplier name)
        // Step 5: Lines with GL
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

  if (processedDocs.length > 0) {
    return (
      <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Processing Complete</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedDocs.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => onProcessComplete([doc])} 
              className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:shadow-md hover:border-exact-blue dark:hover:border-exact-blue transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${doc.type === 'RECEIPT' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-50 text-exact-blue dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    doc.confidence > 0.9 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {Math.round(doc.confidence * 100)}% Match
                  </span>
                  <span className="text-xs text-slate-400 mt-1">{doc.fileName}</span>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">{doc.supplierName}</h3>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-mono font-medium text-slate-700 dark:text-slate-300">€ {doc.totalAmount.toFixed(2)}</span>
                <span className="flex items-center text-exact-blue text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Review <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </div>
              
              {doc.type === 'RECEIPT' && (
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-2 rounded">
                  <span className="font-semibold">AI Routing:</span> Detected as {doc.supplierName}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-12 bg-slate-50 dark:bg-slate-900">
      {!isProcessing ? (
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={simulateProcessing}
          className={`w-full max-w-2xl h-96 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isDragging 
              ? 'border-exact-blue bg-exact-light dark:bg-slate-800' 
              : 'border-slate-300 dark:border-slate-700 hover:border-exact-blue hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-sm mb-6">
            <Upload className={`w-12 h-12 ${isDragging ? 'text-exact-blue' : 'text-slate-400 dark:text-slate-500'}`} />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Drag & Drop Batch Upload</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
            Upload PDF, JPG or PNG. Our AI will automatically split bulk files and classify receipts.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-lg text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-exact-blue rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-lg font-bold text-exact-blue">{progress}%</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">AI Processing Active</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 animate-pulse">Analyzing structure, splitting pages, and matching suppliers...</p>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-left space-y-3 max-w-sm mx-auto">
            <div className={`flex items-center text-sm ${progress > 20 ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'}`}>
              <CheckCircle className="w-4 h-4 mr-2" /> Splitting Documents
            </div>
            <div className={`flex items-center text-sm ${progress > 60 ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'}`}>
              <CheckCircle className="w-4 h-4 mr-2" /> Identifying "Verzamelcrediteuren"
            </div>
            <div className={`flex items-center text-sm ${progress > 80 ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'}`}>
              <CheckCircle className="w-4 h-4 mr-2" /> Self-Healing Validation
            </div>
          </div>
        </div>
      )}
    </div>
  );
};