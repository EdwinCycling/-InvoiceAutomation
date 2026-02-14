import React from 'react';
import { FileText, CheckCircle, Search, Calendar, Filter } from 'lucide-react';
import { PAST_INVOICES } from '../mockData';

export const HistoryScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-8 bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Booking History</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Archive of AI-processed invoices</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search..." 
               className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-exact-blue dark:text-white"
             />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
             <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1">
        <table className="w-full text-sm text-left">
           <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Document</th>
                 <th className="px-6 py-4">Supplier</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4 text-right">Amount</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {PAST_INVOICES.map((inv, idx) => (
                 <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          {inv.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-exact-blue rounded">
                             <FileText className="w-4 h-4" />
                          </div>
                          <div>
                             <p className="font-medium text-slate-900 dark:text-white">{inv.fileName}</p>
                             <p className="text-xs text-slate-500 dark:text-slate-400">ID: {inv.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                       {inv.supplierName}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                       <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {inv.invoiceDate}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-slate-900 dark:text-white">
                       € {inv.totalAmount?.toFixed(2)}
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};
