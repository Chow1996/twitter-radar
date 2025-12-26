import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  LayoutGrid, UserPlus, Settings, LogOut, Search, Plus, Trash2, 
  Activity, Globe, Lock, ChevronRight, Menu, X, Loader2, LogIn, 
  FileText, ArrowLeft, Clock, CheckCircle, List, Bell
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 加载 Lists
  useEffect(() => {
    fetchLists();
  }, [user]);

  const fetchLists = async () => {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLists(data);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('home');
  };

  const handleListClick = (list) => {
    setSelectedList(list);
    setCurrentPage('list_detail');
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-gray-200 font-mono overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col h-full overflow-hidden">
        <Header 
          user={user}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            {currentPage === 'home' && (
              <HomePage 
                lists={lists}
                user={user}
                onListClick={handleListClick}
                onLogin={handleGoogleLogin}
              />
            )}
            {currentPage === 'list_detail' && selectedList && (
              <ListDetail 
                list={selectedList}
                onBack={() => setCurrentPage('home')}
                user={user}
              />
            )}
            {currentPage === 'settings' && <SettingsPage user={user} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// === Header ===
function Header({ user, onLogin, onLogout, onOpenMenu }) {
  return (
    <header className="h-16 border-b border-[#222] bg-[#050505]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
      <button onClick={onOpenMenu} className="md:hidden text-gray-400 hover:text-white">
        <Menu size={20} />
      </button>
      
      <div className="flex-1" />
      
      {user ? (
        <div className="flex items-center gap-3 bg-[#111] border border-[#222] pl-3 pr-1 py-1">
          <div className="text-right">
            <div className="text-xs font-bold text-white">{user.email?.split('@')[0]}</div>
            <div className="text-[10px] text-green-500">LOGGED IN</div>
          </div>
          <button onClick={onLogout} className="h-7 w-7 bg-[#1A1A1A] flex items-center justify-center hover:bg-red-900/50 hover:text-red-500">
            <LogOut size={12} />
          </button>
        </div>
      ) : (
        <button onClick={onLogin} className="flex items-center gap-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-5 py-2">
          <LogIn size={14} /> LOGIN WITH GOOGLE
        </button>
      )}
    </header>
  );
}

// === Sidebar ===
function Sidebar({ currentPage, setCurrentPage, user, onLogout, isOpen, onClose }) {
  const menuItems = [
    { id: 'home', label: 'DASHBOARD', icon: LayoutGrid },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-[240px] bg-[#080808] border-r border-[#222] flex flex-col transition-transform duration-300
      md:translate-x-0 md:static ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-20 flex items-center px-6 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#111] border border-[#333] flex items-center justify-center">
            <Activity className="w-4 h-4 text-red-500" />
          </div>
          <span className="font-bold tracking-widest text-xl text-white">RADAR</span>
        </div>
        <button onClick={onClose} className="md:hidden ml-auto text-gray-500">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setCurrentPage(item.id); onClose(); }}
            className={`w-full flex items-center gap-3 px-6 py-4 text-xs font-bold tracking-widest border-l-2 ${
              currentPage === item.id
                ? 'text-white bg-red-500/5 border-red-500'
                : 'text-gray-500 hover:text-gray-200 hover:bg-[#0A0A0A] border-transparent'
            }`}
          >
            <item.icon size={16} className={currentPage === item.id ? 'text-red-500' : 'text-gray-600'} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#222]">
        <div className="text-[9px] text-gray-700 text-center tracking-widest">v2.0.0</div>
      </div>
    </aside>
  );
}

// === HomePage ===
function HomePage({ lists, user, onListClick, onLogin }) {
  return (
    <div className="animate-in space-y-8">
      <div className="border border-[#222] bg-[#080808]">
        <div className="p-5 border-b border-[#222] bg-[#0A0A0A] flex justify-between items-center">
          <h3 className="text-sm text-gray-200 flex items-center gap-2 font-bold">
            <Globe size={14} className="text-blue-500" /> MONITORING LISTS
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[10px] text-gray-500 border-b border-[#222] bg-[#0C0C0C] uppercase">
                <th className="px-6 py-4 font-normal">LIST NAME</th>
                <th className="px-6 py-4 font-normal">TARGETS</th>
                <th className="px-6 py-4 font-normal">VISIBILITY</th>
                <th className="px-6 py-4 font-normal text-right">LAST REPORT</th>
                <th className="px-6 py-4 font-normal w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151515]">
              {lists.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-600">
                    NO LISTS FOUND
                  </td>
                </tr>
              ) : (
                lists.map((list) => (
                  <tr 
                    key={list.id}
                    onClick={() => onListClick(list)}
                    className="hover:bg-[#111] cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-gray-200 font-bold">{list.name}</td>
                    <td className="px-6 py-4 text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <UserPlus size={12} /> {list.target_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {list.visibility === 'PUBLIC' ? (
                        <span className="text-[10px] text-green-500 flex items-center gap-1 bg-green-900/10 px-2 py-0.5 w-fit border border-green-900/20">
                          <Globe size={10} /> PUBLIC
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-[#151515] px-2 py-0.5 w-fit border border-[#333]">
                          <Lock size={10} /> PRIVATE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400">
                      {list.last_report_at ? new Date(list.last_report_at).toLocaleDateString() : 'PENDING...'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 group-hover:text-white">
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// === ListDetail ===
function ListDetail({ list, onBack, user }) {
  const [activeTab, setActiveTab] = useState('targets');
  const [targets, setTargets] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [list.id]);

  const loadData = async () => {
    setLoading(true);
    
    // Load targets
    const { data: listTargets } = await supabase
      .from('list_targets')
      .select('target_id, monitor_targets(*)')
      .eq('list_id', list.id);
    
    if (listTargets) {
      setTargets(listTargets.map(lt => lt.monitor_targets));
    }

    // Load reports
    const { data: reportsData } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('list_id', list.id)
      .order('report_date', { ascending: false });
    
    if (reportsData) {
      setReports(reportsData);
      if (reportsData.length > 0) setSelectedReport(reportsData[0]);
    }

    setLoading(false);
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-[#222] pb-6 gap-4">
        <div className="flex gap-4">
          <button onClick={onBack} className="h-12 w-12 flex items-center justify-center bg-[#111] border border-[#333] text-gray-400 hover:text-white hover:border-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">{list.name}</h2>
              <span className={`text-[10px] px-2 py-0.5 border ${list.visibility === 'PUBLIC' ? 'text-green-500 border-green-900/30' : 'text-gray-500 border-[#333]'}`}>
                {list.visibility}
              </span>
            </div>
            <p className="text-sm text-gray-500">{list.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex gap-0 border border-[#333] bg-[#0A0A0A]">
          <button onClick={() => setActiveTab('targets')} className={`px-6 py-2 text-xs font-bold ${activeTab === 'targets' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            TARGETS ({targets.length})
          </button>
          <button onClick={() => setActiveTab('reports')} className={`px-6 py-2 text-xs font-bold border-l border-[#333] ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            REPORTS ({reports.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Targets Tab */}
          {activeTab === 'targets' && (
            <div className="border border-[#222] bg-[#080808]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0C0C0C] text-[10px] text-gray-500 border-b border-[#222]">
                  <tr>
                    <th className="px-6 py-3 font-normal">HANDLE</th>
                    <th className="px-6 py-3 font-normal">NAME</th>
                    <th className="px-6 py-3 font-normal">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151515]">
                  {targets.map(t => (
                    <tr key={t.id} className="hover:bg-[#111]">
                      <td className="px-6 py-4 text-gray-200 font-bold">@{t.screen_name}</td>
                      <td className="px-6 py-4 text-gray-400">{t.display_name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="text-green-500 bg-green-900/10 px-2 py-0.5 text-[10px] border border-green-900/30">
                          {t.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="flex gap-0 border border-[#222] h-[600px]">
              {/* Report List */}
              <div className="w-64 bg-[#0A0A0A] border-r border-[#222] overflow-y-auto">
                <div className="p-4 border-b border-[#222] bg-[#0C0C0C]">
                  <h3 className="text-[10px] font-bold text-gray-500">HISTORY</h3>
                </div>
                <div className="divide-y divide-[#151515]">
                  {reports.map(report => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full text-left p-4 hover:bg-[#151515] border-l-2 ${
                        selectedReport?.id === report.id ? 'bg-[#111] border-red-500' : 'border-transparent'
                      }`}
                    >
                      <div className="text-xs font-bold text-gray-400">{report.report_date}</div>
                      <div className="text-[10px] text-gray-600 mt-1">{report.tweet_count || 0} tweets</div>
                    </button>
                  ))}
                  {reports.length === 0 && (
                    <div className="p-8 text-center text-gray-600 text-xs">NO REPORTS YET</div>
                  )}
                </div>
              </div>

              {/* Report Content */}
              <div className="flex-1 bg-[#080808] overflow-y-auto p-8">
                {selectedReport ? (
                  <div>
                    <div className="border-b border-[#222] pb-6 mb-6">
                      <div className="text-2xl font-bold text-white mb-2">{selectedReport.report_date}</div>
                      <div className="text-xs text-gray-500">Generated by AI • {selectedReport.tweet_count || 0} tweets analyzed</div>
                    </div>
                    <div className="prose prose-invert max-w-none text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedReport.content}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600 text-xs">
                    SELECT A REPORT TO VIEW
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// === SettingsPage ===
function SettingsPage({ user }) {
  return (
    <div className="max-w-2xl animate-in">
      <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
        <Settings size={20} className="text-red-500" /> SETTINGS
      </h2>

      <div className="border border-[#222] bg-[#0A0A0A] p-6">
        <h3 className="text-sm font-bold text-white mb-4">ACCOUNT</h3>
        {user ? (
          <div className="text-sm text-gray-400">
            <p>Email: <span className="text-white">{user.email}</span></p>
            <p className="mt-2">User ID: <span className="text-gray-600 text-xs">{user.id}</span></p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Not logged in</p>
        )}
      </div>
    </div>
  );
}
