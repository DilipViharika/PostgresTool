/**
 * TableAndMatrix.jsx  — FULL REPLACEMENT
 * Path: src/usermanagement/Toggle/TableAndMatrix.jsx
 *
 * 100% self-contained. No external row/card components.
 * Every user renders as a single horizontal <tr>.
 */

import React, { useState, useMemo, useCallback, memo } from 'react';

/* ─── Theme ─────────────────────────────────────────────────────── */
const T = {
    surface:     '#12121f',
    surfaceHigh: '#1a1a2e',
    surfaceMid:  '#16162a',
    border:      '#252538',
    primary:     '#6c63ff',
    primaryGlow: '#6c63ff22',
    green:       '#10b981',
    yellow:      '#f59e0b',
    red:         '#ef4444',
    text:        '#e8eaf0',
    textDim:     '#9395a5',
    textMuted:   '#565870',
};

/* ─── Config maps ────────────────────────────────────────────────── */
const ROLE_CFG = {
    superadmin: { label: 'Super Admin', color: '#f59e0b', bg: '#f59e0b18', icon: '👑' },
    admin:      { label: 'Admin',       color: '#6c63ff', bg: '#6c63ff1a', icon: '🛡️' },
    editor:     { label: 'Editor',      color: '#00d4ff', bg: '#00d4ff14', icon: '✏️' },
    viewer:     { label: 'Viewer',      color: '#10b981', bg: '#10b98114', icon: '👁' },
    guest:      { label: 'Guest',       color: '#9395a5', bg: '#9395a518', icon: '🔗' },
};

const STATUS_CFG = {
    active:    { label: 'Active',    color: '#10b981', bg: '#10b98116', dot: '#10b981' },
    inactive:  { label: 'Inactive',  color: '#9395a5', bg: '#9395a516', dot: '#9395a5' },
    suspended: { label: 'Suspended', color: '#ef4444', bg: '#ef444416', dot: '#ef4444' },
};

