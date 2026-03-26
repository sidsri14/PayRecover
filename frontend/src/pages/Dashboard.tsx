import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Activity, ServerCrash, Clock, Trash2 } from 'lucide-react';
import { api } from '../api';
import CreateMonitorModal from '../components/CreateMonitorModal';

const Dashboard: React.FC = () => {
  const [monitors, setMonitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMonitors = async () => {
    try {
      const { data } = await api.get('/monitors');
      if (data.success) {
        setMonitors(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch monitors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this monitor?')) return;
    try {
      await api.delete(`/monitors/${id}`);
      fetchMonitors();
    } catch (err) {
      console.error('Failed to delete monitor', err);
    }
  };

  if (loading && monitors.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading monitors...</div>;
  }

  const upCount = monitors.filter(m => m.status === 'UP').length;
  const downCount = monitors.filter(m => m.status === 'DOWN').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Overview of your API health</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium flex items-center transition"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Monitor
        </button>
      </div>

      {monitors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <span className="text-slate-500 text-sm font-medium">Total Monitors</span>
            <span className="text-3xl font-bold text-slate-800 mt-2">{monitors.length}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 flex flex-col">
            <span className="text-emerald-600 text-sm font-medium flex items-center"><Activity className="w-4 h-4 mr-1" /> Healthy</span>
            <span className="text-3xl font-bold text-emerald-600 mt-2">{upCount}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col">
            <span className="text-red-500 text-sm font-medium flex items-center"><ServerCrash className="w-4 h-4 mr-1" /> Failing</span>
            <span className="text-3xl font-bold text-red-500 mt-2">{downCount}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {monitors.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Activity className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg">No monitors configured yet.</p>
            <p className="text-sm mt-1">Add your first endpoint to start tracking uptime.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {monitors.map((monitor) => (
              <li key={monitor.id} className="hover:bg-slate-50 transition">
                <Link to={`/monitors/${monitor.id}`} className="p-4 sm:px-6 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className={`w-3 h-3 rounded-full ${
                        monitor.status === 'UP' ? 'bg-emerald-500' : 
                        monitor.status === 'DOWN' ? 'bg-red-500' : 'bg-amber-400'
                      }`} title={monitor.status}></span>
                      <p className="text-sm font-semibold text-slate-900 truncate">{monitor.url}</p>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{monitor.method}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 space-x-4">
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {monitor.interval}s</span >
                      <span>Last check: {monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleTimeString() : 'Pending...'}</span>
                    </div>
                  </div>
                  
                  <button onClick={(e) => handleDelete(monitor.id, e)} className="ml-4 flex-shrink-0 text-slate-300 hover:text-red-500 transition cursor-pointer p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateMonitorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchMonitors();
        }}
      />
    </div>
  );
};

export default Dashboard;
