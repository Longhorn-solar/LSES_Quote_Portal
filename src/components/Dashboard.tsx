'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SERVICES_DB } from '@/lib/constants';

// Types
interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
}

interface SiteAddress {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

interface BidItem {
  serviceName: string;
  selected: boolean;
  estCost: number;
  details: Record<string, any>;
  notes: string;
  aiRecommendations: string;
}

interface Project {
  project_id: string;
  user_id: string;
  client_name: string;
  phone_number: string;
  project_date: string;
  status: string;
  site_address: SiteAddress;
  bids: Record<string, BidItem>;
}

const ViewMode = {
  DASHBOARD: 'DASHBOARD',
  SUMMARY: 'SUMMARY',
  DETAILED: 'DETAILED',
  SPECS: 'SPECS'
};

const ProjectStatus = {
  QUOTING: 'QUOTING',
  PROPOSED: 'PROPOSED',
  IN_PROGRESS: 'IN_PROGRESS'
};

// Meta Modal Component
function MetaModal({ isOpen, onClose, onSave, initialData, title }: any) {
  const [formData, setFormData] = useState({
    clientName: '',
    phoneNumber: '',
    address1: '',
    address2: '',
    city: '',
    state: 'TX',
    zip: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.client_name || '',
        phoneNumber: initialData.phone_number || '',
        address1: initialData.site_address?.address1 || '',
        address2: initialData.site_address?.address2 || '',
        city: initialData.site_address?.city || '',
        state: initialData.site_address?.state || 'TX',
        zip: initialData.site_address?.zip || '',
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      clientName: formData.clientName,
      phoneNumber: formData.phoneNumber,
      siteAddress: {
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002a4d]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-[#002a4d] uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client Name</label>
              <input
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none"
                placeholder="512-000-0000"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address Line 1</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none"
                value={formData.address1}
                onChange={e => setFormData({ ...formData, address1: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address Line 2</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none"
                value={formData.address2}
                onChange={e => setFormData({ ...formData, address2: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State</label>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Zip</label>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none"
                  value={formData.zip}
                  onChange={e => setFormData({ ...formData, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-4 bg-[#002a4d] text-white font-bold rounded-xl hover:bg-[#003d70] shadow-lg">
              Save Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    QUOTING: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Quoting' },
    PROPOSED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Proposed' },
    IN_PROGRESS: { bg: 'bg-green-100', text: 'text-green-700', label: 'In Progress' },
  };
  const config = configs[status] || configs.QUOTING;
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Dashboard View
function DashboardView({ projects, onSelectProject, onCreateProject }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const stats = useMemo(() => ({
    quoting: projects.filter((p: Project) => p.status === 'QUOTING').length,
    proposed: projects.filter((p: Project) => p.status === 'PROPOSED').length,
    inProgress: projects.filter((p: Project) => p.status === 'IN_PROGRESS').length,
  }), [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p: Project) => {
      const matchesSearch = p.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter ? p.status === activeFilter : true;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchQuery, activeFilter]);

  const calculateTotal = (p: Project) => {
    return Object.values(p.bids || {}).reduce((sum, bid) => sum + (bid.selected ? bid.estCost : 0), 0);
  };

  const countSelectedServices = (p: Project) => {
    return Object.values(p.bids || {}).filter(bid => bid.selected).length;
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-12">
      <div className="mb-12">
        <h2 className="text-4xl font-extrabold text-[#002a4d] tracking-tight mb-2">Projects Dashboard</h2>
        <p className="text-slate-500 text-lg">Manage all active bids and project lifecycle stages.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[{ key: 'QUOTING', label: 'Quotes in Process', count: stats.quoting, color: '#f39200' },
          { key: 'PROPOSED', label: 'Total Proposed', count: stats.proposed, color: '#0062ab' },
          { key: 'IN_PROGRESS', label: 'In Progress', count: stats.inProgress, color: '#002a4d' }].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveFilter(activeFilter === item.key ? null : item.key)}
            className={`p-8 rounded-2xl border transition-all text-left group ${
              activeFilter === item.key
                ? `bg-[${item.color}] border-[${item.color}] text-white shadow-xl`
                : 'bg-white border-slate-200 hover:shadow-lg'
            }`}
            style={activeFilter === item.key ? { backgroundColor: item.color, borderColor: item.color } : {}}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-black uppercase tracking-widest ${activeFilter === item.key ? 'text-white/80' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
            <div className="text-4xl font-black">{item.count}</div>
          </button>
        ))}
      </div>

      {/* Search & Create */}
      <div className="flex flex-col lg:flex-row items-center gap-6 mb-8">
        <div className="relative flex-1 w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            placeholder="Search by client name..."
            className="w-full bg-white border-none rounded-2xl py-5 pl-14 pr-6 text-lg shadow-sm focus:ring-2 focus:ring-[#0062ab] text-[#002a4d] font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={onCreateProject}
          className="w-full lg:w-auto px-8 py-5 bg-[#002a4d] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-[#001a33]"
        >
          <i className="fa-solid fa-plus text-[#f39200]"></i>
          Create New Quote
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Client Name</th>
              <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date Created</th>
              <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-widest"># Services</th>
              <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Bid Value</th>
              <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.length > 0 ? filteredProjects.map((p: Project) => (
              <tr key={p.project_id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6 cursor-pointer" onClick={() => onSelectProject(p.project_id)}>
                  <span className="text-lg font-bold text-[#002a4d] group-hover:text-[#0062ab]">
                    {p.client_name || 'Unnamed Client'}
                  </span>
                </td>
                <td className="px-8 py-6 text-slate-500 font-medium">
                  {new Date(p.project_date).toLocaleDateString()}
                </td>
                <td className="px-8 py-6"><StatusBadge status={p.status} /></td>
                <td className="px-8 py-6 text-center">
                  <span className="inline-flex items-center justify-center bg-slate-100 text-[#002a4d] font-black w-8 h-8 rounded-full text-sm">
                    {countSelectedServices(p)}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-lg font-black text-[#0062ab]">
                    ${calculateTotal(p).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => onSelectProject(p.project_id)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-[#002a4d] text-sm font-bold hover:bg-[#0062ab] hover:text-white"
                  >
                    View / Edit <i className="fa-solid fa-chevron-right text-xs ml-1"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <i className="fa-solid fa-folder-open text-slate-200 text-6xl mb-4"></i>
                  <p className="text-slate-400 text-lg font-medium">No projects found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Summary View
function SummaryView({ project, updateBid }: any) {
  const totalCost = Object.values(project.bids || {}).filter((b: any) => b.selected).reduce((sum: number, b: any) => sum + b.estCost, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Summary Bid Sheet</h2>
          <p className="text-slate-500">Review energy efficiency items and finalize the proposal value.</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 min-w-[240px]">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Bid Value</p>
          <p className="text-4xl font-black text-[#0062ab]">
            ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-center text-sm font-bold text-[#002a4d] uppercase w-16">Incl.</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase">Service Item</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-slate-500 uppercase w-48">Est. Cost ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {Object.keys(SERVICES_DB).map((serviceName) => {
              const bid = project.bids?.[serviceName] || { selected: false, estCost: 0 };
              return (
                <tr key={serviceName} className={bid.selected ? 'bg-orange-50/40' : 'hover:bg-slate-50'}>
                  <td className="px-6 py-5 text-center">
                    <input
                      type="checkbox"
                      className="h-6 w-6 rounded border-slate-300 text-[#f39200] focus:ring-[#f39200] cursor-pointer"
                      checked={bid.selected}
                      onChange={(e) => updateBid(serviceName, { selected: e.target.checked })}
                    />
                  </td>
                  <td className="px-6 py-5"><span className="font-bold text-slate-900">{serviceName}</span></td>
                  <td className="px-6 py-5 text-slate-600">{SERVICES_DB[serviceName].desc}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end">
                      <span className="text-slate-400 mr-2">$</span>
                      <input
                        type="number"
                        className="w-36 rounded-xl border-none bg-[#002a4d] text-white font-semibold text-right py-2 px-3"
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
  );
}

// Detail View
function DetailView({ project, updateBid }: any) {
  const [selectedService, setSelectedService] = useState(Object.keys(SERVICES_DB)[0]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const bid = project.bids?.[selectedService] || { selected: false, estCost: 0, details: {}, notes: '', aiRecommendations: '' };
  const info = SERVICES_DB[selectedService];
  const selectedBids = Object.values(project.bids || {}).filter((b: any) => b.selected) as BidItem[];
  const subtotal = selectedBids.reduce((sum, b) => sum + b.estCost, 0);

  const handleAiClick = async () => {
    if (!bid.notes?.trim()) {
      alert('Please enter some site conditions or notes first.');
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: selectedService,
          notes: bid.notes,
          otherSelectedServices: selectedBids.map(b => b.serviceName)
        })
      });
      const data = await res.json();
      updateBid(selectedService, { aiRecommendations: data.recommendations });
    } catch (err) {
      alert('Failed to generate recommendations.');
    }
    setIsAiLoading(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <label className="block font-bold text-[#002a4d] mb-3">Select Item to Configure</label>
        <select
          className="w-full md:w-1/2 lg:w-1/3 rounded-xl border-none bg-[#002a4d] text-white py-3 px-4"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
        >
          {Object.keys(SERVICES_DB).map(s => (
            <option key={s} value={s}>{s} {project.bids?.[s]?.selected ? '✅' : ''}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Specs Form */}
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <h3 className="text-2xl font-bold text-[#002a4d] flex items-center gap-3">
              <i className="fa-solid fa-list-check text-[#f39200]"></i>
              {selectedService} Specs
            </h3>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-bold text-slate-500 uppercase">Add to Bid?</span>
              <input
                type="checkbox"
                className="h-6 w-6 rounded text-[#f39200] cursor-pointer"
                checked={bid.selected}
                onChange={(e) => updateBid(selectedService, { selected: e.target.checked })}
              />
            </div>
          </div>
          <p className="text-slate-500 italic mb-8 border-l-4 border-orange-200 pl-5">{info.desc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {info.details.map(field => (
              <div key={field}>
                <label className="block text-sm font-bold text-slate-600 uppercase mb-2">{field}</label>
                <input
                  type="text"
                  className="w-full rounded-xl border-none bg-[#002a4d] text-white py-3 px-4"
                  placeholder="Enter..."
                  value={bid.details?.[field] || ''}
                  onChange={(e) => updateBid(selectedService, { details: { ...bid.details, [field]: e.target.value } })}
                />
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-slate-100">
            <label className="block text-sm font-bold text-[#002a4d] uppercase mb-3">Estimated Cost ($)</label>
            <div className="relative w-full md:w-2/3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">$</span>
              <input
                type="number"
                className="w-full rounded-xl border-none bg-[#002a4d] text-white text-xl font-bold py-4 pl-10 pr-4"
                placeholder="0.00"
                value={bid.estCost || ''}
                onChange={(e) => updateBid(selectedService, { estCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* AI & Summary */}
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-[#002a4d] flex items-center gap-3 mb-6">
              <i className="fa-solid fa-microchip text-[#f39200]"></i>
              Site Considerations
            </h3>
            <textarea
              className="w-full h-48 rounded-2xl border-none bg-[#002a4d] text-white p-6 mb-6 placeholder-slate-400"
              placeholder="e.g., Client wants solar screens on south-facing windows only..."
              value={bid.notes || ''}
              onChange={(e) => updateBid(selectedService, { notes: e.target.value })}
            />
            <button
              onClick={handleAiClick}
              disabled={isAiLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-3 shadow-lg ${
                isAiLoading ? 'bg-slate-400' : 'bg-gradient-to-r from-[#0062ab] to-[#004a82] hover:opacity-95'
              }`}
            >
              {isAiLoading ? (
                <><div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Consulting AI...</>
              ) : (
                <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate Recommendations</>
              )}
            </button>
          </div>

          {bid.aiRecommendations && (
            <div className="bg-[#002a4d] text-white p-10 rounded-2xl shadow-2xl animate-slideUp">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <h4 className="font-bold text-[#f39200] uppercase tracking-widest text-sm">Expert Analysis</h4>
                <button onClick={() => updateBid(selectedService, { aiRecommendations: '' })} className="text-slate-400 hover:text-white">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              <div className="whitespace-pre-line leading-relaxed">{bid.aiRecommendations}</div>
            </div>
          )}

          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-[#002a4d]">Services in Bid</h3>
              <span className="text-xl font-black text-[#0062ab]">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {selectedBids.length > 0 ? (
              <div className="space-y-3">
                {selectedBids.map(b => (
                  <div
                    key={b.serviceName}
                    onClick={() => setSelectedService(b.serviceName)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                      selectedService === b.serviceName ? 'bg-orange-50 border-[#f39200]' : 'bg-slate-50 border-slate-100 hover:border-[#0062ab]'
                    }`}
                  >
                    <span className="font-bold text-sm">{b.serviceName}</span>
                    <span className="text-sm font-black text-[#0062ab]">${b.estCost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No services added to bid.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Specs Table View
function SpecsTableView({ project }: any) {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-[#002a4d] mb-1">Technical Specifications</h2>
        <p className="text-slate-500">Aggregated view of all fields for this project.</p>
      </div>
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Service</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Field</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Value</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase">In Bid?</th>
              <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.keys(SERVICES_DB).flatMap(serviceName => {
              const info = SERVICES_DB[serviceName];
              const bid = project.bids?.[serviceName] || { selected: false, estCost: 0, details: {} };
              return info.details.map((field, idx) => (
                <tr key={`${serviceName}-${field}`} className={idx === 0 ? 'border-t-2 border-slate-100' : ''}>
                  <td className="px-6 py-4">{idx === 0 ? <span className="font-black text-[#0062ab] uppercase text-sm">{serviceName}</span> : ''}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{field}</td>
                  <td className="px-6 py-4 text-sm">{bid.details?.[field] || <span className="text-slate-400 italic">Not specified</span>}</td>
                  <td className="px-6 py-4 text-center">{idx === 0 && (bid.selected ? <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">Included</span> : <span className="text-xs font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-full">Omitted</span>)}</td>
                  <td className="px-6 py-4 text-right">{idx === 0 && bid.selected && <span className="font-black text-[#002a4d]">${bid.estCost.toLocaleString()}</span>}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Dashboard
export default function Dashboard({ user, setUser }: { user: User; setUser: (u: User | null) => void }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState(ViewMode.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaModalMode, setMetaModalMode] = useState<'edit' | 'create'>('edit');
  const [isLoading, setIsLoading] = useState(true);

  const activeProject = projects.find(p => p.project_id === activeProjectId);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const updateBid = async (serviceName: string, updates: Partial<BidItem>) => {
    if (!activeProjectId || !activeProject) return;
    const newBids = { ...activeProject.bids, [serviceName]: { ...activeProject.bids[serviceName], ...updates } };
    setProjects(prev => prev.map(p => p.project_id === activeProjectId ? { ...p, bids: newBids } : p));
    await fetch(`/api/projects/${activeProjectId}/bids/${encodeURIComponent(serviceName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  };

  const updateProjectMeta = async (updates: any) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => p.project_id === activeProjectId ? { ...p, ...updates, client_name: updates.clientName || p.client_name, phone_number: updates.phoneNumber || p.phone_number, site_address: updates.siteAddress || p.site_address } : p));
    await fetch(`/api/projects/${activeProjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  };

  const createProject = async (data: any) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const newProject = await res.json();
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.project_id);
    setViewMode(ViewMode.DETAILED);
  };

  const exportToNetSuite = () => {
    if (!activeProject) return;
    const selectedBids = Object.values(activeProject.bids || {}).filter(b => b.selected);
    if (selectedBids.length === 0) return alert('No items selected for export.');
    const headers = ['External ID', 'Transaction Date', 'Entity (Client)', 'Item Name', 'Amount', 'Status'];
    const rows = selectedBids.map(bid => [
      activeProject.project_id,
      activeProject.project_date,
      `"${activeProject.client_name}"`,
      `"${bid.serviceName}"`,
      bid.estCost,
      activeProject.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NetSuite_${activeProject.client_name.replace(/\s/g, '_')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#002a4d] border-t-[#f39200] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-700 bg-slate-50">
      <MetaModal
        isOpen={isMetaModalOpen}
        title={metaModalMode === 'create' ? 'Create New Project' : 'Edit Site Information'}
        initialData={metaModalMode === 'edit' ? activeProject : null}
        onClose={() => setIsMetaModalOpen(false)}
        onSave={metaModalMode === 'create' ? createProject : updateProjectMeta}
      />

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#002a4d] text-white flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="mb-8">
            <div className="bg-white p-4 rounded-xl shadow-inner mb-6 flex items-center justify-center min-h-[140px]">
              <Image
                src="https://customer-assets.emergentagent.com/job_9fbf2265-5557-4615-8f17-99f8d47f3a31/artifacts/l593hr9h_LSES_logo.png"
                alt="Longhorn Solar"
                width={150}
                height={120}
                className="object-contain"
              />
            </div>
            <h1 className="text-base font-black tracking-tight uppercase">Energy Efficiency</h1>
            <h1 className="text-2xl font-black tracking-tight text-[#f39200] uppercase -mt-1">Estimator</h1>
          </div>

          <nav className="space-y-3">
            <button onClick={() => setViewMode(ViewMode.DASHBOARD)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold ${viewMode === ViewMode.DASHBOARD ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <i className="fa-solid fa-house"></i> Dashboard
            </button>
            {activeProjectId && (
              <>
                <div className="h-px bg-slate-700 my-4"></div>
                <button onClick={() => setViewMode(ViewMode.DETAILED)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold ${viewMode === ViewMode.DETAILED ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <i className="fa-solid fa-file-invoice"></i> Detailed Config
                </button>
                <button onClick={() => setViewMode(ViewMode.SUMMARY)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold ${viewMode === ViewMode.SUMMARY ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <i className="fa-solid fa-list-check"></i> Summary Bid
                </button>
                <button onClick={() => setViewMode(ViewMode.SPECS)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl font-semibold ${viewMode === ViewMode.SPECS ? 'bg-[#f39200] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                  <i className="fa-solid fa-table"></i> Tech Specs
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <img src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=f39200&color=fff`} alt={user.name} className="w-12 h-12 rounded-full border-2 border-[#f39200]" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <button onClick={handleLogout} className="text-xs text-[#f39200] font-bold hover:underline">Sign Out</button>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center">v2.5.0 · Vercel Edition</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        {viewMode === ViewMode.DASHBOARD ? (
          <DashboardView projects={projects} onSelectProject={(id: string) => { setActiveProjectId(id); setViewMode(ViewMode.DETAILED); }} onCreateProject={() => { setMetaModalMode('create'); setIsMetaModalOpen(true); }} />
        ) : activeProject ? (
          <>
            <header className="mb-12">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                  <button onClick={() => setViewMode(ViewMode.DASHBOARD)} className="text-[#0062ab] hover:underline font-bold text-sm mb-1">← Dashboard</button>
                  <h2 className="text-4xl font-extrabold text-[#002a4d]">{activeProject.client_name || 'Untitled'}</h2>
                  <div className="mt-3 flex flex-wrap gap-4 text-slate-500">
                    {activeProject.site_address?.address1 && (
                      <span><i className="fa-solid fa-location-dot text-[#f39200] mr-2"></i>{activeProject.site_address.address1}, {activeProject.site_address.city}</span>
                    )}
                    {activeProject.phone_number && (
                      <span><i className="fa-solid fa-phone text-[#0062ab] mr-2"></i>{activeProject.phone_number}</span>
                    )}
                    <button onClick={() => { setMetaModalMode('edit'); setIsMetaModalOpen(true); }} className="text-[#0062ab] text-xs font-bold border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-50">
                      <i className="fa-solid fa-pen-to-square mr-1"></i> Edit
                    </button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={exportToNetSuite} className="px-6 py-3 rounded-xl bg-[#2a6db0] text-white font-bold shadow-md hover:bg-[#1e4f80]">
                    <i className="fa-solid fa-file-csv mr-2"></i> Export CSV
                  </button>
                </div>
              </div>
            </header>
            {viewMode === ViewMode.SUMMARY && <SummaryView project={activeProject} updateBid={updateBid} />}
            {viewMode === ViewMode.DETAILED && <DetailView project={activeProject} updateBid={updateBid} />}
            {viewMode === ViewMode.SPECS && <SpecsTableView project={activeProject} />}
          </>
        ) : null}
      </main>
    </div>
  );
}