const RISK_CFG = {
    low:      { label: 'Low',  color: '#10b981', pct: 25 },
    medium:   { label: 'Med',  color: '#f59e0b', pct: 55 },
    high:     { label: 'High', color: '#ef4444', pct: 82 },
    critical: { label: 'Crit', color: '#ff2d6b', pct: 100 },
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const initials = (n = '') =>
    n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const avatarColor = (n = '') => {
    const p = ['#6c63ff','#00d4ff','#10b981','#f59e0b','#8b5cf6','#ec4899','#ff6b35'];
    let h = 0;
    for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
    return p[Math.abs(h) % p.length];
};

const relativeTime = (raw) => {
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d)) return '—';
    const diff = Date.now() - d;
    const m = Math.floor(diff / 60000);
    if (m < 60)  return `${m}m ago`;
    const h = Math.floor(diff / 3600000);
    if (h < 24)  return `${h}h ago`;
    const dy = Math.floor(diff / 86400000);
    if (dy < 7)  return `${dy}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const STYLE_ID = 'ut2-styles';
function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
  .ut2 { font-family: 'Geist','DM Sans','Inter',system-ui,sans-serif; color: ${T.text}; }
  .ut2 *, .ut2 *::before, .ut2 *::after { box-sizing: border-box; }

  .ut2-search { position: relative; display: inline-flex; align-items: center; }
  .ut2-search input {
    width: 270px; padding: 8px 12px 8px 36px;
    background: ${T.surfaceHigh}; border: 1px solid ${T.border};
    border-radius: 9px; color: ${T.text}; font-size: 13px;
    font-family: inherit; outline: none;
    transition: border-color .18s, box-shadow .18s;
  }
  .ut2-search input::placeholder { color: ${T.textMuted}; }
  .ut2-search input:focus { border-color: ${T.primary}; box-shadow: 0 0 0 3px ${T.primaryGlow}; }
  .ut2-search-icon { position: absolute; left: 10px; pointer-events: none; }

  .ut2-pill {
    padding: 5px 13px; border-radius: 20px;
    border: 1px solid ${T.border}; background: transparent;
    color: ${T.textDim}; font-size: 12px; font-weight: 500;
    cursor: pointer; font-family: inherit; white-space: nowrap;
    transition: all .15s;
  }
  .ut2-pill:hover { border-color: #2e2e48; color: ${T.text}; }
  .ut2-pill.on { font-weight: 700; }

  .ut2-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px; border: none;
    font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: inherit; transition: all .15s; white-space: nowrap;
  }
  .ut2-btn-g { background: transparent; color: ${T.textDim}; border: 1px solid ${T.border}; }
  .ut2-btn-g:hover { background: ${T.surfaceHigh}; color: ${T.text}; }
  .ut2-btn-p { background: ${T.primary}; color: #fff; }
  .ut2-btn-p:hover { filter: brightness(1.12); transform: translateY(-1px); }

  .ut2-tbl { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .ut2-tbl thead tr { background: ${T.surfaceMid}; border-bottom: 1px solid ${T.border}; }
  .ut2-tbl th {
    padding: 11px 14px; text-align: left;
    font-size: 11px; font-weight: 700; color: ${T.textMuted};
    letter-spacing: .07em; text-transform: uppercase;
    white-space: nowrap; user-select: none;
  }
  .ut2-tbl th.s { cursor: pointer; }
  .ut2-tbl th.s:hover { color: ${T.textDim}; }

  .ut2-tbl tbody tr {
    border-bottom: 1px solid ${T.border}33; transition: background .1s; cursor: pointer;
  }
  .ut2-tbl tbody tr:last-child { border-bottom: none; }
  .ut2-tbl tbody tr:hover { background: ${T.surfaceHigh}66; }
  .ut2-tbl tbody tr.sel { background: ${T.primaryGlow}; }
  .ut2-tbl td { padding: 13px 14px; vertical-align: middle; }

  .ut2-cb {
    width: 15px; height: 15px; border-radius: 4px;
    border: 1.5px solid ${T.border}; background: transparent;
    appearance: none; cursor: pointer; position: relative;
    transition: all .15s; display: block;
  }
  .ut2-cb:checked { background: ${T.primary}; border-color: ${T.primary}; }
  .ut2-cb:checked::after {
    content: ''; position: absolute;
    left: 2px; top: 0px; width: 8px; height: 5px;
    border-left: 2px solid #fff; border-bottom: 2px solid #fff;
    transform: rotate(-45deg);
  }

  .ut2-av {
    width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800;
  }

  .ut2-ib {
    width: 28px; height: 28px; border-radius: 7px;
    border: 1px solid ${T.border}; background: transparent;
    color: ${T.textDim}; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s; flex-shrink: 0;
  }
  .ut2-ib:hover     { border-color: ${T.primary}; color: ${T.primary}; background: ${T.primaryGlow}; }
  .ut2-ib.d:hover   { border-color: ${T.red}; color: ${T.red}; background: ${T.red}15; }

  .ut2-risk-track { height: 3px; border-radius: 2px; background: ${T.border}; width: 56px; margin-top: 3px; }
  .ut2-risk-fill  { height: 100%; border-radius: 2px; }

  .ut2-pg {
    width: 28px; height: 28px; border-radius: 7px;
    border: 1px solid ${T.border}; background: transparent;
    color: ${T.textDim}; font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    display: flex; align-items: center; justify-content: center; transition: all .15s;
  }
  .ut2-pg:hover:not(:disabled) { border-color: ${T.primary}; color: ${T.primary}; }
  .ut2-pg.on  { background: ${T.primary}; border-color: ${T.primary}; color: #fff; }
  .ut2-pg:disabled { opacity: .3; cursor: not-allowed; }

  @keyframes ut2-in { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
  .ut2-in { animation: ut2-in .18s ease-out both; }
`;
    document.head.appendChild(el);
}

/* ─── Tiny SVG icons ─────────────────────────────────────────────── */
const Ico = ({ d, d2, circle, points, cx, cy, r }) => (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {d  && <path d={d}/>}
        {d2 && <path d={d2}/>}
        {circle && <circle cx={cx} cy={cy} r={r}/>}
        {points && <polyline points={points}/>}
    </svg>
);

const SearchSVG = () => (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
         stroke={T.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
);

/* ─── Badges ─────────────────────────────────────────────────────── */
const RoleBadge = ({ role = '' }) => {
    const c = ROLE_CFG[role.toLowerCase().replace(/\s+/g,'')] || ROLE_CFG.guest;
    return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px',
            borderRadius:20, background:c.bg, color:c.color, fontSize:11, fontWeight:700 }}>
            <span style={{ fontSize:10 }}>{c.icon}</span>{c.label}
        </span>
    );
};

