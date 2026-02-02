import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase, AmazonKPI } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type KPIForm = {
  metric_name: string;
  metric_value: string;
  metric_date: string;
  period: string;
  data_source: string;
};

export function Settings() {
  const { user: currentUser } = useAuth();
  const [kpis, setKpis] = useState<AmazonKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<KPIForm>({
    metric_name: '',
    metric_value: '',
    metric_date: new Date().toISOString().split('T')[0],
    period: 'daily',
    data_source: 'google_sheets',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchKPIs();
    }
  }, [currentUser]);

  const fetchKPIs = async () => {
    try {
      const { data, error: err } = await supabase
        .from('amazon_kpis')
        .select('*')
        .order('metric_date', { ascending: false });

      if (err) throw err;
      setKpis(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const metric_value =
        formData.metric_value === '' ? null : parseFloat(formData.metric_value);

      if (editingId) {
        const { error: err } = await supabase
          .from('amazon_kpis')
          .update({
            metric_name: formData.metric_name,
            metric_value,
            metric_date: formData.metric_date,
            period: formData.period,
            data_source: formData.data_source,
          })
          .eq('id', editingId);

        if (err) throw err;
        setSuccess('KPI updated successfully');
      } else {
        const { error: err } = await supabase.from('amazon_kpis').insert({
          metric_name: formData.metric_name,
          metric_value,
          metric_date: formData.metric_date,
          period: formData.period,
          data_source: formData.data_source,
        });

        if (err) throw err;
        setSuccess('KPI added successfully');
      }

      setFormData({
        metric_name: '',
        metric_value: '',
        metric_date: new Date().toISOString().split('T')[0],
        period: 'daily',
        data_source: 'google_sheets',
      });
      setEditingId(null);
      setShowForm(false);
      fetchKPIs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (kpi: AmazonKPI) => {
    setFormData({
      metric_name: kpi.metric_name,
      metric_value: kpi.metric_value?.toString() || '',
      metric_date: kpi.metric_date,
      period: kpi.period,
      data_source: kpi.data_source,
    });
    setEditingId(kpi.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this KPI?')) return;

    try {
      const { error: err } = await supabase.from('amazon_kpis').delete().eq('id', id);

      if (err) throw err;
      setSuccess('KPI deleted');
      fetchKPIs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete KPI');
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6 lg:pl-72 flex items-center justify-center min-h-screen">
        <div className="text-slate-500">You don't have permission to access settings</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 lg:pl-72 flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading KPIs...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:pl-72">
      <div className="max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">Manage Amazon KPIs and business metrics</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                metric_name: '',
                metric_value: '',
                metric_date: new Date().toISOString().split('T')[0],
                period: 'daily',
                data_source: 'google_sheets',
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add KPI
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Edit KPI' : 'Add New KPI'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Metric Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.metric_name}
                    onChange={(e) =>
                      setFormData({ ...formData, metric_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Sales Revenue, Conversion Rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Metric Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.metric_value}
                    onChange={(e) =>
                      setFormData({ ...formData, metric_value: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.metric_date}
                    onChange={(e) =>
                      setFormData({ ...formData, metric_date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data Source
                  </label>
                  <select
                    value={formData.data_source}
                    onChange={(e) =>
                      setFormData({ ...formData, data_source: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="google_sheets">Google Sheets</option>
                    <option value="amazon_api">Amazon API</option>
                    <option value="manual">Manual Entry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} KPI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Metric Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Value
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {kpis.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No KPIs found
                    </td>
                  </tr>
                ) : (
                  kpis.map((kpi) => (
                    <tr key={kpi.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-slate-900">{kpi.metric_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {kpi.metric_value?.toFixed(2) || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(kpi.metric_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-600">
                        {kpi.period}
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-600">
                        {kpi.data_source}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(kpi)}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(kpi.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
