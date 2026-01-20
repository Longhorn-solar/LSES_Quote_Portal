
import React, { useState } from 'react';
import { SERVICES_DB } from '../constants';
import { ProjectState, BidItem } from '../types';
import { getAiRecommendations } from '../services/geminiService';

interface DetailViewProps {
  project: ProjectState;
  updateBid: (serviceName: string, updates: Partial<BidItem>) => void;
}

const DetailView: React.FC<DetailViewProps> = ({ project, updateBid }) => {
  const [selectedService, setSelectedService] = useState<string>(Object.keys(SERVICES_DB)[0]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const bid = project.bids[selectedService];
  const info = SERVICES_DB[selectedService];

  const handleAiClick = async () => {
    if (!bid.notes.trim()) {
      alert("Please enter some site conditions or notes first.");
      return;
    }
    
    setIsAiLoading(true);
    
    // Fix: Explicitly cast Object.values to BidItem[] to resolve unknown type errors on 'selected' and 'serviceName'
    const otherSelected = (Object.values(project.bids) as BidItem[])
      .filter(b => b.selected)
      .map(b => b.serviceName);

    const recs = await getAiRecommendations(selectedService, bid.notes, otherSelected);
    updateBid(selectedService, { aiRecommendations: recs });
    setIsAiLoading(false);
  };

  const handleDetailChange = (field: string, value: any) => {
    updateBid(selectedService, {
      details: { ...bid.details, [field]: value }
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Selector */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-base font-bold text-[#002a4d] mb-3">Select Item to Configure</label>
        <select
          className="w-full md:w-1/2 lg:w-1/3 rounded-xl border-none bg-[#002a4d] text-white shadow-sm focus:ring-2 focus:ring-[#0062ab] text-base py-3 px-4"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          {Object.keys(SERVICES_DB).map(s => (
            <option key={s} value={s} className="bg-[#002a4d] text-white">{s} {project.bids[s].selected ? '✅' : ''}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Technical Details Form */}
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <h3 className="text-2xl font-bold text-[#002a4d] flex items-center gap-3">
              <i className="fa-solid fa-list-check text-[#f39200]"></i>
              {selectedService} Specs
            </h3>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Add to Bid?</span>
              <input
                type="checkbox"
                className="h-6 w-6 rounded border-slate-300 text-[#f39200] focus:ring-[#f39200] cursor-pointer"
                checked={bid.selected}
                onChange={(e) => updateBid(selectedService, { selected: e.target.checked })}
              />
            </div>
          </div>
          
          <p className="text-base text-slate-500 italic mb-8 border-l-4 border-orange-200 pl-5 leading-relaxed">{info.desc}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {info.details.map((field) => {
              const isBoolean = field.includes("?") || field.includes("Required") || field.includes("Present") || field.includes("Accessible");
              const isNumeric = field.includes("Count") || field.includes("Amperage") || field.includes("Sq Ft") || field.includes("Rating");

              return (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider">{field}</label>
                  {isBoolean ? (
                    <select
                      className="w-full rounded-xl border-none bg-[#002a4d] text-white text-base focus:ring-2 focus:ring-[#0062ab] py-3 px-4"
                      value={bid.details[field] || ""}
                      onChange={(e) => handleDetailChange(field, e.target.value)}
                    >
                      <option value="" className="bg-[#002a4d]">Select Option</option>
                      <option value="Yes" className="bg-[#002a4d]">Yes</option>
                      <option value="No" className="bg-[#002a4d]">No</option>
                      <option value="Unknown" className="bg-[#002a4d]">Unknown</option>
                    </select>
                  ) : isNumeric ? (
                    <input
                      type="number"
                      className="w-full rounded-xl border-none bg-[#002a4d] text-white text-base focus:ring-2 focus:ring-[#0062ab] py-3 px-4"
                      placeholder="0"
                      value={bid.details[field] || ""}
                      onChange={(e) => handleDetailChange(field, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      className="w-full rounded-xl border-none bg-[#002a4d] text-white text-base focus:ring-2 focus:ring-[#0062ab] py-3 px-4"
                      placeholder="Enter details..."
                      value={bid.details[field] || ""}
                      onChange={(e) => handleDetailChange(field, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <label className="block text-sm font-bold text-[#002a4d] uppercase tracking-wider mb-3">Estimated Cost for this Item ($)</label>
            <div className="relative w-full md:w-2/3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">$</span>
              <input
                type="number"
                className="w-full rounded-xl border-none bg-[#002a4d] text-white text-xl font-bold focus:ring-2 focus:ring-[#0062ab] py-4 pl-10 pr-4"
                placeholder="0.00"
                value={bid.estCost || ""}
                onChange={(e) => updateBid(selectedService, { estCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* AI Analysis & Considerations */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-[#002a4d] flex items-center gap-3 mb-6">
              <i className="fa-solid fa-microchip text-[#f39200]"></i>
              Site Considerations
            </h3>
            <p className="text-base text-slate-500 mb-5 leading-relaxed">Note site conditions or client requests. The AI will analyze <strong>Price Impacts</strong> and <strong>Project Sequencing</strong>.</p>
            <textarea
              className="w-full h-48 rounded-2xl border-none bg-[#002a4d] text-white text-base focus:ring-2 focus:ring-[#0062ab] mb-6 p-6 shadow-inner leading-relaxed placeholder-slate-400"
              placeholder="e.g., Client wants solar screens on south-facing windows only; Attic access is narrow; Roof is 15 years old..."
              value={bid.notes}
              onChange={(e) => updateBid(selectedService, { notes: e.target.value })}
            ></textarea>
            
            <button
              onClick={handleAiClick}
              disabled={isAiLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-3 transition-all shadow-lg ${
                isAiLoading ? 'bg-slate-400' : 'bg-gradient-to-r from-[#0062ab] to-[#004a82] hover:opacity-95 active:scale-[0.98]'
              }`}
            >
              {isAiLoading ? (
                <>
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Consulting Gemini...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Generate Pro Recommendations
                </>
              )}
            </button>
          </div>

          {bid.aiRecommendations && (
            <div className="bg-[#002a4d] text-white p-10 rounded-2xl shadow-2xl border border-slate-800 animate-slideUp">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <h4 className="font-bold text-[#f39200] uppercase tracking-widest text-sm flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#f39200] animate-pulse"></span>
                  Expert Energy Analysis
                </h4>
                <button 
                  onClick={() => updateBid(selectedService, { aiRecommendations: '' })}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              <div className="prose prose-base prose-invert max-w-none whitespace-pre-line leading-relaxed text-white">
                {bid.aiRecommendations}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailView;