const StatusBadge = ({ status = '' }) => {
    const c = STATUS_CFG[status.toLowerCase()] || STATUS_CFG.inactive;
    return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px',
            borderRadius:20, background:c.bg, color:c.color, fontSize:11, fontWeight:600 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:c.dot,
                boxShadow:`0 0 5px ${c.dot}`, flexShrink:0 }}/>
            {c.label}
        </span>
    );
};

const RiskCell = ({ risk = '' }) => {
    if (!risk) return <span style={{ color:T.textMuted, fontSize:12 }}>—</span>;
    const c = RISK_CFG[risk.toLowerCase()] || { label: risk, color: T.textDim, pct: 30 };
    return (
        <div>
            <span style={{ fontSize:11, fontWeight:700, color:c.color }}>{c.label}</span>
            <div className="ut2-risk-track">
                <div className="ut2-risk-fill" style={{ width:`${c.pct}%`, background:c.color }}/>
            </div>
        </div>
    );
};

/* ─── Filter pill ─────────────────────────────────────────────────── */
const Pill = ({ label, active, color, bg, onClick }) => (
    <button className={`ut2-pill${active?' on':''}`} onClick={onClick}
            style={active && color ? { borderColor:color, color, background:bg||'transparent' } : {}}>
        {label}
    </button>
);

/* ═══════════════════════════════════════════════════════════════════
   USERS TABLE
   ═══════════════════════════════════════════════════════════════════ */
const PAGE = 10;

