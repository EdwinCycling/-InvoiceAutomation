import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Save, Calculator, 
  Check, History, MoreHorizontal, Wand2, Split 
} from 'lucide-react';
import { Document, LineItem } from '../types';
import { GL_ACCOUNTS, VAT_CODES, SUPPLIERS } from '../mockData';
import { detectCostSpreading, validateAndHeal, shortenDescription } from '../services/aiEngine';

interface DetailCockpitProps {
  document: Document;
  onBack: () => void;
  onSave: () => void;
}

export const DetailCockpit: React.FC<DetailCockpitProps> = ({ document: initialDoc, onBack, onSave }) => {
  const [doc, setDoc] = useState<Document>(initialDoc);
  const [isValidating, setIsValidating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Apply cost spreading detection on mount
  useEffect(() => {
    const updatedLines = doc.lines.map(line => ({
      ...line,
      isSpread: detectCostSpreading(line.description)
    }));
    setDoc(prev => ({ ...prev, lines: updatedLines }));
  }, []);

  const handleLineChange = (index: number, field: keyof LineItem, value: any) => {
    const newLines = [...doc.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setDoc({ ...doc, lines: newLines });
  };

  const runValidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      const { healedLines, log, isValid, adjustedTotal } = validateAndHeal(doc);
      
      setDoc(prev => ({
        ...prev,
        lines: healedLines,
        auditLog: [...prev.auditLog, ...log]
      }));

      setIsValidating(false);
      
      if (log.find(l => l.type === 'FIX')) {
        setToastMessage("AI Correctie: Afronding aangepast.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else if (isValid) {
        setToastMessage("Validatie Succesvol. Klaar om te boeken.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }, 1200); // Simulate "Thinking" time
  };

  // Step 7: Post to Exact logic
  const handlePostToExact = () => {
      // 7b: Generate AI Note
      const aiNote = `
--- AI BOOKING LOG ---
Supplier: ${doc.supplierName}
Logic: Used historical match #1234
Confidence Score: ${Math.round(doc.confidence * 100)}%
Audit Trail:
${doc.auditLog.map(l => `- [${l.type}] ${l.message}`).join('\n')}
----------------------
      `;

      // Simulate API Call
      console.log("POSTING TO EXACT:", {
          journalEntry: doc,
          note: aiNote
      });

      alert(`Boeking succesvol aangemaakt in Exact Online!\n\nAI Notitie toegevoegd:\n${aiNote}`);
      onSave();
  };

  const lineTotal = doc.lines.reduce((sum, l) => sum + Number(l.amount), 0);
  const diff = (doc.totalAmount - lineTotal).toFixed(2);
  const isBalanced = Math.abs(Number(diff)) < 0.01;

  // CSS classes for inputs to ensure contrast in both modes
  const inputClass = "w-full text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-exact-blue focus:ring-exact-blue bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 transition-colors";
  const selectClass = "w-full text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-exact-blue focus:ring-exact-blue bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 transition-colors";
  const gridInputClass = "w-full text-sm border-transparent bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-slate-300 dark:focus:border-slate-600 rounded p-1 text-slate-900 dark:text-white";
  const optionClass = "bg-white dark:bg-slate-800 text-slate-900 dark:text-white";

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header Toolbar */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-700 dark:text-white flex items-center gap-2">
              {doc.fileName}
              <span className={`px-2 py-0.5 rounded text-xs ${doc.status === 'READY' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                {doc.status}
              </span>
            </h1>
            <span className="text-xs text-slate-400">ID: {doc.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={runValidation}
            disabled={isValidating}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            {isValidating ? <Wand2 className="w-4 h-4 animate-spin text-exact-blue" /> : <Calculator className="w-4 h-4" />}
            Validate
          </button>
          <button 
            onClick={handlePostToExact}
            className="flex items-center gap-2 px-4 py-2 bg-exact-blue text-white text-sm font-medium rounded-lg hover:bg-exact-dark shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Post to Exact
          </button>
        </div>
      </header>

      {/* Split View Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Document Preview (Placeholder) */}
        <div className="w-1/2 bg-slate-200 dark:bg-slate-950 p-8 flex items-center justify-center border-r border-slate-200 dark:border-slate-700 overflow-auto">
          <div className="bg-white dark:bg-slate-800 shadow-lg w-full max-w-xl min-h-[800px] rounded-sm p-8 relative opacity-90 transition-colors">
             {/* Simulated PDF View */}
             <div className="flex justify-between mb-8 opacity-50 dark:opacity-30">
               <div className="w-32 h-10 bg-slate-800 dark:bg-slate-200 rounded"></div>
               <div className="text-right">
                 <div className="h-4 w-24 bg-slate-300 dark:bg-slate-600 mb-2 ml-auto"></div>
                 <div className="h-4 w-16 bg-slate-300 dark:bg-slate-600 ml-auto"></div>
               </div>
             </div>
             <div className="space-y-4 opacity-40 dark:opacity-20">
               <div className="h-4 w-full bg-slate-200 dark:bg-slate-600 rounded"></div>
               <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-600 rounded"></div>
               <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-600 rounded"></div>
             </div>
             <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex justify-between font-mono text-sm dark:text-slate-300">
                   <span>Total</span>
                   <span>€ {doc.totalAmount.toFixed(2)}</span>
                </div>
             </div>
             
             {/* Overlay Badge simulating AI scanning */}
             <div className="absolute top-1/3 right-12 bg-exact-blue/10 dark:bg-exact-blue/20 border border-exact-blue text-exact-blue px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                AI Scanning...
             </div>
          </div>
        </div>

        {/* Right Panel: Data Entry Form */}
        <div className="w-1/2 flex flex-col bg-white dark:bg-slate-900 overflow-hidden transition-colors">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. Header Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Header Details</h2>
                {doc.confidence > 0.8 && (
                   <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-100 dark:border-green-800">
                     <History className="w-3 h-3" />
                     Matched with historical invoice #1234
                   </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Supplier</label>
                  <select 
                    value={doc.supplierId}
                    onChange={(e) => setDoc({...doc, supplierId: e.target.value})}
                    className={selectClass}
                  >
                    {SUPPLIERS.map(s => (
                      <option key={s.id} value={s.id} className={optionClass}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Invoice Date</label>
                   <div className="relative">
                     <input 
                       type="date" 
                       value={doc.invoiceDate}
                       onChange={(e) => setDoc({...doc, invoiceDate: e.target.value})}
                       className={`${inputClass} pl-9`} // Add padding for icon
                       style={{colorScheme: 'light dark'}}
                     />
                     <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                   </div>
                </div>
                <div className="col-span-2">
                   <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Subject (Max 45 chars)</label>
                   <div className="relative">
                     <input 
                       type="text" 
                       value={doc.lines[0]?.description || ''} // Simply mapped to first line for demo
                       className={`${inputClass} pr-12`}
                     />
                     <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                       {(doc.lines[0]?.description || '').length}/45
                     </span>
                     <Wand2 className="w-4 h-4 text-exact-blue absolute right-8 top-2.5 cursor-pointer hover:scale-110 transition-transform" />
                   </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* 2. Line Items Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Line Items</h2>
                <span className={`text-xs font-mono font-medium ${isBalanced ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                   Diff: € {diff}
                </span>
              </div>
              
              <div className="border rounded-lg overflow-hidden border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                    <tr>
                      <th className="px-4 py-3 w-1/2">Description</th>
                      <th className="px-4 py-3">GL</th>
                      <th className="px-4 py-3">VAT</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-2 py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {doc.lines.map((line, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-4 py-2">
                           <input 
                             type="text" 
                             value={line.description}
                             onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                             className={gridInputClass}
                           />
                           {line.isSpread && (
                             <div className="flex items-center gap-1 mt-1">
                               <span className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                                 <Split className="w-3 h-3" /> Cost Spreading Detected
                               </span>
                               <label className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer hover:text-exact-blue">
                                 <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-purple-600 w-3 h-3" defaultChecked />
                                 Apply over 3 months
                               </label>
                             </div>
                           )}
                        </td>
                        <td className="px-4 py-2">
                           <select 
                             value={line.glAccount}
                             onChange={(e) => handleLineChange(idx, 'glAccount', e.target.value)}
                             className={`${gridInputClass} text-xs`}
                           >
                             {GL_ACCOUNTS.map(gl => (
                               <option key={gl.code} value={gl.code} className={optionClass}>{gl.code} - {gl.description}</option>
                             ))}
                           </select>
                        </td>
                        <td className="px-4 py-2">
                          <select 
                             value={line.vatCode}
                             onChange={(e) => handleLineChange(idx, 'vatCode', e.target.value)}
                             className={`${gridInputClass} text-xs`}
                           >
                             {VAT_CODES.map(v => (
                               <option key={v.code} value={v.code} className={optionClass}>{v.code}</option>
                             ))}
                           </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input 
                             type="number" 
                             value={line.amount}
                             onChange={(e) => handleLineChange(idx, 'amount', parseFloat(e.target.value))}
                             className={`${gridInputClass} text-right font-mono`}
                           />
                        </td>
                         <td className="px-2 py-2 text-center text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 cursor-pointer">
                           <MoreHorizontal className="w-4 h-4" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Audit Log Component */}
            {doc.auditLog.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-exact-blue" />
                  AI Audit Trail
                </h3>
                <div className="space-y-3">
                  {doc.auditLog.map((log, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        log.type === 'FIX' ? 'bg-orange-500' : 
                        log.type === 'WARNING' ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{log.message}</p>
                        {log.details && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{log.details}</p>}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{log.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pad for scrolling */}
            <div className="h-12" />

          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
         <div className="fixed bottom-6 right-6 bg-slate-850 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce z-50">
           <Check className="w-5 h-5 text-green-400 dark:text-green-600" />
           <span className="font-medium text-sm">{toastMessage}</span>
         </div>
      )}
    </div>
  );
};