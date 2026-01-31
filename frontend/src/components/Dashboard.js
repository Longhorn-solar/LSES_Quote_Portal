import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Services Database (static)
const SERVICES_DB = {
  "Energy Audit": {
    desc: "Identify where a building wastes energy (air leaks, poor insulation).",
    details: ["Building Sq Ft", "Year Built", "Blower Door Test Required?", "Infrared Scan Required?"]
  },
  "Insulation": {
    desc: "R-30 to R-38 recommended for Central Texas. 12-18 inches depth.",
    details: ["Attic Sq Ft", "Current R-Value", "Target R-Value", "Material (Fiberglass/Cellulose/Spray)"]
  },
  "Duct Sealing": {
    desc: "Leaky ducts can cause 20-30% loss of conditioned air.",
    details: ["System Age (Years)", "Number of Returns", "Accessible?", "Leakage Test Result (%)"]
  },
  "Weather stripping": {
    desc: "Sealing doors and windows.",
    details: ["Number of Exterior Doors", "Number of Windows", "Door Material", "Gap Size (inches)"]
  },
  "LED Light Bulbs": {
    desc: "High efficiency lighting upgrades.",
    details: ["Bulb Count", "Base Type (E26, GU10, etc.)", "Color Temp (3000K, 5000K)"]
  },
  "Smart Thermostat": {
    desc: "Ecobee or Nest installation.",
    details: ["Brand Preference", "Number of Zones", "C-Wire Present?", "WiFi Signal Strength"]
  },
  "Solar Attic Fans": {
    desc: "Active ventilation for attics.",
    details: ["Roof Type (Shingle/Tile)", "Roof Pitch", "Number of Units", "Thermostat Setting"]
  },
  "Radiant Barrier": {
    desc: "Reflective barrier to reduce heat gain.",
    details: ["Attic Sq Ft", "Foil Type", "Installation Method (Staple/Paint)"]
  },
  "Solatubes": {
    desc: "Tubular skylights.",
    details: ["Tube Diameter (10 or 14 inch)", "Roof Type", "Diffuser Style", "Flashing Type"]
  },
  "Solar Screens": {
    desc: "Exterior window shading.",
    details: ["Number of Windows", "Screen Color", "Sun Exposure Direction", "Frame Color"]
  },
  "Electrical Services": {
    desc: "General electrical upgrades or panel work.",
    details: ["Panel Amperage", "Service Overhead/Underground", "Permit Required?", "Number of Circuits"]
  },
  "Window Installation": {
    desc: "Replacement or new windows.",
    details: ["Count", "Frame Material (Vinyl/Alum)", "Glass Type (Low-E)", "Operation (Single/Double Hung)"]
  },
  "Door Installation": {
    desc: "Front or rear door replacement.",
    details: ["Count", "Door Type (Entry/Patio)", "Material (Wood/Steel/Fiberglass)", "Jamb Size"]
  },
  "Water Heater": {
    desc: "Traditional or tankless hot water solutions.",
    details: ["Fuel source (Gas/Electric)", "Type (Tank/Tankless)", "Capacity (Gallons/GPM)", "Location"]
  },
  "HVAC/Heat Pump": {
    desc: "Heating and cooling system.",
    details: ["Tonnage", "SEER2 Rating", "Furnace Efficiency %", "Existing Ductwork Condition"]
  },
  "Solar": {
    desc: "PV Solar system.",
    details: ["System Size (kW)", "Panel Count", "Inverter Type (Micro/String)", "Battery Backup Needed?"]
  },
  "Batteries": {
    desc: "Energy storage.",
    details: ["Capacity (kWh)", "Whole Home vs Critical Load", "Mounting Location"]
  },
  "Generators": {
    desc: "Backup power generation.",
    details: ["Fuel (Propane/Natural Gas)", "kW Rating", "Transfer Switch Type", "Pad Required?"]
  },
  "Car chargers": {
    desc: "EV charging stations.",
    details: ["Charger Level (1 or 2)", "Amperage (30-60A)", "Distance to Panel (ft)"]
  }
};

// View modes
const ViewMode = {
  DASHBOARD: 'DASHBOARD',
  SUMMARY: 'SUMMARY',
  DETAILED: 'DETAILED',
  SPECS: 'SPECS'
};

