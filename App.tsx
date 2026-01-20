
import React, { useState } from 'react';
import { SERVICES_DB, MOCK_PROJECTS } from './constants';
import { ProjectState, BidItem, ViewMode, ProjectStatus, User } from './types';
import SummaryView from './components/SummaryView';
import DetailView from './components/DetailView';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import SpecsTableView from './components/SpecsTableView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [logoError, setLogoError] = useState(false);
  const [allProjects, setAllProjects] = useState<ProjectState[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

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

  const createNewProject = () => {
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
      clientName: '',
      projectDate: new Date().toISOString().split('T')[0],
      status: ProjectStatus.QUOTING
    };
    setAllProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setViewMode(ViewMode.SUMMARY);
  };

  const selectProject = (id: string) => {
    setActiveProjectId(id);
    setViewMode(ViewMode.SUMMARY);
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
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#002a4d] text-white flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="mb-8">
            <div className="bg-white p-3 rounded-xl shadow-inner mb-6 flex items-center justify-center min-h-[90px] overflow-hidden">
              {!logoError ? (
                <img 
                  src="https://longhornsolar.com/wp-content/uploads/2021/04/Longhorn-Solar-Logo-Horizontal-1.png" 
                  alt="Longhorn Solar" 
                  className="max-w-full max-h-16 object-contain p-1"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex flex-col items-center">
                   <div className="text-[#0062ab] font-black text-xl tracking-tighter">LONGHORN</div>
                   <div className="text-[#f39200] font-bold text-sm tracking-[0.2em] -mt-1 uppercase">SOLAR</div>
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
                  onClick={() => setViewMode(ViewMode.SUMMARY)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-all ${
                    viewMode === ViewMode.SUMMARY ? 'bg-[#0062ab] text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-list-check"></i>
                  Summary Bid Sheet
                </button>
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
              <p className="text-xs text-slate-500 uppercase font-bold mb-3 tracking-wider">Active Project</p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Client Name"
                  className="w-full bg-slate-700 border-none rounded-lg text-sm py-3 focus:ring-1 focus:ring-[#f39200] placeholder-slate-500 text-white"
                  value={activeProject.clientName}
                  onChange={(e) => updateActiveProjectMeta({ clientName: e.target.value })}
                />
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
          <p className="text-xs text-slate-500 text-center">v2.3.0 · Longhorn Solar Edition</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 relative p-6 md:p-12">
        {viewMode === ViewMode.DASHBOARD ? (
          <DashboardView 
            projects={allProjects} 
            onSelectProject={selectProject} 
            onCreateProject={createNewProject}
          />
        ) : activeProject ? (
          <>
            <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                    <button onClick={() => setViewMode(ViewMode.DASHBOARD)} className="text-[#0062ab] hover:underline font-bold text-sm">Dashboard</button>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-400 font-medium text-sm">Project Estimation</span>
                </div>
                <h2 className="text-4xl font-extrabold text-[#002a4d] tracking-tight">
                    {activeProject.clientName || 'Untitled Project'}
                </h2>
                <p className="text-slate-500 text-lg font-medium mt-1">
                  Project Date: {new Date(activeProject.projectDate).toLocaleDateString()} · Status: <span className="capitalize">{activeProject.status.toLowerCase().replace('_', ' ')}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <button 
                  onClick={exportToNetSuite}
                  className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-[#2a6db0] text-white text-base font-bold shadow-md hover:bg-[#1e4f80] flex items-center justify-center gap-2 transition-all"
                >
                  <i className="fa-solid fa-file-csv text-white"></i> Export for NetSuite
                </button>
                <button className="flex-1 lg:flex-none px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-base font-bold shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                  <i className="fa-solid fa-download text-[#0062ab]"></i> Export PDF
                </button>
                <button className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-[#002a4d] text-white text-base font-bold shadow-lg hover:bg-[#001a33] flex items-center justify-center gap-2 transition-all">
                  <i className="fa-solid fa-floppy-disk text-[#f39200]"></i> Save Bid
                </button>
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
