
import React from 'react';
import { SERVICES_DB } from '../constants';
import { ProjectState, BidItem } from '../types';

interface SpecsTableViewProps {
  project: ProjectState;
}

const SpecsTableView: React.FC<SpecsTableViewProps> = ({ project }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-[#002a4d] mb-1">Technical Specifications Master Table</h2>
        <p className="text-slate-500 text-base">An aggregated view of all database fields and entered values for this project.</p>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Service Group</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Specification Field</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Entered Value</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest text-center">In Bid?</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Est. Line Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {Object.keys(SERVICES_DB).map((serviceName) => {
                const info = SERVICES_DB[serviceName];
                const bid = project.bids[serviceName];
                
                return info.details.map((field, idx) => (
                  <tr key={`${serviceName}-${field}`} className={`hover:bg-slate-50 transition-colors ${idx === 0 ? 'border-t-2 border-slate-100' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {idx === 0 ? (
                        <span className="text-sm font-black text-[#0062ab] uppercase">{serviceName}</span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-600">{field}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${bid.details[field] ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}`}>
                        {bid.details[field] || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {idx === 0 && (
                        bid.selected ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            Included
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400">
                            Omitted
                          </span>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                       {idx === 0 && bid.selected && (
                         <span className="text-sm font-black text-[#002a4d]">
                           ${new Intl.NumberFormat().format(bid.estCost)}
                         </span>
                       )}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpecsTableView;
