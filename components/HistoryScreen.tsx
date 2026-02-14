import React from 'react';
import { FileText, CheckCircle, Search, Calendar, Filter, MoreVertical } from 'lucide-react';
import { PAST_INVOICES } from '../mockData';

export const HistoryScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-exact-bg dark:bg-slate-900 animate-in fade-in duration-300 overflow-y-auto">
      
      {/* Page Title */}
      <h1 className="text-xl md:text-2xl font-normal text-slate-800 dark:text-white mb-4 md:mb-6">Accountancy Archief</h1>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
              <input 
                type="text" 
                placeholder="Zoeken..." 
                className="pl-8 pr-3 py-2 md:py-1.5 rounded-sm border border-slate-300 dark:border-slate-600 text-sm focus:border-exact-blue focus:ring-1 focus:ring-exact-blue w-full md:w-64"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 md:top-2.5 text-slate-400" />
           </div>
           <button className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm text-slate-600 dark:text-slate-200 text-sm hover:bg-slate-50">
              <Filter className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Filter</span>
           </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-exact rounded-sm overflow-hidden flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Verwerkte Facturen</h3>
            <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
        
        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-auto flex-1">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                   <th className="px-4 py-2">Status</th>
                   <th className="px-4 py-2">Document</th>
                   <th className="px-4 py-2">Leverancier</th>
                   <th className="px-4 py-2">Datum</th>
                   <th className="px-4 py-2 text-right">Bedrag</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {PAST_INVOICES.map((inv, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
                      <td className="px-4 py-3">
                         <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-xs">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Geboekt
                         </span>
                      </td>
                      <td className="px-4 py-3">
                         <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-exact-blue" />
                            <span className="text-slate-700 dark:text-slate-200 group-hover:text-exact-blue">{inv.fileName}</span>
                         </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                         {inv.supplierName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                         {inv.invoiceDate}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800 dark:text-slate-200">
                         € {inv.totalAmount?.toFixed(2)}
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden overflow-y-auto flex-1 p-2 space-y-2 bg-slate-50 dark:bg-slate-900">
           {PAST_INVOICES.map((inv, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                     <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Geboekt
                     </span>
                     <span className="font-mono text-slate-800 dark:text-white font-medium">€ {inv.totalAmount?.toFixed(2)}</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{inv.supplierName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                     <FileText className="w-3 h-3" /> {inv.fileName}
                  </div>
                  <div className="flex items-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-2">
                     <Calendar className="w-3 h-3 mr-1" /> {inv.invoiceDate}
                  </div>
              </div>
           ))}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 text-right">
           Totaal 4 resultaten
        </div>
      </div>
    </div>
  );
};