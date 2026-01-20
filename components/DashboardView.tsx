
import React, { useState, useMemo } from 'react';
import { ProjectState, ProjectStatus } from '../types';

interface DashboardViewProps {
  projects: ProjectState[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ projects, onSelectProject, onCreateProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | null>(null);

  const stats = useMemo(() => {
    return {
      quoting: projects.filter(p => p.status === ProjectStatus.QUOTING).length,
      proposed: projects.filter(p => p.status === ProjectStatus.PROPOSED).length,
      inProgress: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter ? p.status === activeFilter : true;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchQuery, activeFilter]);

  const calculateTotal = (p: ProjectState) => {
    return Object.values(p.bids).reduce((sum, bid) => sum + (bid.selected ? bid.estCost : 0), 0);
  };

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto pb-12">
      <div className="mb-12">
        <h2 className="text-4xl font-extrabold text-[#002a4d] tracking-tight mb-2">Projects Dashboard</h2>
        <p className="text-slate-500 text-lg">Manage all active bids and project lifecycle stages.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button 
          onClick={() => setActiveFilter(activeFilter === ProjectStatus.QUOTING ? null : ProjectStatus.QUOTING)}
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
            className="w-full bg-white border-none rounded-2xl py-5 pl-14 pr-6 text-lg shadow-sm focus:ring-2 focus:ring-[#0062ab] placeholder-slate-400 text-[#002a4d] font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={onCreateProject}
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
              <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Bid Value</th>
              <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.length > 0 ? filteredProjects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className="text-lg font-bold text-[#002a4d] group-hover:text-[#0062ab] transition-colors">{p.clientName || 'Unnamed Client'}</span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-slate-500 font-medium">
                  {new Date(p.projectDate).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <span className="text-lg font-black text-[#0062ab]">
                    ${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(calculateTotal(p))}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <button 
                    onClick={() => onSelectProject(p.id)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-[#002a4d] text-sm font-bold hover:bg-[#0062ab] hover:text-white transition-all inline-flex items-center gap-2"
                  >
                    View / Edit <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
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
};

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const configs = {
    [ProjectStatus.QUOTING]: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Quoting' },
    [ProjectStatus.PROPOSED]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Proposed' },
    [ProjectStatus.IN_PROGRESS]: { bg: 'bg-green-100', text: 'text-green-700', label: 'In Progress' },
  };
  const config = configs[status];
  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default DashboardView;
