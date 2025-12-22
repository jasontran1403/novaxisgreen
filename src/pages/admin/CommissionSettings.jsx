import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';

function CommissionSettings() {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct', 'compound', 'vip'
  const [directRates, setDirectRates] = useState([]);
  const [compoundRates, setCompoundRates] = useState([]);
  const [vipRates, setVipRates] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // State để quản lý giá trị input (controlled component)
  const [rateValues, setRateValues] = useState({});

  useEffect(() => {
    fetchPackages();
    fetchDirectRates();
    fetchCompoundRates();
    fetchVipRates();
  }, []);

  // Cập nhật rateValues khi directRates hoặc packages thay đổi
  useEffect(() => {
    if (packages.length > 0 && directRates.length >= 0) {
      const newRateValues = {};
      packages.forEach(pkg => {
        const pkgId = Number(pkg.id || pkg.Id);
        [1, 2, 3, 4, 5].forEach(tang => {
          const existingRate = directRates.find(
            r => Number(r.goiDauTuId) === pkgId && Number(r.tang) === tang
          );
          const key = `${pkgId}-${tang}`;
          newRateValues[key] = existingRate ? Number(existingRate.tyLe || 0) : 0;
        });
      });
      setRateValues(newRateValues);
    }
  }, [packages, directRates]);

  const fetchPackages = async () => {
    try {
      const res = await api.get('/api/investment/packages');
      if (res.success) {
        console.log('Packages loaded:', res.data);
        setPackages(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    }
  };

  const fetchDirectRates = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(API_ENDPOINTS.ADMIN.COMMISSION_DIRECT);
      if (res.success) {
        console.log('Direct rates loaded:', res.data);
        setDirectRates(res.data || []);
      } else {
        setError(res.error || 'Failed to load direct commission rates');
      }
    } catch (err) {
      console.error('Fetch direct rates error:', err);
      setError(err.message || 'Failed to load direct commission rates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompoundRates = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.COMMISSION_COMPOUND);
      if (res.success) {
        setCompoundRates(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load compound rates:', err);
    }
  };

  const fetchVipRates = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.COMMISSION_VIP);
      if (res.success) {
        setVipRates(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load VIP rates:', err);
    }
  };

  const handleUpdateDirectRate = async (goiDauTuId, tang, tyLe) => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.COMMISSION_DIRECT, {
        goiDauTuId: Number(goiDauTuId),
        tang: Number(tang),
        tyLe: Number(tyLe)
      });
      if (res.success) {
        // Refresh rates sau khi update
        await fetchDirectRates();
      } else {
        alert(res.error || 'Failed to update rate');
      }
    } catch (err) {
      console.error('Update direct rate error:', err);
      alert(err.message || 'Failed to update rate');
    }
  };

  const handleUpdateCompoundRate = async (goiDauTuId, tang, tyLe) => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.COMMISSION_COMPOUND, {
        goiDauTuId: Number(goiDauTuId),
        tang: Number(tang),
        tyLe: Number(tyLe)
      });
      if (res.success) {
        // Refresh rates sau khi update
        await fetchCompoundRates();
      } else {
        alert(res.error || 'Failed to update rate');
      }
    } catch (err) {
      console.error('Update compound rate error:', err);
      alert(err.message || 'Failed to update rate');
    }
  };

  const handleUpdateVipRate = async (id, updateData) => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.COMMISSION_VIP, {
        id,
        ...updateData
      });
      if (res.success) {
        alert('VIP commission rate updated successfully');
        fetchVipRates();
      }
    } catch (err) {
      alert(err.message || 'Failed to update VIP rate');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        <h2 className="text-xl font-semibold text-emerald-400 mb-4">Commission Settings</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-emerald-500/30">
          {['direct', 'compound', 'vip'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Commission
            </button>
          ))}
        </div>

        {/* Direct Commission */}
        {activeTab === 'direct' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Direct Commission Rates</h3>
            {loading && (
              <div className="text-center py-4 text-slate-400">Loading rates...</div>
            )}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            {!loading && packages.length === 0 && (
              <div className="text-center py-4 text-slate-400">No packages found</div>
            )}
            {packages.map((pkg) => {
              // Đảm bảo so sánh đúng kiểu dữ liệu
              const pkgId = Number(pkg.id || pkg.Id);
              // Debug: log để kiểm tra
              const packageRates = directRates.filter(r => Number(r.goiDauTuId) === pkgId);
              if (packageRates.length > 0) {
                console.log(`Package ${pkgId} (${pkg.tenGoi || pkg.name}) has rates:`, packageRates);
              }
              
              return (
                <div key={pkg.id || pkg.Id} className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-emerald-400">{pkg.tenGoi || pkg.name || pkg.TenGoi || 'Package'}</h4>
                    <span className="text-xs text-slate-400">ID: {pkgId}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5].map((tang) => {
                      const key = `${pkgId}-${tang}`;
                      const rateValue = rateValues[key] !== undefined ? rateValues[key] : 0;
                      return (
                        <div key={tang} className="flex items-center gap-2">
                          <label className="text-sm text-slate-300 w-16">Tầng {tang}:</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={rateValue}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value) || 0;
                              setRateValues(prev => ({ ...prev, [key]: newValue }));
                            }}
                            onBlur={(e) => {
                              const newRate = parseFloat(e.target.value) || 0;
                              handleUpdateDirectRate(pkgId, tang, newRate);
                            }}
                            className="flex-1 px-3 py-2 bg-slate-600 border border-emerald-500/30 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="0.00"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compound Commission */}
        {activeTab === 'compound' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Compound Commission Rates (ROI)</h3>
            {packages.map((pkg) => {
              const pkgId = Number(pkg.id || pkg.Id);
              return (
                <div key={pkg.id || pkg.Id} className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30">
                  <h4 className="text-emerald-400 mb-3">{pkg.tenGoi || pkg.name || pkg.TenGoi || 'Package'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5].map((tang) => {
                      const existingRate = compoundRates.find(
                        r => Number(r.goiDauTuId) === pkgId && Number(r.tang) === tang
                      );
                      const rateValue = existingRate ? Number(existingRate.tyLe || 0) : 0;
                      return (
                        <div key={tang} className="flex items-center gap-2">
                          <label className="text-sm text-slate-300 w-16">Tầng {tang}:</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={rateValue}
                            onChange={(e) => {
                              // Tạm thời không làm gì
                            }}
                            onBlur={(e) => {
                              const newRate = parseFloat(e.target.value) || 0;
                              if (newRate !== rateValue) {
                                handleUpdateCompoundRate(pkgId, tang, newRate);
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-slate-600 border border-emerald-500/30 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIP Commission */}
        {activeTab === 'vip' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">VIP Commission Rates</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/30 bg-slate-700/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">VIP Level</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Commission Rate (%)</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Conditions</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vipRates.map((vip) => (
                    <tr key={vip.id} className="border-b border-emerald-500/10">
                      <td className="py-3 px-4 text-sm text-emerald-400">{vip.tenCap}</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={vip.mucHoaHong || 0}
                          onBlur={(e) => {
                            handleUpdateVipRate(vip.id, {
                              mucHoaHong: parseFloat(e.target.value) || 0
                            });
                          }}
                          className="w-24 px-2 py-1 bg-slate-600 border border-emerald-500/30 rounded text-white text-sm"
                        />
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">
                        <div>Sales: {vip.dieuKienDoanhSo || 0}</div>
                        <div>F1: {vip.dieuKienCapCon || 0}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            const newSales = prompt('Enter new sales condition:', vip.dieuKienDoanhSo || 0);
                            const newF1 = prompt('Enter new F1 condition:', vip.dieuKienCapCon || 0);
                            if (newSales !== null && newF1 !== null) {
                              handleUpdateVipRate(vip.id, {
                                dieuKienDoanhSo: parseFloat(newSales) || 0,
                                dieuKienCapCon: parseInt(newF1) || 0
                              });
                            }
                          }}
                          className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded text-emerald-400 text-xs"
                        >
                          Edit Conditions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommissionSettings;

