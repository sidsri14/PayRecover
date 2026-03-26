import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Activity, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api';

const MonitorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [monitor, setMonitor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonitor = async () => {
    try {
      const { data } = await api.get(`/monitors/${id}`);
      if (data.success) {
        setMonitor(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch monitor details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitor();
    const interval = setInterval(fetchMonitor, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !monitor) return <div className="p-8 text-center">Loading details...</div>;
  if (!monitor) return <div className="p-8 text-center text-red-500">Monitor not found</div>;

  const chartData = [...(monitor.logs || [])].reverse().map((log: any) => ({
    time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    responseTime: log.responseTime || 0,
    status: log.status
  }));

  const avgResponseTime = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, log) => acc + log.responseTime, 0) / chartData.length)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center mb-4 transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 text-2xl font-bold text-slate-900 mb-1">
               <span className={`w-4 h-4 rounded-full ${
                  monitor.status === 'UP' ? 'bg-emerald-500' : 
                  monitor.status === 'DOWN' ? 'bg-red-500' : 'bg-amber-400'
                }`}></span>
              <h1>{monitor.url}</h1>
            </div>
            <div className="flex space-x-4 text-sm text-slate-500 font-medium">
              <span className="bg-slate-100 px-2 py-1 rounded">{monitor.method}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Checks every {monitor.interval}s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Current Status</div>
            <div className={`text-2xl font-bold ${monitor.status === 'UP' ? 'text-emerald-600' : monitor.status === 'DOWN' ? 'text-red-500' : 'text-amber-500'}`}>
              {monitor.status}
            </div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Avg Response (Last 50)</div>
            <div className="text-2xl font-bold text-slate-800">{avgResponseTime} <span className="text-sm font-medium text-slate-400">ms</span></div>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Checks Logged</div>
            <div className="text-2xl font-bold text-slate-800">{monitor.logs?.length || 0}</div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary-500" /> Response Time History
        </h3>
        <div className="h-72 w-full text-sm">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} unit="ms" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">Not enough data to graph yet.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Recent Logs</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {monitor.logs?.map((log: any) => (
            <li key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center space-x-4">
                {log.status === 'UP' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                <div>
                  <div className="text-sm font-bold text-slate-800">{log.statusCode || 'N/A'}</div>
                  <div className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-600">{log.responseTime ? `${log.responseTime}ms` : 'Timeout'}</div>
            </li>
          ))}
          {(!monitor.logs || monitor.logs.length === 0) && (
            <li className="p-8 text-center text-slate-400">No logs recorded yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MonitorDetails;
