
import React, { useState } from 'react';
import { SERVICES_DB, MOCK_PROJECTS, DEFAULT_ADDRESS } from './constants';
import { ProjectState, BidItem, ViewMode, ProjectStatus, User, SiteAddress } from './types';
import SummaryView from './components/SummaryView';
import DetailView from './components/DetailView';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import SpecsTableView from './components/SpecsTableView';

interface MetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProjectState>) => void;
  initialData?: Partial<ProjectState>;
  title: string;
}

const MetaModal: React.FC<MetaModalProps> = ({ isOpen, onClose, onSave, initialData, title }) => {
  const [formData, setFormData] = useState({
    clientName: initialData?.clientName || '',
    phoneNumber: initialData?.phoneNumber || '',
    address1: initialData?.siteAddress?.address1 || '',
    address2: initialData?.siteAddress?.address2 || '',
    city: initialData?.siteAddress?.city || '',
    state: initialData?.siteAddress?.state || 'TX',
    zip: initialData?.siteAddress?.zip || '',
  });

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
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                value={formData.clientName}
                onChange={e => setFormData({...formData, clientName: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                placeholder="512-000-0000"
                value={formData.phoneNumber}
                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address Line 1</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                value={formData.address1}
                onChange={e => setFormData({...formData, address1: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address Line 2</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                value={formData.address2}
                onChange={e => setFormData({...formData, address2: e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div className="col-span-1 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Zip</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[#002a4d] font-bold focus:border-[#0062ab] outline-none transition-all"
                  value={formData.zip}
                  onChange={e => setFormData({...formData, zip: e.target.value})}
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
              className="flex-1 py-4 bg-[#002a4d] text-white font-bold rounded-xl hover:bg-[#003d70] transition-all shadow-lg"
            >
              Save Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [logoError, setLogoError] = useState(false);
  const [allProjects, setAllProjects] = useState<ProjectState[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaModalMode, setMetaModalMode] = useState<'edit' | 'create'>('edit');

  const activeProject = allProjects.find(p => p.id === activeProjectId);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveProjectId(null);
    setViewMode(ViewMode.DASHBOARD);
  };

  const updateActiveProjectBid = (serviceName: string, updates: Partial<BidItem>) => {
    if (!activeProjectId) return;
    setAllProjects(prev => prev.map(proj => {
      if (proj.id === activeProjectId) {
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
  };

  const updateActiveProjectMeta = (updates: Partial<ProjectState>) => {
    if (!activeProjectId) return;
    setAllProjects(prev => prev.map(proj => {
      if (proj.id === activeProjectId) {
        return { ...proj, ...updates };
      }
      return proj;
    }));
  };

  const startNewProject = () => {
    setMetaModalMode('create');
    setIsMetaModalOpen(true);
  };

  const finalizeCreateProject = (data: Partial<ProjectState>) => {
    const initialBids: Record<string, BidItem> = {};
    Object.keys(SERVICES_DB).forEach(name => {
      initialBids[name] = {
        serviceName: name,
        selected: false,
        estCost: 0,
        details: {},
        notes: '',
        aiRecommendations: ''
      };
    });
    const newProj: ProjectState = {
      id: Math.random().toString(36).substr(2, 9),
      bids: initialBids,
      clientName: data.clientName || 'Unnamed Client',
      phoneNumber: data.phoneNumber || '',
      siteAddress: data.siteAddress || { ...DEFAULT_ADDRESS },
      projectDate: new Date().toISOString().split('T')[0],
      status: ProjectStatus.QUOTING
    };
    setAllProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setViewMode(ViewMode.DETAILED);
  };

  const selectProject = (id: string) => {
    setActiveProjectId(id);
    setViewMode(ViewMode.DETAILED);
  };

  const exportToNetSuite = () => {
    if (!activeProject) return;

    const selectedBids = (Object.values(activeProject.bids) as BidItem[]).filter(b => b.selected);
    if (selectedBids.length === 0) {
      alert("No items selected for export. Please select items in the bid sheet first.");
      return;
    }

    const headers = ["External ID", "Transaction Date", "Entity (Client)", "Item Name", "Line Description", "Amount", "Line Memo", "Status"];
    const rows = selectedBids.map(bid => {
      const detailsStr = Object.entries(bid.details)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
      
      return [
        activeProject.id,
        activeProject.projectDate,
        `"${activeProject.clientName.replace(/"/g, '""')}"`,
        `"${bid.serviceName.replace(/"/g, '""')}"`,
        `"${detailsStr.replace(/"/g, '""')}"`,
        bid.estCost,
        `"${bid.notes.replace(/"/g, '""')}"`,
        activeProject.status
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `NetSuite_Export_${activeProject.clientName.replace(/\s+/g, '_')}_${activeProject.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-700 bg-slate-50">
      <MetaModal 
        isOpen={isMetaModalOpen}
        title={metaModalMode === 'create' ? 'Create New Project' : 'Edit Site Information'}
        initialData={metaModalMode === 'edit' ? activeProject : {}}
        onClose={() => setIsMetaModalOpen(false)}
        onSave={metaModalMode === 'create' ? finalizeCreateProject : updateActiveProjectMeta}
      />

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#002a4d] text-white flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="mb-8">
            <div className="bg-white p-4 rounded-xl shadow-inner mb-6 flex items-center justify-center min-h-[140px] overflow-hidden">
              {!logoError ? (
                <img 
                  src="https://longhornsolar.com/wp-content/uploads/2021/04/Longhorn-Solar-Logo-Vertical-1.png" 
                  alt="Longhorn Solar" 
                  className="max-w-full max-h-32 object-contain"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex flex-col items-center text-center">
                   <div className="relative mb-1">
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
                   </div>
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
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all ${
                    viewMode === ViewMode.DETAILED ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-file-invoice"></i>
                  Detailed Config
                </button>
                <button
                  onClick={() => setViewMode(ViewMode.SUMMARY)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all ${
                    viewMode === ViewMode.SUMMARY ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-list-check"></i>
                  Summary Bid Sheet
                </button>
                <button
                  onClick={() => setViewMode(ViewMode.SPECS)}
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
              src={user.picture} 
              alt={user.name} 
              className="w-12 h-12 rounded-full border-2 border-[#f39200]" 
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <button 
                onClick={handleLogout}
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
                  onChange={(e) => updateActiveProjectMeta({ status: e.target.value as ProjectStatus })}
                >
                  <option value={ProjectStatus.QUOTING}>In Quoting</option>
                  <option value={ProjectStatus.PROPOSED}>Proposed</option>
                  <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
                </select>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 text-center">v2.4.0 · Longhorn Solar Edition</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 relative p-6 md:p-12">
        {viewMode === ViewMode.DASHBOARD ? (
          <DashboardView 
            projects={allProjects} 
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
                  <h2 className="text-4xl font-extrabold text-[#002a4d] tracking-tight">
                      {activeProject.clientName || 'Untitled Project'}
                  </h2>
                  <div className="mt-3 flex flex-col md:flex-row md:items-center gap-x-6 gap-y-2 text-slate-500">
                    {activeProject.siteAddress.address1 ? (
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
                <SummaryView project={activeProject} updateBid={updateActiveProjectBid} />
              )}
              {viewMode === ViewMode.DETAILED && (
                <DetailView project={activeProject} updateBid={updateActiveProjectBid} />
              )}
              {viewMode === ViewMode.SPECS && (
                <SpecsTableView project={activeProject} />
              )}
            </div>
          </>
        ) : null}
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default App;
