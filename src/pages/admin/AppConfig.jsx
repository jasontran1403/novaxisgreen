import { useEffect, useState, useCallback } from "react";

const BASE_URL = "https://app.novaxisgreen.com/api/v1";
// const BASE_URL = "http://localhost:9191/api/v1";


const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error || j.message || msg; } catch { }
    throw new Error(msg);
  }
  return res.json();
};

const api = {
  get: (p) => apiFetch(p),
  post: (p, b) => apiFetch(p, { method: "POST", body: JSON.stringify(b) }),
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);
const IC = {
  cfg: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  money: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  copy: "M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-2M8 4a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2V4z",
  check: "M20 6L9 17l-5-5",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  ok: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  reload: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const short = (a) => a ? `${a.slice(0, 8)}...${a.slice(-6)}` : "—";
const fmt = (n) => parseFloat(n || 0).toLocaleString("en-US", { maximumFractionDigits: 6 });
const fmtD = (ms) => {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (v) => String(v).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// ─── UI Atoms ──────────────────────────────────────────────────────────────────
const Spin = ({ size = 16 }) => (
  <svg className="animate-spin shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Toast = ({ type, msg, onClose }) => (
  <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm
    ${type === "error" ? "bg-red-950/60 border-red-500/40 text-red-200" : "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"}`}>
    <span className="flex-1">{msg}</span>
    <button onClick={onClose} className="text-lg leading-none opacity-50 hover:opacity-100">×</button>
  </div>
);

const SecretField = ({ label, value, onChange, placeholder, err, hint }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full bg-slate-900 border rounded-xl px-3 py-2.5 pr-10 text-xs font-mono text-white
            placeholder-slate-700 focus:outline-none focus:ring-1 transition-colors
            ${err ? "border-red-500/50 focus:ring-red-500/30" : "border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-600/50"}`} />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
          <Ico d={show ? IC.eyeOff : IC.eye} size={13} />
        </button>
      </div>
      {err && <p className="text-xs text-red-400">{err}</p>}
      {hint && !err && <p className="text-xs text-slate-700">{hint}</p>}
    </div>
  );
};

const MonoField = ({ label, value, onChange, placeholder, err }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
    <input type="text" value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full bg-slate-900 border rounded-xl px-3 py-2.5 text-xs font-mono text-white
        placeholder-slate-700 focus:outline-none focus:ring-1 transition-colors
        ${err ? "border-red-500/50 focus:ring-red-500/30" : "border-slate-700 focus:ring-emerald-500/30 focus:border-emerald-600/50"}`} />
    {err && <p className="text-xs text-red-400">{err}</p>}
  </div>
);

const SearchBar = ({ value, onChange }) => (
  <div className="relative">
    <Ico d={IC.search} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder="Tìm kiếm theo wallet address..."
      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white
        placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-600/50 transition-colors"/>
    {value && <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 text-lg leading-none">×</button>}
  </div>
);

const ReloadBtn = ({ onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-400 transition-colors disabled:opacity-40">
    <Ico d={IC.reload} size={13} /><span>Tải lại</span>
  </button>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-slate-600 mt-0.5">{label}</p>
  </div>
);

const Empty = ({ icon, text, sub }) => (
  <div className="flex flex-col items-center gap-2 py-14 text-slate-700">
    <Ico d={icon} size={40} />
    <p className="text-sm font-medium text-slate-500">{text}</p>
    {sub && <p className="text-xs">{sub}</p>}
  </div>
);

const ApproveOverlay = ({ id, label }) => (
  <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl max-w-sm w-full mx-4">
      <Spin size={36} />
      <p className="text-white font-semibold text-lg">Đang xử lý {label} #{id}</p>
      <p className="text-slate-500 text-sm text-center">Vui lòng chờ, không đóng trang</p>
    </div>
  </div>
);

const TH = ({ children, right, center }) => (
  <th className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider
    ${right ? "text-right" : center ? "text-center" : "text-left"}`}>{children}</th>
);
const TD = ({ children, right, center, mono }) => (
  <td className={`px-4 py-3.5 ${right ? "text-right" : center ? "text-center" : "text-left"} ${mono ? "font-mono text-xs" : ""}`}>{children}</td>
);

