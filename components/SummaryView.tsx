
import React from 'react';
import { SERVICES_DB } from '../constants';
import { ProjectState, BidItem } from '../types';

interface SummaryViewProps {
  project: ProjectState;
  updateBid: (serviceName: string, updates: Partial<BidItem>) => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ project, updateBid }) => {
  const totalCost = (Object.values(project.bids) as BidItem[])
    .filter(b => b.selected)
    .reduce((sum, b) => sum + b.estCost, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Summary Bid Sheet</h2>
          <p className="text-slate-500 text-base">Review energy efficiency items and finalize the proposal value.</p>
        </div>
        <div className="text-left md:text-right bg-slate-50 p-6 rounded-xl border border-slate-100 min-w-[240px]">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Bid Value</p>
          <p className="text-4xl font-black text-[#0062ab]">
            ${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalCost)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow-sm border border-slate-200 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-[#002a4d] uppercase tracking-wider w-16 text-center">Incl.</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Service Item</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-500 uppercase tracking-wider w-48">Est. Cost ($)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {Object.keys(SERVICES_DB).map((serviceName) => {
                const bid = project.bids[serviceName];
                return (
                  <tr key={serviceName} className={`transition-colors ${bid.selected ? 'bg-orange-50/40' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        className="h-6 w-6 rounded border-slate-300 text-[#f39200] focus:ring-[#f39200] cursor-pointer"
                        checked={bid.selected}
                        onChange={(e) => updateBid(serviceName, { selected: e.target.checked })}
                      />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-base font-bold text-slate-900">{serviceName}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-base text-slate-600 line-clamp-1">{SERVICES_DB[serviceName].desc}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end">
                        <span className="text-slate-400 mr-2 text-base font-medium">$</span>
                        <input
                          type="number"
                          className="w-36 rounded-xl border-none bg-[#002a4d] text-white text-base font-semibold text-right focus:ring-2 focus:ring-[#0062ab] py-2 px-3"
                          value={bid.estCost || ''}
                          placeholder="0.00"
                          onChange={(e) => updateBid(serviceName, { estCost: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