export const UsersTable = memo(({ users = [], onSelectUser, onEditUser, onDeleteUsers }) => {
    ensureStyles();

    const [search,  setSearch]  = useState('');
    const [roleFil, setRoleFil] = useState('all');
    const [statFil, setStatFil] = useState('all');
    const [sortK,   setSortK]   = useState('name');
    const [sortD,   setSortD]   = useState('asc');
    const [sel,     setSel]     = useState(new Set());
    const [page,    setPage]    = useState(1);

    const filtered = useMemo(() => {
        let list = [...users];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(u =>
                (u.name       ||'').toLowerCase().includes(q) ||
                (u.email      ||'').toLowerCase().includes(q) ||
                (u.department ||'').toLowerCase().includes(q)
            );
        }
        if (roleFil !== 'all') list = list.filter(u => (u.role||'').toLowerCase().replace(/\s+/g,'') === roleFil);
        if (statFil !== 'all') list = list.filter(u => (u.status||'').toLowerCase() === statFil);
        list.sort((a,b) => {
            const av = String(a[sortK]||'').toLowerCase();
            const bv = String(b[sortK]||'').toLowerCase();
            return sortD==='asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        return list;
    }, [users, search, roleFil, statFil, sortK, sortD]);

    const total = Math.max(1, Math.ceil(filtered.length / PAGE));
    const rows  = filtered.slice((page-1)*PAGE, page*PAGE);

    const doSort = useCallback(k => {
        if (k === sortK) setSortD(d => d==='asc'?'desc':'asc');
        else { setSortK(k); setSortD('asc'); }
    }, [sortK]);

    const toggleRow = useCallback((id, e) => {
        e.stopPropagation();
        setSel(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });
    }, []);

    const toggleAll = () => setSel(prev =>
        prev.size===rows.length ? new Set() : new Set(rows.map(u=>u.id))
    );

    const go = (fn) => { fn(); setPage(1); };

    const roleOpts = useMemo(() => {
        const seen = new Set(users.map(u=>(u.role||'').toLowerCase().replace(/\s+/g,'')));
        return ['superadmin','admin','editor','viewer','guest'].filter(r=>seen.has(r)||!users.length);
    }, [users]);

    const COLS = [
        { k:'name',       label:'User',       w:'28%' },
        { k:'role',       label:'Role',       w:'14%' },
        { k:'status',     label:'Status',     w:'12%' },
        { k:'department', label:'Dept',       w:'14%' },
        { k:'last_login', label:'Last Login', w:'13%' },
        { k:'risk',       label:'Risk',       w:'10%', ns:true },
        { k:'_a',         label:'',           w:'9%',  ns:true },
    ];

    return (
        <div className="ut2">

            {/* Toolbar */}
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                <div className="ut2-search">
                    <span className="ut2-search-icon"><SearchSVG/></span>
                    <input id="um-search-input" type="text"
                           placeholder="Search name, email, dept…"
                           value={search}
                           onChange={e=>go(()=>setSearch(e.target.value))}
                           aria-label="Search users"/>
                </div>

                <Pill label="All Roles" active={roleFil==='all'} onClick={()=>go(()=>setRoleFil('all'))}/>
                {roleOpts.map(r=>{
                    const c=ROLE_CFG[r];
                    return <Pill key={r} label={c.label} active={roleFil===r}
                                 color={c.color} bg={c.bg} onClick={()=>go(()=>setRoleFil(r))}/>;
                })}

                <div style={{flex:1}}/>

                <Pill label="All Status" active={statFil==='all'} onClick={()=>go(()=>setStatFil('all'))}/>
                {['active','inactive','suspended'].map(s=>{
                    const c=STATUS_CFG[s];
                    return <Pill key={s} label={c.label} active={statFil===s}
                                 color={c.color} bg={c.bg} onClick={()=>go(()=>setStatFil(s))}/>;
                })}

                <button className="ut2-btn ut2-btn-g">
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export
                </button>
                <button className="ut2-btn ut2-btn-p" onClick={()=>onEditUser?.(null)}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add User
                </button>
            </div>

            {/* Meta */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                marginBottom:10, fontSize:12, color:T.textMuted }}>
                <span>{filtered.length} result{filtered.length!==1?'s':''}</span>
                {sel.size>0 && (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ color:T.primary, fontWeight:600 }}>{sel.size} selected</span>
                        <button onClick={()=>onDeleteUsers?.([...sel])} style={{
                            fontSize:11, fontWeight:600, color:T.red,
                            background:`${T.red}15`, border:`1px solid ${T.red}40`,
                            borderRadius:6, padding:'2px 8px', cursor:'pointer', fontFamily:'inherit',
                        }}>Delete selected</button>
                    </span>
                )}
            </div>

            {/* Table */}
            <div style={{ border:`1px solid ${T.border}`, borderRadius:12,
                overflow:'hidden', background:T.surface }}>
                <table className="ut2-tbl">
                    <colgroup>
                        <col style={{width:44}}/>
                        {COLS.map(c=><col key={c.k} style={{width:c.w}}/>)}
                    </colgroup>
                    <thead>
                    <tr>
                        <th>
                            <input type="checkbox" className="ut2-cb"
                                   checked={rows.length>0&&sel.size===rows.length}
                                   onChange={toggleAll} aria-label="Select all"/>
                        </th>
                        {COLS.map(c=>(
                            <th key={c.k} className={c.ns?'':'s'}
                                onClick={c.ns?undefined:()=>doSort(c.k)}>
                                {c.label}
                                {!c.ns && (
                                    <span style={{ marginLeft:3, fontSize:10,
                                        opacity:sortK===c.k?1:.25,
                                        color:sortK===c.k?T.primary:'inherit' }}>
                                            {sortK===c.k?(sortD==='asc'?'↑':'↓'):'↕'}
                                        </span>
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {rows.length===0 ? (
                        <tr><td colSpan={8} style={{ textAlign:'center', padding:'56px 20px' }}>
                            <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                            <div style={{ color:T.textMuted, fontSize:13 }}>
                                No users found{search?` for "${search}"`:''}</div>
                        </td></tr>
                    ) : rows.map((u,i) => {
                        const isS = sel.has(u.id);
                        const ac  = avatarColor(u.name);
                        return (
                            <tr key={u.id??`u${i}`}
                                className={`ut2-in${isS?' sel':''}`}
                                style={{ animationDelay:`${i*25}ms` }}
                                onClick={()=>onSelectUser?.(u)}>

                                {/* checkbox */}
                                <td onClick={e=>toggleRow(u.id,e)}>
                                    <input type="checkbox" className="ut2-cb"
                                           checked={isS}
                                           onChange={e=>toggleRow(u.id,e)}
                                           aria-label={`Select ${u.name}`}/>
                                </td>

                                {/* user */}
                                <td>
                                    <div style={{ display:'flex', alignItems:'center', gap:10, overflow:'hidden' }}>
                                        <div className="ut2-av" style={{ background:`${ac}22`, color:ac }}>
                                            {initials(u.name)}
                                        </div>
                                        <div style={{ overflow:'hidden', minWidth:0 }}>
                                            <div style={{ fontSize:13, fontWeight:600, color:T.text,
                                                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                                {u.name||'—'}
                                            </div>
                                            <div style={{ fontSize:11, color:T.textMuted, marginTop:1,
                                                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                                {u.email||''}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* role */}
                                <td><RoleBadge role={u.role||''}/></td>

                                {/* status */}
                                <td><StatusBadge status={u.status||''}/></td>

                                {/* dept */}
                                <td style={{ fontSize:12, color:T.textDim,
                                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                    {u.department||'—'}
                                </td>

                                {/* last login */}
                                <td style={{ fontSize:12, color:T.textDim,
                                    fontFamily:'"SF Mono","Fira Code",monospace',
                                    whiteSpace:'nowrap' }}>
                                    {relativeTime(u.last_login)}
                                </td>

                                {/* risk */}
                                <td><RiskCell risk={u.risk||''}/></td>

                                {/* actions */}
                                <td onClick={e=>e.stopPropagation()}>
                                    <div style={{ display:'flex', gap:5 }}>
                                        <button className="ut2-ib" title="Edit"
                                                onClick={e=>{e.stopPropagation();onEditUser?.(u);}}>
                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                        </button>
                                        <button className="ut2-ib d" title="Delete"
                                                onClick={e=>{e.stopPropagation();onDeleteUsers?.(u.id);}}>
                                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                marginTop:12, fontSize:12, color:T.textMuted }}>
                <span>
                    Showing {filtered.length===0?0:(page-1)*PAGE+1}–{Math.min(page*PAGE,filtered.length)} of {filtered.length} users
                </span>
                {total>1 && (
                    <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                        <button className="ut2-pg" disabled={page===1}
                                onClick={()=>setPage(p=>p-1)}>‹</button>
                        {[...Array(Math.min(total,7))].map((_,i)=>{
                            const p=i+1;
                            return <button key={p} className={`ut2-pg${page===p?' on':''}`}
                                           onClick={()=>setPage(p)}>{p}</button>;
                        })}
                        {total>7&&<span>…</span>}
                        <button className="ut2-pg" disabled={page===total}
                                onClick={()=>setPage(p=>p+1)}>›</button>
                    </div>
                )}
            </div>
        </div>
    );
});
UsersTable.displayName = 'UsersTable';


/* ═══════════════════════════════════════════════════════════════════
   PERMISSION MATRIX
   ═══════════════════════════════════════════════════════════════════ */
export const PermissionMatrix = memo(() => {
    const roles   = ['superadmin','admin','editor','viewer','guest'];
    const actions = ['View','Create','Edit','Delete','Export','Admin Panel'];
    const perms   = {
        superadmin:[1,1,1,1,1,1],
        admin:     [1,1,1,1,1,0],
        editor:    [1,1,1,0,0,0],
        viewer:    [1,0,0,0,1,0],
        guest:     [1,0,0,0,0,0],
    };
    return (
        <div style={{ fontFamily:'inherit' }}>
            <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:15, fontWeight:700, color:T.text }}>Permission Matrix</div>
                <div style={{ fontSize:12, color:T.textDim, marginTop:3 }}>
                    Role-based access control across all system actions
                </div>
            </div>
            <div style={{ overflowX:'auto', border:`1px solid ${T.border}`,
                borderRadius:12, background:T.surface }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                    <thead>
                    <tr style={{ background:T.surfaceMid, borderBottom:`1px solid ${T.border}` }}>
                        <th style={{ padding:'11px 16px', textAlign:'left', fontSize:11,
                            fontWeight:700, color:T.textMuted,
                            textTransform:'uppercase', letterSpacing:'.07em' }}>Role</th>
                        {actions.map(a=>(
                            <th key={a} style={{ padding:'11px 14px', textAlign:'center', fontSize:11,
                                fontWeight:700, color:T.textMuted,
                                textTransform:'uppercase', letterSpacing:'.07em' }}>{a}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {roles.map((role,ri)=>(
                        <tr key={role} style={{ borderBottom:ri<roles.length-1?`1px solid ${T.border}33`:'none' }}>
                            <td style={{ padding:'13px 16px' }}><RoleBadge role={role}/></td>
                            {perms[role].map((on,ai)=>(
                                <td key={ai} style={{ padding:'13px 14px', textAlign:'center' }}>
                                    {on ? (
                                        <span style={{ display:'inline-flex', alignItems:'center',
                                            justifyContent:'center', width:22, height:22,
                                            borderRadius:6, background:`${T.green}1a`,
                                            color:T.green, fontSize:12, fontWeight:700 }}>✓</span>
                                    ) : (
                                        <span style={{ display:'inline-flex', alignItems:'center',
                                            justifyContent:'center', width:22, height:22,
                                            borderRadius:6, background:`${T.border}55`,
                                            color:T.textMuted, fontSize:11 }}>—</span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
PermissionMatrix.displayName = 'PermissionMatrix';