// ─── Tab 1: Config ─────────────────────────────────────────────────────────────
function ConfigTab() {
  const [f, setF] = useState({ novaPrice: "", bscWallet: "", bscPrivateKey: "", ethWallet: "", ethPrivateKey: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    api.get("/config")
      .then(d => setF({ novaPrice: d.novaPrice?.toString() || "", bscWallet: d.bscWallet || "", bscPrivateKey: d.bscPrivateKey || "", ethWallet: d.ethWallet || "", ethPrivateKey: d.ethPrivateKey || "" }))
      .catch(() => setMsg({ type: "error", msg: "Không thể tải cấu hình" }))
      .finally(() => setLoading(false));
  }, []);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const copy = (v, k) => { navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(""), 2000); };

  const vAddr = v => !v || /^0x[a-fA-F0-9]{40}$/.test(v);
  const vKey = v => !v || /^(0x)?[a-fA-F0-9]{64}$/.test(v);
  const vPrice = v => !v || (parseFloat(v) > 0 && !isNaN(parseFloat(v)));
  const hasErr = !vAddr(f.bscWallet) || !vAddr(f.ethWallet) || !vKey(f.bscPrivateKey) || !vKey(f.ethPrivateKey) || !vPrice(f.novaPrice);

  const submit = async e => {
    e.preventDefault(); if (hasErr) return;
    setSaving(true); setMsg(null);
    try {
      await api.post("/config", { novaPrice: parseFloat(f.novaPrice) || 0, bscWallet: f.bscWallet.trim(), bscPrivateKey: f.bscPrivateKey.trim(), ethWallet: f.ethWallet.trim(), ethPrivateKey: f.ethPrivateKey.trim() });
      setMsg({ type: "success", msg: "Đã lưu cấu hình thành công!" });
    } catch (err) { setMsg({ type: "error", msg: err.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-slate-500 py-12"><Spin /><span className="text-sm">Đang tải...</span></div>;

  const WBlock = ({ title, accent, wk, pk }) => (
    <div className={`rounded-xl border p-5 space-y-4 ${accent}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</p>
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Địa chỉ ví</label>
        <div className="flex gap-2">
          <MonoField value={f[wk]} onChange={set(wk)} placeholder="0x..." err={!vAddr(f[wk]) && f[wk] ? "Địa chỉ không hợp lệ" : null} />
          {f[wk] && <button type="button" onClick={() => copy(f[wk], wk)}
            className="shrink-0 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 transition-colors">
            <Ico d={copied === wk ? IC.check : IC.copy} size={13} />
          </button>}
        </div>
      </div>
      <SecretField label="Private Key" value={f[pk]} onChange={set(pk)} placeholder="64 ký tự hex..."
        hint="⚠️ Tuyệt đối không chia sẻ private key" err={!vKey(f[pk]) && f[pk] ? "Private key không hợp lệ (64 hex)" : null} />
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      {msg && <Toast type={msg.type} msg={msg.msg} onClose={() => setMsg(null)} />}

      {/* Nova price */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Giá NOVA (USD)</p>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">$</span>
          <input type="number" step="0.0001" min="0" value={f.novaPrice} onChange={set("novaPrice")} placeholder="0.1000"
            className="w-full pl-7 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white
              focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-600/50 transition-colors"/>
        </div>
        {!vPrice(f.novaPrice) && f.novaPrice && <p className="text-xs text-red-400">Giá phải lớn hơn 0</p>}
      </div>

      <WBlock title="BSC / BNB Chain" accent="border-amber-500/15 bg-amber-950/10" wk="bscWallet" pk="bscPrivateKey" />
      <WBlock title="Ethereum" accent="border-blue-500/15 bg-blue-950/10" wk="ethWallet" pk="ethPrivateKey" />

      <div className="flex justify-end pt-1">
        <button type="submit" disabled={saving || hasErr}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600
            disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
          {saving ? <><Spin size={14} /> Đang lưu...</> : "Lưu cấu hình"}
        </button>
      </div>
    </form>
  );
}

// ─── Tab 2: Users ──────────────────────────────────────────────────────────────
function UsersTab() {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAll(await api.get("/customers")); }
    catch { setMsg({ type: "error", msg: "Không thể tải danh sách users" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = all.filter(u => !q || u.walletAddress?.toLowerCase().includes(q.toLowerCase()));

  const toggle = async (wallet, role) => {
    setToggling(wallet);
    const next = role === "MEMBER" ? "USER" : "MEMBER";
    try {
      await api.post("/customers/role", { walletAddress: wallet, role: next });
      setAll(p => p.map(u => u.walletAddress === wallet ? { ...u, role: next } : u));
    } catch (err) { setMsg({ type: "error", msg: err.message }); }
    finally { setToggling(null); }
  };

  return (
    <div className="space-y-4">
      {msg && <Toast type={msg.type} msg={msg.msg} onClose={() => setMsg(null)} />}
      <div className="flex gap-3">
        <div className="flex-1"><SearchBar value={q} onChange={setQ} /></div>
        <ReloadBtn onClick={load} disabled={loading} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 py-12"><Spin /><span className="text-sm">Đang tải...</span></div>
      ) : filtered.length === 0 ? (
        <Empty icon={IC.users} text="Không tìm thấy user" sub={q ? "Thử wallet address khác" : "Chưa có user nào"} />
      ) : (
        <div className="rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70">
                  <TH>Wallet Address</TH>
                  <TH>Role</TH>
                  <TH right>Thao tác</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(u => (
                  <tr key={u.walletAddress} className="hover:bg-slate-800/20 transition-colors">
                    <TD mono className="whitespace-nowrap">{u.walletAddress}</TD>
                    <TD>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border
                ${u.role === "MEMBER"
                          ? "bg-emerald-900/50 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border-slate-700/50"}`}>
                        {u.role}
                      </span>
                    </TD>
                    <TD right>
                      <button
                        onClick={() => toggle(u.walletAddress, u.role)}
                        disabled={toggling === u.walletAddress}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border
                  ${u.role === "MEMBER"
                            ? "bg-slate-800 hover:bg-red-900/30 border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-300"
                            : "bg-emerald-900/30 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-400"}
                  disabled:opacity-40 disabled:cursor-not-allowed`}>
                        {toggling === u.walletAddress
                          ? <><Spin size={11} />Đang cập nhật</>
                          : u.role === "MEMBER"
                            ? "→ USER"
                            : "→ MEMBER"}
                      </button>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 border-t border-slate-800/50 bg-slate-900/40">
            <span className="text-xs text-slate-600">
              {filtered.length} / {all.length} users
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Withdraw History ───────────────────────────────────────────────────
function WithdrawTab() {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAll(await api.get("/withdraw-history")); }
    catch { setMsg({ type: "error", msg: "Không thể tải lịch sử withdraw" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = all.filter(w => !q || w.walletAddress?.toLowerCase().includes(q.toLowerCase()));

  const approve = async (item) => {
    if (approving) return;
    setApproving(item.id); setMsg(null);
    try {
      await api.post("/stake/approve-withdraw", { withdrawId: item.id });
      setAll(p => p.map(w => w.id === item.id ? { ...w, status: "COMPLETED" } : w));
      setMsg({ type: "success", msg: `Đã approve lệnh #${item.id} thành công!` });
    } catch (err) { setMsg({ type: "error", msg: `Approve thất bại: ${err.message}` }); }
    finally { setApproving(null); }
  };

  const sBadge = (s) => {
    const m = {
      PENDING: "bg-amber-900/50 text-amber-300 border-amber-500/30",
      COMPLETED: "bg-emerald-900/50 text-emerald-300 border-emerald-500/30",
      FAILED: "bg-red-900/50 text-red-300 border-red-500/30",
    };
    const label = s === "PENDING" ? "Pending" : s === "COMPLETED" ? "Completed" : "Failed";
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${m[s] || "bg-slate-800 text-slate-500 border-slate-700"}`}>{label}</span>;
  };

  // Withdraw history: loại là Capital (từ gói stake) — không có reward ở đây vì reward là ClaimHistory
  // type field không tồn tại trên WithdrawHistory, nên cố định là "Capital"

  return (
    <div className="space-y-4">
      {approving && <ApproveOverlay id={approving} label="lệnh withdraw" />}
      {msg && <Toast type={msg.type} msg={msg.msg} onClose={() => setMsg(null)} />}

      <div className="flex gap-3">
        <div className="flex-1"><SearchBar value={q} onChange={setQ} /></div>
        <ReloadBtn onClick={load} disabled={loading || !!approving} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Tổng lệnh" value={all.length} color="text-slate-300" />
        <StatCard label="Pending" value={all.filter(w => w.status === "PENDING").length} color="text-amber-300" />
        <StatCard label="Completed" value={all.filter(w => w.status === "COMPLETED").length} color="text-emerald-300" />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 py-12"><Spin /><span className="text-sm">Đang tải...</span></div>
      ) : filtered.length === 0 ? (
        <Empty icon={IC.money} text="Không tìm thấy lệnh withdraw" sub={q ? "Thử wallet address khác" : "Chưa có lệnh nào"} />
      ) : (
        <div className="rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70">
                  <TH>#</TH>
                  <TH>Wallet Address</TH>
                  <TH right>Số tiền</TH>
                  <TH center>Đơn vị</TH>
                  <TH center>Loại</TH>
                  <TH center>Trạng thái</TH>
                  <TH center>Ngày tạo</TH>
                  <TH right>Thao tác</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(w => (
                  <tr key={w.id} className={`transition-colors ${w.status === "PENDING" ? "hover:bg-amber-950/10" : "hover:bg-slate-800/15"}`}>
                    <TD><span className="text-xs text-slate-600 font-mono">#{w.id}</span></TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-300">{short(w.walletAddress)}</span>
                        <button onClick={() => navigator.clipboard.writeText(w.walletAddress)} title={w.walletAddress}
                          className="text-slate-700 hover:text-slate-400 transition-colors shrink-0">
                          <Ico d={IC.copy} size={11} />
                        </button>
                      </div>
                    </TD>
                    <TD right>
                      <span className="font-mono font-semibold text-white">{fmt(w.amount)}</span>
                    </TD>
                    <TD center>
                      <span className="text-xs font-bold text-slate-400">{w.currency}</span>
                    </TD>
                    <TD center>
                      {/* WithdrawHistory = Capital withdraw */}
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold border bg-blue-900/40 text-blue-300 border-blue-500/30">
                        Capital
                      </span>
                    </TD>
                    <TD center>{sBadge(w.status)}</TD>
                    <TD center><span className="text-xs text-slate-500">{fmtD(w.timeCreate)}</span></TD>
                    <TD right>
                      {w.status === "PENDING" ? (
                        <button onClick={() => approve(w)} disabled={!!approving}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600
                            disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed
                            text-white text-xs font-semibold rounded-lg transition-colors border border-emerald-600/40">
                          <Ico d={IC.ok} size={12} />Approve
                        </button>
                      ) : (
                        <span className="text-xs text-slate-700 italic">—</span>
                      )}
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-800/50 bg-slate-900/40">
            <span className="text-xs text-slate-600">{filtered.length} / {all.length} lệnh</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 4: Claim History ──────────────────────────────────────────────────────
function ClaimsTab() {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAll(await api.get("/claim-history")); }
    catch { setMsg({ type: "error", msg: "Không thể tải lịch sử claim" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = all.filter(c => !q || c.walletAddress?.toLowerCase().includes(q.toLowerCase()));

  const approve = async (item) => {
    if (approving) return;
    setApproving(item.id); setMsg(null);
    try {
      await api.post("/stake/approve-claim", { claimId: item.id });
      setAll(p => p.map(c => c.id === item.id ? { ...c, status: "COMPLETED" } : c));
      setMsg({ type: "success", msg: `Đã approve claim #${item.id} thành công!` });
    } catch (err) { setMsg({ type: "error", msg: `Approve thất bại: ${err.message}` }); }
    finally { setApproving(null); }
  };

  const tBadge = (type) => {
    const m = {
      DAILY: { l: "Daily Reward", c: "bg-sky-900/40 text-sky-300 border-sky-500/30" },
      INTERNAL: { l: "Claim Reward", c: "bg-purple-900/40 text-purple-300 border-purple-500/30" },
      PERSONAL: { l: "Rút về ví", c: "bg-orange-900/40 text-orange-300 border-orange-500/30" },
    };
    const s = m[type] || { l: type, c: "bg-slate-800 text-slate-400 border-slate-700" };
    return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${s.c}`}>{s.l}</span>;
  };

  const sBadge = (s) => {
    const m = { PENDING: "bg-amber-900/50 text-amber-300 border-amber-500/30", COMPLETED: "bg-emerald-900/50 text-emerald-300 border-emerald-500/30", FAILED: "bg-red-900/50 text-red-300 border-red-500/30" };
    const l = { PENDING: "Pending", COMPLETED: "Completed", FAILED: "Failed" };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${m[s] || "bg-slate-800 text-slate-500 border-slate-700"}`}>{l[s] || s}</span>;
  };

  // Chỉ PERSONAL + PENDING mới cần approve (rút từ ví nội bộ ra ví cá nhân)
  const canApprove = (c) => c.status === "PENDING" && c.type === "PERSONAL";

  return (
    <div className="space-y-4">
      {approving && <ApproveOverlay id={approving} label="claim" />}
      {msg && <Toast type={msg.type} msg={msg.msg} onClose={() => setMsg(null)} />}

      <div className="flex gap-3">
        <div className="flex-1"><SearchBar value={q} onChange={setQ} /></div>
        <ReloadBtn onClick={load} disabled={loading || !!approving} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Tổng" value={all.length} color="text-slate-300" />
        <StatCard label="Pending" value={all.filter(c => c.status === "PENDING").length} color="text-amber-300" />
        <StatCard label="Completed" value={all.filter(c => c.status === "COMPLETED").length} color="text-emerald-300" />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 py-12"><Spin /><span className="text-sm">Đang tải...</span></div>
      ) : filtered.length === 0 ? (
        <Empty icon={IC.clock} text="Không tìm thấy lịch sử" sub={q ? "Thử wallet address khác" : "Chưa có lịch sử nào"} />
      ) : (
        <div className="rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70">
                  <TH>#</TH>
                  <TH>Wallet Address</TH>
                  <TH right>Số tiền</TH>
                  <TH center>Đơn vị</TH>
                  <TH center>Loại</TH>
                  <TH center>Trạng thái</TH>
                  <TH center>Ngày</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(c => (
                  <tr key={c.id} className={`transition-colors ${c.status === "PENDING" ? "hover:bg-amber-950/10" : "hover:bg-slate-800/15"}`}>
                    <TD><span className="text-xs text-slate-600 font-mono">#{c.id}</span></TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-300">{short(c.walletAddress)}</span>
                        <button onClick={() => navigator.clipboard.writeText(c.walletAddress)} title={c.walletAddress}
                          className="text-slate-700 hover:text-slate-400 transition-colors shrink-0">
                          <Ico d={IC.copy} size={11} />
                        </button>
                      </div>
                    </TD>
                    <TD right><span className="font-mono font-semibold text-white">{fmt(c.amount)}</span></TD>
                    <TD center><span className="text-xs font-bold text-slate-400">{c.currency}</span></TD>
                    <TD center>{tBadge(c.type)}</TD>
                    <TD center>{sBadge(c.status)}</TD>
                    <TD center><span className="text-xs text-slate-500">{fmtD(c.timeCreate)}</span></TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-800/50 bg-slate-900/40">
            <span className="text-xs text-slate-600">{filtered.length} / {all.length} records</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "config", label: "Cấu hình", icon: IC.cfg },
  { id: "users", label: "Users", icon: IC.users },
  { id: "withdraw", label: "Withdraw", icon: IC.money },
  { id: "claims", label: "Claim History", icon: IC.clock },
];

export default function AdminPanel() {
  const [tab, setTab] = useState("config");

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 pb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Ico d={IC.money} size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">Nova Admin Panel</h1>
            <p className="text-xs text-slate-600 mt-0.5">app.novaxisgreen.com</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab === t.id ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:text-slate-300"}`}>
              <Ico d={t.icon} size={14} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6">
          {tab === "config" && <ConfigTab />}
          {tab === "users" && <UsersTab />}
          {tab === "withdraw" && <WithdrawTab />}
          {tab === "claims" && <ClaimsTab />}
        </div>
      </div>
    </div>
  );
}