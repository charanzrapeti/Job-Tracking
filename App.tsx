
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail,
  AlertCircle,
  CloudUpload,
  Filter,
  Layers,
  Check,
  ArrowUpDown,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { JobApplication, JobStatus, JobType, AppStats } from './types';
import StatsCard from './components/StatsCard';
import JobForm from './components/JobForm';
import ActivityGraph from './components/ActivityGraph';


const STATUS_COLORS = {
  [JobStatus.APPLIED]: '#6366f1',
  [JobStatus.REJECTED]: '#ef4444',
  [JobStatus.WATCHLIST]: '#94a3b8',
  [JobStatus.INTERVIEW]: '#f59e0b',
  [JobStatus.SUCCESS]: '#10b981',
};

const App: React.FC = () => {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | undefined>(undefined);
  
  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [graphDays, setGraphDays] = useState<number>(7);

  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ job: string, email: string } | null>(null);

  // Initial Load with Fake Delay
  useEffect(() => {
    const loadData = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      const saved = localStorage.getItem('job_applications');
      if (saved) {
        setJobs(JSON.parse(saved));
      }
      setIsInitialLoading(false);
    };
    loadData();
  }, []);

  const stats: AppStats = useMemo(() => {
    return {
      total: jobs.length,
      applied: jobs.filter(j => j.status === JobStatus.APPLIED).length,
      rejected: jobs.filter(j => j.status === JobStatus.REJECTED).length,
      interviewing: jobs.filter(j => j.status === JobStatus.INTERVIEW).length,
      success: jobs.filter(j => j.status === JobStatus.SUCCESS).length,
    };
  }, [jobs]);

  const chartData = useMemo(() => {
    return Object.values(JobStatus).map(status => ({
      name: status,
      value: jobs.filter(j => j.status === status).length,
      color: STATUS_COLORS[status]
    })).filter(d => d.value > 0);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter(j => {
      const matchSearch = j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'All' || j.status === filterStatus;
      const matchType = filterType === 'All' || j.type === filterType;
      return matchSearch && matchStatus && matchType;
    });

    return result.sort((a, b) => {
      const dateA = new Date(a.dateApplied).getTime();
      const dateB = new Date(b.dateApplied).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [jobs, searchTerm, filterStatus, filterType, sortOrder]);

  const existingResumes = useMemo(() => {
    return Array.from(new Set(jobs.map(j => j.resumeName).filter(Boolean)));
  }, [jobs]);

  const existingCoverLetters = useMemo(() => {
    return Array.from(new Set(jobs.map(j => j.coverLetterName).filter(Boolean)));
  }, [jobs]);

  const handleAddJob = (job: JobApplication) => {
    if (editingJob) {
      setJobs(prev => prev.map(j => j.id === editingJob.id ? job : j));
    } else {
      setJobs(prev => [job, ...prev]);
    }
    setIsModalOpen(false);
    setEditingJob(undefined);
    setIsDirty(true);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate cloud sync delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.setItem('job_applications', JSON.stringify(jobs));
    setIsDirty(false);
    setIsSyncing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this application entry?')) {
      setJobs(prev => prev.filter(j => j.id !== id));
      setIsDirty(true);
    }
  };

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleAIHelp = async (job: JobApplication) => {
    console.log(job.jobTitle);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Briefcase className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">JobHunt Tracker </h2>
          <p className="text-sm text-slate-400 font-medium">Fetching your career progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            JobHunt Tracker Pro
            {isDirty && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Unsynced Changes" />}
          </h1>
          <p className="text-sm md:text-base text-slate-500">Track your Job Applications Progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              isSyncing
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : isDirty 
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 shadow-sm' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-700 opacity-80'
            }`}
          >
            {isSyncing ? <Loader2 size={18} className="animate-spin" /> : (isDirty ? <CloudUpload size={18} /> : <Check size={18} />)}
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : (isDirty ? 'Sync Now' : 'Synced')}</span>
          </button>
          
          <button 
            onClick={() => { setEditingJob(undefined); setIsModalOpen(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold text-sm"
          >
            <Plus size={18} />
            <span>New Entry</span>
          </button>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard 
          label="Applications" 
          value={stats.total} 
          icon={<Briefcase className="text-indigo-600" size={20} />} 
          colorClass="bg-indigo-50"
        />
        <StatsCard 
          label="Pending" 
          value={stats.applied} 
          icon={<Clock className="text-amber-600" size={20} />} 
          colorClass="bg-amber-50"
        />
        <StatsCard 
          label="Rejected" 
          value={stats.rejected} 
          icon={<XCircle className="text-red-600" size={20} />} 
          colorClass="bg-red-50"
        />
        <StatsCard 
          label="Success" 
          value={stats.success} 
          icon={<CheckCircle className="text-emerald-600" size={20} />} 
          colorClass="bg-emerald-50"
        />
      </section>

      {/* Filters Bar */}
      <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Company, Role..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Job Type</label>
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 appearance-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Sort by Date</label>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 appearance-none font-medium"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            >
              <option value="desc">Latest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {/* Main List */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Job Details</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Versions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredJobs.length > 0 ? filteredJobs.map((job, idx) => (
                    <tr key={job.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 text-slate-300 font-bold text-xs">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{job.jobTitle}</p>
                          <p className="text-xs text-slate-400 font-medium">{job.companyName} • {job.type}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(job.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: STATUS_COLORS[job.status] + '15', color: STATUS_COLORS[job.status] }}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Layers size={10} /> {job.resumeName || 'Default'}
                          </span>
                          {job.hasCoverLetter && (
                            <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                              <Mail size={10} /> {job.coverLetterName || 'Custom'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleAIHelp(job)}
                            disabled={aiLoading === job.id}
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            {aiLoading === job.id ? <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : <Mail size={16} />}
                          </button>
                          <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg">
                            <ExternalLink size={16} />
                          </a>
                          <button onClick={() => handleEdit(job)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-lg">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(job.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <Briefcase size={48} strokeWidth={1} />
                          <p className="text-sm font-medium">No matches found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity + Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
            
            {/* Activity Graph Section (70%) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-indigo-600" size={18} />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                    Application Activity
                  </h3>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {[7, 30].map(d => (
                    <button
                      key={d}
                      onClick={() => setGraphDays(d)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        graphDays === d
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Last {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <ActivityGraph jobs={jobs} days={graphDays} />
            </div>


            {/* Status Distribution (30%) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-widest">
            Status Distribution
          </h3>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">
                No data to visualize
              </div>
            )}
          </div>
        </div>
        </div>

        
      </div>

      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto custom-scrollbar">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
            <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h2 className="text-lg font-bold text-slate-800">
                {editingJob ? 'Edit Application' : 'Track New Application'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5 md:p-6">
              <JobForm 
                initialData={editingJob} 
                onSubmit={handleAddJob} 
                onCancel={() => setIsModalOpen(false)}
                existingResumes={existingResumes}
                existingCoverLetters={existingCoverLetters}
              />
            </div>
          </div>
        </div>
      )}

      {aiResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Mail className="text-indigo-500" size={20} />
                Follow-up Draft: {aiResult.job}
              </h2>
              <button onClick={() => setAiResult(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-700 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {aiResult.email}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult.email);
                    alert('Copied to clipboard!');
                  }}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-bold transition-all text-sm shadow-lg shadow-indigo-100"
                >
                  Copy Draft
                </button>
                <button onClick={() => setAiResult(null)} className="flex-1 border border-slate-100 text-slate-500 py-3 rounded-xl hover:bg-slate-50 font-bold transition-all text-sm">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