// Project statuses
const ProjectStatus = {
  QUOTING: 'QUOTING',
  PROPOSED: 'PROPOSED',
  IN_PROGRESS: 'IN_PROGRESS'
};

// Meta Modal Component
function MetaModal({ isOpen, onClose, onSave, initialData, title }) {
  const [formData, setFormData] = useState({
    clientName: initialData?.clientName || '',
    phoneNumber: initialData?.phoneNumber || '',
    address1: initialData?.siteAddress?.address1 || '',
    address2: initialData?.siteAddress?.address2 || '',
    city: initialData?.siteAddress?.city || '',
    state: initialData?.siteAddress?.state || 'TX',
    zip: initialData?.siteAddress?.zip || '',
  });

  useEffect(() => {
    setFormData({
      clientName: initialData?.clientName || '',
      phoneNumber: initialData?.phoneNumber || '',
      address1: initialData?.siteAddress?.address1 || '',
      address2: initialData?.siteAddress?.address2 || '',
      city: initialData?.siteAddress?.city || '',
      state: initialData?.siteAddress?.state || 'TX',
      zip: initialData?.siteAddress?.zip || '',
    });
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" data-testid="close-modal-btn">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Client Name</label>
              <input
                required
                data-testid="client-name-input"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
              <input
                data-testid="phone-input"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                placeholder="512-000-0000"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address Line 1</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                value={formData.address1}
                onChange={e => setFormData({ ...formData, address1: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address Line 2</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                value={formData.address2}
                onChange={e => setFormData({ ...formData, address2: e.target.value })}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City</label>
              <input
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="col-span-1 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State</label>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Zip</label>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                  value={formData.zip}
                  onChange={e => setFormData({ ...formData, zip: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="save-project-btn"
              className="flex-1 py-4 bg-[#002a4d] text-white font-bold rounded-xl hover:bg-[#003d70] transition-all shadow-lg"
            >
              Save Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const configs = {
    [ProjectStatus.QUOTING]: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Quoting' },
    [ProjectStatus.PROPOSED]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Proposed' },
    [ProjectStatus.IN_PROGRESS]: { bg: 'bg-green-100', text: 'text-green-700', label: 'In Progress' },
  };
  const config = configs[status] || configs[ProjectStatus.QUOTING];
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// Dashboard View Component
function DashboardView({ projects, onSelectProject, onCreateProject }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  const stats = useMemo(() => ({
    quoting: projects.filter(p => p.status === ProjectStatus.QUOTING).length,
    proposed: projects.filter(p => p.status === ProjectStatus.PROPOSED).length,
    inProgress: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
  }), [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter ? p.status === activeFilter : true;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchQuery, activeFilter]);

  const calculateTotal = (p) => {
    return Object.values(p.bids || {}).reduce((sum, bid) => sum + (bid.selected ? bid.estCost : 0), 0);
  };

  const countSelectedServices = (p) => {
    return Object.values(p.bids || {}).filter(bid => bid.selected).length;
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-12" data-testid="dashboard-view">
      <div className="mb-12">
        <h2 className="text-4xl font-extrabold text-[#002a4d] tracking-tight mb-2">Projects Dashboard</h2>
        <p className="text-slate-500 text-lg">Manage all active bids and project lifecycle stages.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button
          onClick={() => setActiveFilter(activeFilter === ProjectStatus.QUOTING ? null : ProjectStatus.QUOTING)}
          data-testid="filter-quoting-btn"
          className={`p-8 rounded-2xl border transition-all text-left group ${
            activeFilter === ProjectStatus.QUOTING
              ? 'bg-[#f39200] border-[#f39200] text-white shadow-xl'
              : 'bg-white border-slate-200 hover:border-[#f39200] hover:shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-black uppercase tracking-widest ${activeFilter === ProjectStatus.QUOTING ? 'text-white/80' : 'text-slate-400 group-hover:text-[#f39200]'}`}>Quotes in Process</span>
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div className="text-4xl font-black">{stats.quoting}</div>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === ProjectStatus.PROPOSED ? null : ProjectStatus.PROPOSED)}
          data-testid="filter-proposed-btn"
          className={`p-8 rounded-2xl border transition-all text-left group ${
            activeFilter === ProjectStatus.PROPOSED
              ? 'bg-[#0062ab] border-[#0062ab] text-white shadow-xl'
              : 'bg-white border-slate-200 hover:border-[#0062ab] hover:shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-black uppercase tracking-widest ${activeFilter === ProjectStatus.PROPOSED ? 'text-white/80' : 'text-slate-400 group-hover:text-[#0062ab]'}`}>Total Proposed</span>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
          <div className="text-4xl font-black">{stats.proposed}</div>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === ProjectStatus.IN_PROGRESS ? null : ProjectStatus.IN_PROGRESS)}
          data-testid="filter-in-progress-btn"
          className={`p-8 rounded-2xl border transition-all text-left group ${
            activeFilter === ProjectStatus.IN_PROGRESS
              ? 'bg-[#002a4d] border-[#002a4d] text-white shadow-xl'
              : 'bg-white border-slate-200 hover:border-[#002a4d] hover:shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-black uppercase tracking-widest ${activeFilter === ProjectStatus.IN_PROGRESS ? 'text-white/80' : 'text-slate-400 group-hover:text-[#002a4d]'}`}>In Progress</span>
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <div className="text-4xl font-black">{stats.inProgress}</div>
        </button>
      </div>

      {/* Actions & Search */}
      <div className="flex flex-col lg:flex-row items-center gap-6 mb-8">
        <div className="relative flex-1 w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
          <input
            type="text"
            placeholder="Search by client name..."
            data-testid="search-input"
            className="w-full bg-white border-none rounded-2xl py-5 pl-14 pr-6 text-lg shadow-sm focus:ring-2 focus:ring-[#0062ab] placeholder-slate-400 text-[#002a4d] font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={onCreateProject}
          data-testid="create-project-btn"
          className="w-full lg:w-auto px-8 py-5 bg-[#002a4d] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-[#001a33] transition-all transform active:scale-95 whitespace-nowrap"
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
              <th className="px-8 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-widest"># of Services</th>
              <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Bid Value</th>
              <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.length > 0 ? filteredProjects.map((p) => (
              <tr key={p.project_id} className="hover:bg-slate-50 transition-colors group" data-testid={`project-row-${p.project_id}`}>
                <td
                  className="px-8 py-6 whitespace-nowrap cursor-pointer"
                  onClick={() => onSelectProject(p.project_id)}
                >
                  <span className="text-lg font-bold text-[#002a4d] group-hover:text-[#0062ab] transition-colors">
                    {p.clientName || 'Unnamed Client'}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-slate-500 font-medium">
                  {new Date(p.projectDate).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-center">
                  <span className="inline-flex items-center justify-center bg-slate-100 text-[#002a4d] font-black w-8 h-8 rounded-full text-sm">
                    {countSelectedServices(p)}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <span className="text-lg font-black text-[#0062ab]">
                    ${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(calculateTotal(p))}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <button
                    onClick={() => onSelectProject(p.project_id)}
                    data-testid={`view-project-${p.project_id}`}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-[#002a4d] text-sm font-bold hover:bg-[#0062ab] hover:text-white transition-all inline-flex items-center gap-2"
                  >
                    View / Edit <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <i className="fa-solid fa-folder-open text-slate-200 text-6xl mb-4"></i>
                    <p className="text-slate-400 text-lg font-medium">No projects found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Summary View Component
function SummaryView({ project, updateBid }) {
  const totalCost = Object.values(project.bids || {})
    .filter(b => b.selected)
    .reduce((sum, b) => sum + b.estCost, 0);

  return (
    <div className="space-y-8 animate-fadeIn" data-testid="summary-view">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Summary Bid Sheet</h2>
          <p className="text-slate-500 text-base">Review energy efficiency items and finalize the proposal value.</p>
        </div>
        <div className="text-left md:text-right bg-slate-50 p-6 rounded-xl border border-slate-100 min-w-[240px]">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Bid Value</p>
          <p className="text-4xl font-black text-[#0062ab]" data-testid="total-bid-value">
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
                const bid = project.bids?.[serviceName] || { selected: false, estCost: 0 };
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
}

// Detail View Component
function DetailView({ project, updateBid }) {
  const [selectedService, setSelectedService] = useState(Object.keys(SERVICES_DB)[0]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const bid = project.bids?.[selectedService] || { selected: false, estCost: 0, details: {}, notes: '', aiRecommendations: '' };
  const info = SERVICES_DB[selectedService];

  const selectedBids = Object.values(project.bids || {}).filter(b => b.selected);
  const subtotal = selectedBids.reduce((sum, b) => sum + b.estCost, 0);

  const handleAiClick = async () => {
    if (!bid.notes?.trim()) {
      alert("Please enter some site conditions or notes first.");
      return;
    }

    setIsAiLoading(true);
    try {
      const otherSelected = selectedBids.map(b => b.serviceName);
      const response = await api.getAiRecommendations(selectedService, bid.notes, otherSelected);
      updateBid(selectedService, { aiRecommendations: response.recommendations });
    } catch (error) {
      console.error('AI Error:', error);
      alert('Failed to generate recommendations. Please try again.');
    }
    setIsAiLoading(false);
  };

  const handleDetailChange = (field, value) => {
    updateBid(selectedService, {
      details: { ...bid.details, [field]: value }
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20" data-testid="detail-view">
      {/* Header Selector */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-base font-bold text-[#002a4d] mb-3">Select Item to Configure</label>
        <select
          className="w-full md:w-1/2 lg:w-1/3 rounded-xl border-none bg-[#002a4d] text-white shadow-sm focus:ring-2 focus:ring-[#0062ab] text-base py-3 px-4"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          data-testid="service-selector"
        >
          {Object.keys(SERVICES_DB).map(s => (
            <option key={s} value={s} className="bg-[#002a4d] text-white">{s} {project.bids?.[s]?.selected ? '✅' : ''}</option>
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
                data-testid="add-to-bid-checkbox"
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
                      value={bid.details?.[field] || ""}
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
                      value={bid.details?.[field] || ""}
                      onChange={(e) => handleDetailChange(field, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      className="w-full rounded-xl border-none bg-[#002a4d] text-white text-base focus:ring-2 focus:ring-[#0062ab] py-3 px-4"
                      placeholder="Enter details..."
                      value={bid.details?.[field] || ""}
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
                data-testid="est-cost-input"
              />
            </div>
          </div>
        </div>

        {/* AI Analysis Column */}
        <div className="space-y-8">
          {/* Site Considerations */}
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-[#002a4d] flex items-center gap-3 mb-6">
              <i className="fa-solid fa-microchip text-[#f39200]"></i>
              Site Considerations
            </h3>
            <p className="text-base text-slate-500 mb-5 leading-relaxed">Note site conditions or client requests. The AI will analyze <strong>Price Impacts</strong> and <strong>Project Sequencing</strong>.</p>
            <textarea
              className="w-full h-48 rounded-2xl border-none bg-[#002a4d] text-white text-base focus:ring-2 focus:ring-[#0062ab] mb-6 p-6 shadow-inner leading-relaxed placeholder-slate-400"
              placeholder="e.g., Client wants solar screens on south-facing windows only; Attic access is narrow; Roof is 15 years old..."
              value={bid.notes || ''}
              onChange={(e) => updateBid(selectedService, { notes: e.target.value })}
              data-testid="site-notes-textarea"
            ></textarea>

            <button
              onClick={handleAiClick}
              disabled={isAiLoading}
              data-testid="generate-ai-btn"
              className={`w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-3 transition-all shadow-lg ${
                isAiLoading ? 'bg-slate-400' : 'bg-gradient-to-r from-[#0062ab] to-[#004a82] hover:opacity-95 active:scale-[0.98]'
              }`}
            >
              {isAiLoading ? (
                <>
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Consulting AI...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Generate Pro Recommendations
                </>
              )}
            </button>
          </div>

          {/* AI Recommendations */}
          {bid.aiRecommendations && (
            <div className="bg-[#002a4d] text-white p-10 rounded-2xl shadow-2xl border border-slate-800 animate-slideUp" data-testid="ai-recommendations">
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

          {/* Services Summary */}
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4">
              <h3 className="text-xl font-bold text-[#002a4d] flex items-center gap-3">
                <i className="fa-solid fa-receipt text-[#0062ab]"></i>
                Services in this Bid
              </h3>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Bid Subtotal</span>
                <span className="text-xl font-black text-[#0062ab]" data-testid="bid-subtotal">
                  ${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(subtotal)}
                </span>
              </div>
            </div>

            {selectedBids.length > 0 ? (
              <div className="space-y-3">
                {selectedBids.map((b) => (
                  <div
                    key={b.serviceName}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedService === b.serviceName
                        ? 'bg-orange-50 border-[#f39200] ring-1 ring-[#f39200]'
                        : 'bg-slate-50 border-slate-100 hover:border-[#0062ab]'
                    }`}
                    onClick={() => setSelectedService(b.serviceName)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm transition-colors ${
                        selectedService === b.serviceName ? 'bg-[#f39200] text-white' : 'bg-[#0062ab] text-white'
                      }`}>
                        <i className="fa-solid fa-check text-[9px]"></i>
                      </div>
                      <span className={`text-sm font-bold truncate ${
                        selectedService === b.serviceName ? 'text-[#002a4d]' : 'text-slate-700'
                      }`}>
                        {b.serviceName}
                      </span>
                    </div>
                    <div className="text-right pl-3">
                      <span className="text-sm font-black text-[#0062ab]">
                        ${new Intl.NumberFormat().format(b.estCost)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <i className="fa-solid fa-cart-plus text-slate-300 text-3xl mb-3"></i>
                <p className="text-slate-400 font-bold text-sm">No services added to bid.</p>
                <p className="text-slate-400 text-xs mt-1">Check "Add to Bid" on a service.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Specs Table View Component
function SpecsTableView({ project }) {
  return (
    <div className="space-y-8 animate-fadeIn" data-testid="specs-view">
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
                const bid = project.bids?.[serviceName] || { selected: false, estCost: 0, details: {} };

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
                      <span className={`text-sm ${bid.details?.[field] ? 'text-slate-900 font-bold' : 'text-slate-400 italic'}`}>
                        {bid.details?.[field] || 'Not specified'}
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
}

// Main Dashboard Component
function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(ViewMode.DASHBOARD);
  const [logoError, setLogoError] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaModalMode, setMetaModalMode] = useState('edit');
  const [isLoading, setIsLoading] = useState(true);

  const activeProject = projects.find(p => p.project_id === activeProjectId);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
      setIsLoading(false);
    };
    loadProjects();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateBid = async (serviceName, updates) => {
    if (!activeProjectId) return;

    // Optimistic update
    setProjects(prev => prev.map(proj => {
      if (proj.project_id === activeProjectId) {
        return {
          ...proj,
          bids: {
            ...proj.bids,
            [serviceName]: { ...proj.bids[serviceName], ...updates }
          }
        };
      }
      return proj;
    }));

    // Persist to backend
    try {
      await api.updateBid(activeProjectId, serviceName, updates);
    } catch (error) {
      console.error('Failed to update bid:', error);
    }
  };

  const updateProjectMeta = async (updates) => {
    if (!activeProjectId) return;

    // Optimistic update
    setProjects(prev => prev.map(proj => {
      if (proj.project_id === activeProjectId) {
        return { ...proj, ...updates };
      }
      return proj;
    }));

    // Persist to backend
    try {
      await api.updateProject(activeProjectId, updates);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const startNewProject = () => {
    setMetaModalMode('create');
    setIsMetaModalOpen(true);
  };

  const finalizeCreateProject = async (data) => {
    try {
      const newProject = await api.createProject(data);
      setProjects(prev => [...prev, newProject]);
      setActiveProjectId(newProject.project_id);
      setViewMode(ViewMode.DETAILED);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const selectProject = (id) => {
    setActiveProjectId(id);
    setViewMode(ViewMode.DETAILED);
  };

  const exportToNetSuite = () => {
    if (!activeProject) return;

    const selectedBids = Object.values(activeProject.bids || {}).filter(b => b.selected);
    if (selectedBids.length === 0) {
      alert("No items selected for export. Please select items in the bid sheet first.");
      return;
    }

    const headers = ["External ID", "Transaction Date", "Entity (Client)", "Item Name", "Line Description", "Amount", "Line Memo", "Status"];
    const rows = selectedBids.map(bid => {
      const detailsStr = Object.entries(bid.details || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');

      return [
        activeProject.project_id,
        activeProject.projectDate,
        `"${activeProject.clientName.replace(/"/g, '""')}"`,
        `"${bid.serviceName.replace(/"/g, '""')}"`,
        `"${detailsStr.replace(/"/g, '""')}"`,
        bid.estCost,
        `"${(bid.notes || '').replace(/"/g, '""')}"`,
        activeProject.status
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `NetSuite_Export_${activeProject.clientName.replace(/\s+/g, '_')}_${activeProject.project_id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#002a4d] border-t-[#f39200] rounded-full animate-spin"></div>
          <p className="text-[#002a4d] font-semibold">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-700 bg-slate-50" data-testid="main-dashboard">
      <MetaModal
        isOpen={isMetaModalOpen}
        title={metaModalMode === 'create' ? 'Create New Project' : 'Edit Site Information'}
        initialData={metaModalMode === 'edit' ? activeProject : {}}
        onClose={() => setIsMetaModalOpen(false)}
        onSave={metaModalMode === 'create' ? finalizeCreateProject : updateProjectMeta}
      />

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#002a4d] text-white flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="mb-8">
            <div className="bg-white p-4 rounded-xl shadow-inner mb-6 flex items-center justify-center min-h-[140px] overflow-hidden">
              {!logoError ? (
                <img
                  src="https://customer-assets.emergentagent.com/job_9fbf2265-5557-4615-8f17-99f8d47f3a31/artifacts/l593hr9h_LSES_logo.png"
                  alt="Longhorn Solar"
                  className="max-w-full max-h-32 object-contain"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex flex-col items-center text-center">
                  <svg className="w-10 h-10 text-[#0062ab]" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="12" y="4" width="2" height="2" />
                    <rect x="14" y="4" width="2" height="2" />
                    <rect x="12" y="6" width="6" height="2" />
                    <rect x="10" y="8" width="8" height="2" />
                    <rect x="8" y="10" width="10" height="2" />
                    <rect x="6" y="12" width="10" height="2" />
                    <rect x="6" y="14" width="6" height="2" />
                    <rect x="8" y="16" width="4" height="2" />
                    <rect x="10" y="18" width="2" height="2" />
                  </svg>
                  <div className="text-[#002a4d] font-black text-xl tracking-tight leading-none uppercase">Longhorn</div>
                  <div className="text-[#f39200] font-bold text-[10px] tracking-[0.3em] uppercase mt-0.5">Solar</div>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase">Energy Efficiency</h1>
              <h1 className="text-2xl font-black tracking-tight text-[#f39200] uppercase -mt-1">Estimator</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Project Management Portal</p>
            </div>
          </div>

          <nav className="space-y-3">
            <button
              onClick={() => setViewMode(ViewMode.DASHBOARD)}
              data-testid="nav-dashboard"
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all ${
                viewMode === ViewMode.DASHBOARD ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <i className="fa-solid fa-house"></i>
              Project Dashboard
            </button>
            <div className="h-px bg-slate-700 my-4 opacity-50"></div>
            {activeProjectId ? (
              <>
                <button
                  onClick={() => setViewMode(ViewMode.DETAILED)}
                  data-testid="nav-detailed"
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all ${
                    viewMode === ViewMode.DETAILED ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-file-invoice"></i>
                  Detailed Config
                </button>
                <button
                  onClick={() => setViewMode(ViewMode.SUMMARY)}
                  data-testid="nav-summary"
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all ${
                    viewMode === ViewMode.SUMMARY ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-list-check"></i>
                  Summary Bid Sheet
                </button>
                <button
                  onClick={() => setViewMode(ViewMode.SPECS)}
                  data-testid="nav-specs"
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all ${
                    viewMode === ViewMode.SPECS ? 'bg-[#f39200] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-table"></i>
                  Technical Specs
                </button>
              </>
            ) : (
              <div className="px-5 py-4 text-sm text-slate-500 italic">
                Select or create a project to access estimation tools.
              </div>
            )}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <img
              src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=f39200&color=fff`}
              alt={user?.name}
              className="w-12 h-12 rounded-full border-2 border-[#f39200]"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate" data-testid="user-name">{user?.name}</p>
              <button
                onClick={handleLogout}
                data-testid="logout-btn"
                className="text-xs text-[#f39200] font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>

          {activeProject && (
            <div className="bg-slate-800 rounded-xl p-5 mb-4">
              <p className="text-xs text-slate-500 uppercase font-bold mb-3 tracking-wider">Project Status</p>
              <div className="space-y-4">
                <select
                  className="w-full bg-slate-700 border-none rounded-lg text-sm py-3 focus:ring-1 focus:ring-[#f39200] text-white"
                  value={activeProject.status}
                  onChange={(e) => updateProjectMeta({ status: e.target.value })}
                  data-testid="status-selector"
                >
                  <option value={ProjectStatus.QUOTING}>In Quoting</option>
                  <option value={ProjectStatus.PROPOSED}>Proposed</option>
                  <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
                </select>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 text-center">v2.5.0 · Longhorn Solar Edition</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 relative p-6 md:p-12">
        {viewMode === ViewMode.DASHBOARD ? (
          <DashboardView
            projects={projects}
            onSelectProject={selectProject}
            onCreateProject={startNewProject}
          />
        ) : activeProject ? (
          <>
            <header className="mb-12">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <button onClick={() => setViewMode(ViewMode.DASHBOARD)} className="text-[#0062ab] hover:underline font-bold text-sm">Dashboard</button>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-400 font-medium text-sm">Project Estimation</span>
                  </div>
                  <h2 className="text-4xl font-extrabold text-[#002a4d] tracking-tight" data-testid="project-title">
                    {activeProject.clientName || 'Untitled Project'}
                  </h2>
                  <div className="mt-3 flex flex-col md:flex-row md:items-center gap-x-6 gap-y-2 text-slate-500">
                    {activeProject.siteAddress?.address1 ? (
                      <div className="flex items-start gap-2 group">
                        <i className="fa-solid fa-location-dot mt-1 text-[#f39200]"></i>
                        <div>
                          <p className="font-bold text-[#002a4d] leading-none">
                            {activeProject.siteAddress.address1}{activeProject.siteAddress.address2 ? `, ${activeProject.siteAddress.address2}` : ''}
                          </p>
                          <p className="text-sm font-medium">
                            {activeProject.siteAddress.city}, {activeProject.siteAddress.state} {activeProject.siteAddress.zip}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="italic text-slate-400">No site address provided.</p>
                    )}
                    {activeProject.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-phone text-[#0062ab]"></i>
                        <p className="font-bold text-[#002a4d]">{activeProject.phoneNumber}</p>
                      </div>
                    )}
                    <button
                      onClick={() => { setMetaModalMode('edit'); setIsMetaModalOpen(true); }}
                      data-testid="edit-site-info-btn"
                      className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0062ab] hover:bg-slate-50 transition-all shadow-sm w-fit"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit Site Info
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm font-medium mt-4">
                    Created: {new Date(activeProject.projectDate).toLocaleDateString()} · Status: <span className="capitalize">{activeProject.status.toLowerCase().replace('_', ' ')}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  <button
                    onClick={exportToNetSuite}
                    data-testid="export-netsuite-btn"
                    className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-[#2a6db0] text-white text-base font-bold shadow-md hover:bg-[#1e4f80] flex items-center justify-center gap-2 transition-all"
                  >
                    <i className="fa-solid fa-file-csv text-white"></i> Export for NetSuite
                  </button>
                  <button className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-[#002a4d] text-white text-base font-bold shadow-lg hover:bg-[#001a33] flex items-center justify-center gap-2 transition-all">
                    <i className="fa-solid fa-floppy-disk text-[#f39200]"></i> Save Bid
                  </button>
                </div>
              </div>
            </header>

            <div className="max-w-7xl mx-auto">
              {viewMode === ViewMode.SUMMARY && (
                <SummaryView project={activeProject} updateBid={updateBid} />
              )}
              {viewMode === ViewMode.DETAILED && (
                <DetailView project={activeProject} updateBid={updateBid} />
              )}
              {viewMode === ViewMode.SPECS && (
                <SpecsTableView project={activeProject} />
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default Dashboard;
