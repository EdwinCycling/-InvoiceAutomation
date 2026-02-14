import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Save, Calculator, 
  Check, History, MoreHorizontal, Wand2, Split, FileText, List 
} from 'lucide-react';
import { Document, LineItem } from '../types';
import { GL_ACCOUNTS, VAT_CODES, SUPPLIERS } from '../mockData';
import { detectCostSpreading, validateAndHeal } from '../services/aiEngine';

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
  
  // Mobile Tab State
  const [activeMobileTab, setActiveMobileTab] = useState<'DOC' | 'FORM'>('FORM');

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
      const { healedLines, log, isValid } = validateAndHeal(doc);
      
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
    }, 1200); 
  };

  const handlePostToExact = () => {
      const aiNote = `AI Booking Log: Used historical match. Confidence ${Math.round(doc.confidence * 100)}%.`;
      console.log("POSTING TO EXACT:", { journalEntry: doc, note: aiNote });
      alert(`Boeking succesvol aangemaakt in Exact Online!`);
      onSave();
  };

  const lineTotal = doc.lines.reduce((sum, l) => sum + Number(l.amount), 0);
  const diff = (doc.totalAmount - lineTotal).toFixed(2);
  const isBalanced = Math.abs(Number(diff)) < 0.01;

  // Exact Style Inputs
  const inputClass = "w-full text-sm border border-slate-300 dark:border-slate-600 rounded-sm shadow-sm focus:border-exact-blue focus:ring-1 focus:ring-exact-blue bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 transition-colors";
  const labelClass = "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1";

  return (
    <div className="flex flex-col h-full bg-exact-bg dark:bg-slate-900">
      {/* Header Toolbar - Responsive */}
      <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 md:px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-exact-blue text-sm font-medium shrink-0">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Terug</span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 shrink-0"></div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-slate-700 dark:text-white truncate">
              Inkoop <span className="font-normal text-slate-500">| {doc.fileName}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={runValidation}
            disabled={isValidating}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            {isValidating ? <Wand2 className="w-4 h-4 animate-spin text-exact-blue" /> : <Calculator className="w-4 h-4" />}
            <span className="hidden sm:inline">Valideren</span>
          </button>
          <button 
            onClick={handlePostToExact}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-exact-blue text-white text-sm font-medium rounded hover:bg-exact-dark shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Bewaren</span>
          </button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
         <button 
           onClick={() => setActiveMobileTab('DOC')}
           className={`flex-1 py-3 text-sm font-medium text-center flex items-center justify-center gap-2 ${activeMobileTab === 'DOC' ? 'text-exact-blue border-b-2 border-exact-blue' : 'text-slate-500'}`}
         >
           <FileText className="w-4 h-4" /> Document
         </button>
         <button 
           onClick={() => setActiveMobileTab('FORM')}
           className={`flex-1 py-3 text-sm font-medium text-center flex items-center justify-center gap-2 ${activeMobileTab === 'FORM' ? 'text-exact-blue border-b-2 border-exact-blue' : 'text-slate-500'}`}
         >
           <List className="w-4 h-4" /> Invoer
         </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden md:p-4 gap-4 bg-slate-100 dark:bg-slate-900 relative">
        
        {/* Left: Document View - Toggled on Mobile */}
        <div className={`
            w-full md:w-5/12 
            bg-slate-200 dark:bg-slate-950 
            md:rounded md:border border-slate-300 dark:border-slate-700 
            flex items-center justify-center relative overflow-hidden
            flex-1 md:flex-none
            ${activeMobileTab === 'DOC' ? 'flex' : 'hidden md:flex'}
        `}>
             {/* Simple PDF Placeholder */}
             <div className="bg-white dark:bg-slate-800 shadow-xl w-3/4 h-5/6 p-4 md:p-8 relative overflow-y-auto max-h-full my-4">
                <div className="min-h-full border-2 border-dashed border-slate-100 dark:border-slate-700 p-4">
                    <div className="flex justify-between items-end border-b pb-4 mb-4">
                        <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">{doc.supplierName}</div>
                        <div className="text-sm">FACTUUR</div>
                    </div>
                    <div className="space-y-4">
                       <div className="h-4 bg-slate-100 dark:bg-slate-700 w-1/3"></div>
                       <div className="h-4 bg-slate-100 dark:bg-slate-700 w-1/4"></div>
                       <div className="mt-8 h-20 bg-slate-50 dark:bg-slate-900 w-full"></div>
                       <div className="mt-auto pt-8 flex justify-end">
                          <span className="text-xl font-mono font-bold">€ {doc.totalAmount.toFixed(2)}</span>
                       </div>
                    </div>
                </div>
             </div>
             <div className="absolute top-4 right-4 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-75">Preview</div>
        </div>

        {/* Right: Data Entry (Exact Style) - Toggled on Mobile */}
        <div className={`
            w-full md:w-7/12 
            flex flex-col gap-3 md:gap-4 
            overflow-y-auto
            p-2 md:p-0
            ${activeMobileTab === 'FORM' ? 'flex' : 'hidden md:flex'}
        `}>
            
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm shadow-exact p-4">
              <h2 className="text-sm font-bold text-exact-blue uppercase tracking-wide mb-4 border-b border-slate-100 pb-2">Kopregel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                 <div>
                    <label className={labelClass}>Leverancier</label>
                    <select 
                      value={doc.supplierId}
                      onChange={(e) => setDoc({...doc, supplierId: e.target.value})}
                      className={inputClass}
                    >
                      {SUPPLIERS.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className={labelClass}>Factuurdatum</label>
                    <div className="relative">
                       <input 
                         type="date" 
                         value={doc.invoiceDate}
                         onChange={(e) => setDoc({...doc, invoiceDate: e.target.value})}
                         className={inputClass} 
                       />
                    </div>
                 </div>
                 <div className="col-span-1 md:col-span-2">
                    <label className={labelClass}>Omschrijving</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={doc.lines[0]?.description || ''} 
                         className={inputClass}
                       />
                       <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-mono">
                         {(doc.lines[0]?.description || '').length}/45
                       </span>
                    </div>
                 </div>
                 <div>
                    <label className={labelClass}>Factuurbedrag</label>
                    <input type="text" value={`€ ${doc.totalAmount.toFixed(2)}`} disabled className={`${inputClass} bg-slate-50 text-slate-500`} />
                 </div>
                 <div>
                     <label className={labelClass}>AI Vertrouwen</label>
                     <div className="h-[30px] flex items-center">
                       <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${doc.confidence > 0.9 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${doc.confidence * 100}%` }}></div>
                       </div>
                       <span className="ml-2 text-xs font-bold">{Math.round(doc.confidence * 100)}%</span>
                     </div>
                 </div>
              </div>
            </div>

            {/* Lines Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm shadow-exact p-4 flex-1 min-h-[300px]">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-exact-blue uppercase tracking-wide">Factuurregels</h2>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     Verschil: € {diff}
                  </div>
               </div>

               {/* Mobile: Card View for Lines */}
               <div className="md:hidden space-y-4">
                  {doc.lines.map((line, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded p-3 bg-slate-50 dark:bg-slate-800/50">
                        <div className="mb-2">
                           <label className="text-[10px] text-slate-400 block mb-0.5">Omschrijving</label>
                           <input 
                             type="text" 
                             value={line.description}
                             onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                             className="w-full text-sm border-b border-slate-300 dark:border-slate-600 bg-transparent pb-1 focus:border-exact-blue focus:outline-none"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                           <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Grootboek</label>
                              <select 
                                value={line.glAccount}
                                onChange={(e) => handleLineChange(idx, 'glAccount', e.target.value)}
                                className="w-full text-sm bg-transparent border-b border-slate-300 pb-1"
                              >
                                {GL_ACCOUNTS.map(gl => (
                                  <option key={gl.code} value={gl.code}>{gl.code}</option>
                                ))}
                              </select>
                           </div>
                           <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Bedrag</label>
                              <input 
                                type="number" 
                                value={line.amount}
                                onChange={(e) => handleLineChange(idx, 'amount', parseFloat(e.target.value))}
                                className="w-full text-sm bg-transparent border-b border-slate-300 pb-1 text-right font-mono"
                              />
                           </div>
                        </div>
                        {line.isSpread && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-600 bg-purple-50 p-1 rounded inline-flex">
                            <Split className="w-3 h-3" /> Spreiding aanbevolen
                          </div>
                        )}
                    </div>
                  ))}
               </div>

               {/* Desktop: Table View */}
               <div className="hidden md:block overflow-x-auto">
                 <table className="w-full text-xs text-left min-w-[500px]">
                    <thead className="text-slate-500 font-semibold bg-slate-50 dark:bg-slate-700 border-y border-slate-200 dark:border-slate-600">
                      <tr>
                        <th className="px-2 py-2 w-5/12">Omschrijving</th>
                        <th className="px-2 py-2">Grootboek</th>
                        <th className="px-2 py-2">BTW</th>
                        <th className="px-2 py-2 text-right">Bedrag</th>
                        <th className="px-1 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {doc.lines.map((line, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="p-2 align-top">
                             <input 
                               type="text" 
                               value={line.description}
                               onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                               className="w-full border-none p-0 text-xs bg-transparent focus:ring-0 text-slate-800 dark:text-slate-200"
                             />
                             {line.isSpread && (
                               <div className="flex items-center gap-1 mt-1 text-[10px] text-purple-600">
                                 <Split className="w-3 h-3" /> Spreiding: 3 mnd
                               </div>
                             )}
                          </td>
                          <td className="p-2 align-top">
                             <select 
                               value={line.glAccount}
                               onChange={(e) => handleLineChange(idx, 'glAccount', e.target.value)}
                               className="w-full border-none p-0 text-xs bg-transparent focus:ring-0"
                             >
                               {GL_ACCOUNTS.map(gl => (
                                 <option key={gl.code} value={gl.code}>{gl.code} - {gl.description}</option>
                               ))}
                             </select>
                          </td>
                          <td className="p-2 align-top">
                             <select 
                               value={line.vatCode}
                               onChange={(e) => handleLineChange(idx, 'vatCode', e.target.value)}
                               className="w-full border-none p-0 text-xs bg-transparent focus:ring-0"
                             >
                               {VAT_CODES.map(v => (
                                 <option key={v.code} value={v.code}>{v.code}</option>
                               ))}
                             </select>
                          </td>
                          <td className="p-2 align-top text-right">
                             <input 
                               type="number" 
                               value={line.amount}
                               onChange={(e) => handleLineChange(idx, 'amount', parseFloat(e.target.value))}
                               className="w-full border-none p-0 text-xs text-right bg-transparent focus:ring-0 font-mono"
                             />
                          </td>
                          <td className="p-2 align-top text-center">
                             <MoreHorizontal className="w-3 h-3 text-slate-400 cursor-pointer" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>

            {/* Audit Log (Condensed) */}
            {doc.auditLog.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm p-3 text-xs mb-8 md:mb-0">
                 <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                   <Check className="w-3 h-3 text-exact-blue" /> AI Validatie Log
                 </h4>
                 <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                   {doc.auditLog.map((l, i) => (
                     <li key={i} className="flex gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${l.type === 'FIX' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                        <span>{l.message}</span>
                     </li>
                   ))}
                 </ul>
              </div>
            )}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
         <div className="fixed bottom-6 right-6 left-6 md:left-auto bg-slate-800 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 animate-fade-in z-50">
           <Check className="w-4 h-4 text-green-400" />
           <span className="text-sm font-medium">{toastMessage}</span>
         </div>
      )}
    </div>
  );
};