import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Search, 
  Users, 
  Calendar, 
  Settings, 
  TrendingUp, 
  BarChart3, 
  MessageSquare, 
  Plus,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Send,
  Loader2,
  CheckCircle2,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Video,
  Music2,
  Bell,
  X,
  Tag,
  Clock,
  Filter,
  Upload,
  Download,
  Palette,
  AlertCircle,
  FileText,
  Zap,
  MailWarning,
  Play,
  Image as ImageIcon,
  Film,
  MoreVertical,
  Trash2,
  PlayCircle,
  CreditCard,
  ShieldCheck,
  Zap as ZapIcon,
  Star,
  ArrowRight,
  Menu,
  Lock,
  Wand2,
  Moon,
  Sun,
  Wind,
  Quote,
  Edit3,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Volume2,
  Box,
  ShoppingBag,
  HelpCircle,
  LogOut,
  PartyPopper,
  ShieldAlert,
  Activity,
  XCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from 'recharts';
import Markdown from 'react-markdown';
import { generateMarketingContent, generateAutoCaption } from './services/gemini';
import { cn } from './lib/utils';
import { 
  auth, 
  db, 
  googleProvider, 
  OperationType, 
  handleFirestoreError 
} from './firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  orderBy
} from 'firebase/firestore';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: any) => void;
        onPending: (result: any) => void;
        onError: (result: any) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

// --- Mock Data ---
const analyticsData = [
  { name: 'Jan', reach: 4000, conv: 2400 },
  { name: 'Feb', reach: 3000, conv: 1398 },
  { name: 'Mar', reach: 2000, conv: 9800 },
  { name: 'Apr', reach: 2780, conv: 3908 },
  { name: 'May', reach: 1890, conv: 4800 },
  { name: 'Jun', reach: 2390, conv: 3800 },
  { name: 'Jul', reach: 3490, conv: 4300 },
];

const recentLeads = [
  { id: 1, name: 'Budi Santoso', company: 'Tech Corp', status: 'Hot', email: 'budi@tech.com' },
  { id: 2, name: 'Siti Aminah', company: 'Creative Co', status: 'Warm', email: 'siti@creative.id' },
  { id: 3, name: 'John Doe', company: 'Global Inc', status: 'Cold', email: 'john@global.com' },
];

// --- Components ---

const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <defs>
      <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0066FF" />
        <stop offset="100%" stopColor="#003399" />
      </linearGradient>
      <linearGradient id="green-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4ADE80" />
        <stop offset="100%" stopColor="#16A34A" />
      </linearGradient>
      <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#FBBF24" />
      </linearGradient>
    </defs>
    
    {/* Logo Object Scaled Up Even More */}
    <g transform="translate(50, 50) scale(1.75) translate(-50, -50)">
      {/* Bar Chart Bars */}
      <rect x="35" y="55" width="12" height="25" rx="2" fill="url(#blue-grad)" />
      <rect x="50" y="45" width="12" height="35" rx="2" fill="url(#green-grad)" />
      <rect x="65" y="35" width="12" height="45" rx="2" fill="url(#blue-grad)" />
      
      {/* Sweeping Arrow */}
      <path 
        d="M 25 75 C 40 75, 55 60, 85 35 L 80 32 M 85 35 L 82 42" 
        stroke="url(#orange-grad)" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Pixels/Data bits */}
      <rect x="25" y="58" width="5" height="5" rx="1" fill="#F97316" />
      <rect x="32" y="51" width="4" height="4" rx="1" fill="#FB923C" />
      <rect x="28" y="45" width="3" height="3" rx="1" fill="#FDBA74" />
    </g>
  </svg>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-brand-600 text-white shadow-lg shadow-brand-200" 
        : "text-slate-500 hover:bg-brand-50 hover:text-brand-600"
    )}
  >
    <Icon size={20} className={cn("transition-transform duration-200", !active && "group-hover:scale-110")} />
    <span className="font-medium">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-pill" 
        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
      />
    )}
  </button>
);

const StatCard = ({ label, value, trend, icon: Icon }: { label: string, value: string, trend: string, icon: any }) => (
  <div className="glass-card p-6 rounded-2xl flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
        <Icon size={20} />
      </div>
      <span className={cn(
        "text-xs font-bold px-2 py-1 rounded-full",
        trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        {trend}
      </span>
    </div>
    <div className="mt-2">
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 font-display">{value}</h3>
    </div>
  </div>
);

// --- Main Views ---

const DashboardView = ({ onAction, socialAccounts, onlineStores }: { 
  onAction: () => void, 
  socialAccounts: Record<string, boolean>,
  onlineStores: Record<string, { connected: boolean, shopEmail?: string, shopId?: string, lastSync?: string }>
}) => {
  const connectedPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-slate-900', bg: 'bg-slate-50' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
    { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'text-slate-900', bg: 'bg-slate-50' },
  ].filter(p => socialAccounts[p.id]);

  const connectedStores = [
    { id: 'tokopedia', name: 'Tokopedia', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'shopee', name: 'Shopee', color: 'text-orange-600', bg: 'bg-orange-50' },
  ].filter(s => onlineStores[s.id]?.connected);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display transition-all">Ringkasan Performa</h1>
          <p className="text-slate-500">Selamat datang kembali, berikut adalah statistik kampanye Anda.</p>
        </div>
        <button 
          onClick={onAction}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-md"
        >
          <Plus size={18} />
          <span>Buat Kampanye</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reach" value="1.2M" trend="+12.5%" icon={Globe} />
        <StatCard label="Konversi" value="45.2k" trend="+8.2%" icon={TrendingUp} />
        <StatCard label="Engagement" value="18.4%" trend="-2.1%" icon={MessageSquare} />
        <StatCard label="ROI" value="4.2x" trend="+15.0%" icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-600" />
              Tren Pertumbuhan
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0e91e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0e91e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#0e91e9" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Sparkles size={20} className="text-brand-600" />
                Analisis Kinerja Akun Terhubung
              </h3>
              <span className="text-xs font-bold text-slate-400">Pembaruan: Real-time</span>
            </div>
            
            {connectedPlatforms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectedPlatforms.map(platform => (
                  <div key={platform.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", platform.bg, platform.color)}>
                          <platform.icon size={18} />
                        </div>
                        <span className="font-bold text-slate-900">{platform.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <TrendingUp size={12} />
                        +4.2%
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Metrik Utama</p>
                          <p className="text-xl font-bold text-slate-900">12.4k <span className="text-xs text-slate-400 font-normal">Followers</span></p>
                        </div>
                        <div className="h-8 w-24">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              {v: 10}, {v: 15}, {v: 12}, {v: 18}, {v: 16}, {v: 22}, {v: 20}
                            ]}>
                              <Area type="monotone" dataKey="v" stroke="#0e91e9" fill="#0e91e9" fillOpacity={0.1} strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200/50">
                        <p className="text-[10px] italic text-slate-500 leading-relaxed">
                          <span className="font-bold text-brand-600">Insight:</span> Konten video di {platform.name} mendapatkan engagement 2x lebih tinggi minggu ini. Fokus pada format pendek.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-brand-50 text-brand-400 rounded-2xl flex items-center justify-center mb-4">
                  <Globe size={32} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Belum Ada Akun Terhubung</h4>
                <p className="text-sm text-slate-500 max-w-xs mb-6">Hubungkan akun sosial media Anda di menu pengaturan untuk melihat analisis perkembangan di sini.</p>
                <button 
                  onClick={() => onAction()} // Assuming onAction can be modified or redirected
                  className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100"
                >
                  Hubungkan Sekarang
                </button>
              </div>
            )}
          </div>
        </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag size={20} className="text-brand-600" />
                Analisis Toko Online
              </h3>
              <span className="text-xs font-bold text-slate-400">Update: Setiap 1 Jam</span>
            </div>

            {connectedStores.length > 0 ? (
              <div className="space-y-4">
                {connectedStores.map((store) => (
                  <div key={store.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg", store.bg, store.color)}>
                        {store.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{store.name}</p>
                        {onlineStores[store.id]?.shopEmail ? (
                          <div className="flex flex-col">
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Mail size={10} /> {onlineStores[store.id].shopEmail}
                            </p>
                            {onlineStores[store.id].lastSync && (
                              <p className="text-[9px] text-slate-400 mt-0.5">Sync: {new Date(onlineStores[store.id].lastSync!).toLocaleTimeString()}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Kinerja penjualan meningkat pesat!</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">Rp 12,4M</p>
                      <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                        <TrendingUp size={10} /> +24.5%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-sm text-slate-500 mb-4">Belum ada toko online yang terhubung.</p>
                <button 
                  onClick={() => onAction()} // Redirect to Settings ideally
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Hubungkan Sekarang
                </button>
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Users size={20} className="text-brand-600" />
              Prospek Terbaru
            </h3>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                    {lead.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.company}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  lead.status === 'Hot' ? "bg-orange-100 text-orange-600" : 
                  lead.status === 'Warm' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                )}>
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 rounded-xl transition-colors flex items-center justify-center gap-1">
            Lihat Semua <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const PlannerView = ({ onPostNow }: { onPostNow?: () => void }) => (
  <div className="space-y-6">
    <header className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-display">Campaign Planner</h1>
        <p className="text-slate-500">Jadwalkan dan kelola konten pemasaran Anda di berbagai platform.</p>
      </div>
      <div className="flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-xl text-xs font-bold border border-brand-100">
        <Sparkles size={14} />
        <span>Smart Optimization Active</span>
      </div>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Kalender Konten</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
              <span className="text-sm font-bold flex items-center px-2">April 2026</span>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const hasEvent = [12, 15, 18, 20].includes(day);
              return (
                <div 
                  key={i} 
                  className={cn(
                    "aspect-square rounded-xl border flex flex-col p-2 transition-all cursor-pointer hover:border-brand-300",
                    day === 12 ? "bg-brand-50 border-brand-200" : "bg-slate-50/50 border-slate-100"
                  )}
                >
                  <span className={cn(
                    "text-xs font-bold mb-1",
                    day === 12 ? "text-brand-600" : "text-slate-400"
                  )}>{day}</span>
                  {hasEvent && (
                    <div className="w-full h-1.5 bg-brand-500 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 rounded-3xl bg-slate-900 text-white">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Zap size={18} className="text-brand-400" />
            Rekomendasi AI
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Berdasarkan analisis data seminggu terakhir, audiens Anda paling aktif pada:
          </p>
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold text-brand-400 uppercase mb-1">Waktu Terbaik Hari Ini</p>
              <p className="text-xl font-bold">20:00 - 21:30</p>
              <p className="text-[10px] text-slate-400 mt-2">Potensi Reach: +45% lebih tinggi</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 opacity-60">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Besok</p>
              <p className="text-xl font-bold">12:15 - 13:45</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 px-2">Antrean Posting</h3>
          {[
            { title: 'Peluncuran Produk Baru', time: 'Hari ini, 20:00', platform: 'Instagram' },
            { title: 'Promo Ramadhan', time: '15 Apr, 10:00', platform: 'Facebook' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 rounded-2xl flex gap-4 items-center group relative overflow-hidden">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                {item.platform === 'Instagram' ? <Instagram size={20} /> : <Facebook size={20} />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="text-[10px] text-slate-500">{item.time}</p>
              </div>
              <button 
                onClick={() => onPostNow?.()}
                className="absolute right-2 opacity-0 group-hover:opacity-100 p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                title="Post Sekarang"
              >
                <Zap size={16} />
              </button>
            </div>
          ))}
          
          <button 
            onClick={() => onPostNow?.()}
            className="w-full mt-2 py-3 bg-brand-600 text-white rounded-2xl text-xs font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
          >
            <Send size={14} />
            <span>Post Sekarang (Instan)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SEOView = ({ userGeminiKey, onMissingKey }: { userGeminiKey?: string, onMissingKey?: () => void }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [keywords, setKeywords] = useState([
    { word: 'Digital Marketing Agency', volume: '12.5k', difficulty: 'Low', trend: 'up' },
    { word: 'SEO Services Jakarta', volume: '8.2k', difficulty: 'Medium', trend: 'stable' },
    { word: 'Social Media Management', volume: '15.1k', difficulty: 'High', trend: 'up' }
  ]);
  const [keywordInput, setKeywordInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [auditResults, setAuditResults] = useState({
    score: 92,
    issues: [
      { id: 1, type: 'success', text: 'Meta tags optimized' },
      { id: 2, type: 'success', text: 'Mobile friendly' },
      { id: 3, type: 'warning', text: '3 broken links found' },
      { id: 4, type: 'info', text: 'Slow image loading on home' }
    ]
  });

  const handleSyncWebsite = () => {
    if (!websiteUrl) return;
    setIsSyncing(true);
    // Simulate scraping focus/sitemap
    setTimeout(() => {
      setLastSync(new Date().toLocaleString('id-ID'));
      setIsSyncing(false);
      setAuditResults(prev => ({
        ...prev,
        score: Math.floor(Math.random() * (98 - 85 + 1)) + 85
      }));
    }, 2500);
  };

  const handleAnalyticKeywords = async () => {
    if (!keywordInput) return;
    if (!userGeminiKey) {
      onMissingKey?.();
      return;
    }
    setIsAnalyzing(true);
    try {
      const prompt = `Lakukan riset kata kunci untuk: "${keywordInput}". Berikan 3 kata kunci terkait dengan estimasi volume dan kesulitan. Format JSON: [{"word": "...", "volume": "...", "difficulty": "...", "trend": "..."}]`;
      const result = await generateMarketingContent(prompt, 'SEO Research', undefined, userGeminiKey);
      
      // Attempt to parse JSON from AI response
      const jsonStr = result.split('---ADVICE---')[0].match(/\[.*\]/s)?.[0];
      if (jsonStr) {
        const newKeywords = JSON.parse(jsonStr);
        setKeywords(newKeywords);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">SEO Optimizer</h1>
          <p className="text-slate-500">Optimalkan visibilitas situs Anda di mesin pencari.</p>
        </div>
        {lastSync && (
          <div className="text-[10px] text-slate-400 italic">Terakhir sinkron: {lastSync}</div>
        )}
      </header>

      <div className="glass-card p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Sinkronisasi Website</h3>
            <p className="text-xs text-slate-500">Hubungkan domain Anda untuk audit otomatis</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://website-anda.com" 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
          />
          <button 
            onClick={handleSyncWebsite}
            disabled={isSyncing || !websiteUrl}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            {isSyncing ? 'Menghubungkan...' : 'Sinkron Sekarang'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-brand-600">
            <Search size={18} />
            Keyword Research
          </h3>
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Masukkan topik/produk..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
            />
            <button 
              onClick={handleAnalyticKeywords}
              disabled={isAnalyzing || !userGeminiKey}
              className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : 'Analisis'}
            </button>
          </div>
          <div className="space-y-3">
            {keywords.map((kw, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-sm font-bold text-slate-700 block">{kw.word}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">Vol: {kw.volume}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md font-bold",
                      kw.difficulty === 'Low' ? "bg-emerald-100 text-emerald-700" :
                      kw.difficulty === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {kw.difficulty}
                    </span>
                  </div>
                </div>
                {kw.trend === 'up' && <TrendingUp size={16} className="text-emerald-500" />}
              </div>
            ))}
          </div>
          {!userGeminiKey && (
            <p className="text-[10px] text-rose-500 italic mt-3 flex items-center gap-1">
              <AlertCircle size={10} /> Atur Gemini API Key di Settings untuk riset AI.
            </p>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-brand-600">
            <BarChart3 size={18} />
            Site Audit & Health
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Health Score</span>
                <span className={cn(
                  "text-3xl font-bold font-display",
                  auditResults.score > 90 ? "text-emerald-600" : "text-amber-600"
                )}>{auditResults.score}/100</span>
              </div>
              <div className="w-20 h-20 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                  <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={213} strokeDashoffset={213 - (213 * auditResults.score / 100)} className="text-brand-600" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Findings & Issues</p>
              {auditResults.issues.map((issue) => (
                <div key={issue.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    issue.type === 'success' ? "bg-emerald-500" :
                    issue.type === 'warning' ? "bg-amber-500" : "bg-indigo-500"
                  )} />
                  <span className="text-xs text-slate-600">{issue.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const SettingsView = ({ 
  accounts, 
  onConnect,
  apiKeys,
  onSaveKeys,
  serverConfig,
  onlineStores,
  onConnectStore,
  userStatus,
  geminiKey,
  onSaveGeminiKey,
  forceShowGeminiHelp = false
}: { 
  accounts: Record<string, boolean>, 
  onConnect: (platform: string) => void,
  apiKeys: Record<string, { clientId: string, clientSecret: string }>,
  onSaveKeys: (platform: string, clientId: string, clientSecret: string) => void,
  serverConfig: Record<string, boolean>,
  onlineStores: Record<string, { connected: boolean, shopEmail?: string, shopId?: string, lastSync?: string }>,
  onConnectStore: (store: string) => void,
  userStatus?: string,
  geminiKey: string,
  onSaveGeminiKey: (key: string) => void,
  forceShowGeminiHelp?: boolean
}) => {
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [tempGeminiKey, setTempGeminiKey] = useState(geminiKey);
  const [isEditingGemini, setIsEditingGemini] = useState(false);
  const [showGeminiHelp, setShowGeminiHelp] = useState(forceShowGeminiHelp);
  const [tempKeys, setTempKeys] = useState({ clientId: '', clientSecret: '' });

  useEffect(() => {
    if (forceShowGeminiHelp) {
      setShowGeminiHelp(true);
      // Wait a bit and scroll to the AI section
      setTimeout(() => {
        document.getElementById('ai-config-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [forceShowGeminiHelp]);
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});

  const startEditing = (platform: string) => {
    setEditingPlatform(platform);
    setTempKeys(apiKeys[platform] || { clientId: '', clientSecret: '' });
  };

  const handleSave = () => {
    if (editingPlatform) {
      onSaveKeys(editingPlatform, tempKeys.clientId, tempKeys.clientSecret);
      setEditingPlatform(null);
    }
  };

  const handleTest = (platform: string) => {
    setTestStatus(prev => ({ ...prev, [platform]: 'testing' }));
    // Simulate API test
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [platform]: 'success' }));
      setTimeout(() => setTestStatus(prev => ({ ...prev, [platform]: 'idle' })), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Pusat Integrasi SalesKu</h1>
          <p className="text-slate-500">Hubungkan bisnis Anda dengan dunia luar tanpa perlu baris kode.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">Sistem Aktif</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div id="ai-config-section" className="glass-card p-6 rounded-3xl shadow-xl shadow-slate-100/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900">
                <Wand2 size={22} className="text-brand-600" />
                Konfigurasi AI
              </h3>
              <span className="text-[10px] font-bold bg-brand-50 text-brand-600 px-2 py-1 rounded-lg">Required</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">Gemini API Key</p>
                    <button 
                      onClick={() => setShowGeminiHelp(true)}
                      className="text-brand-600 hover:text-brand-700 transition-colors"
                      title="Butuh bantuan mendapatkan kunci?"
                    >
                      <HelpCircle size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">Kunci akses untuk fitur asisten AI.</p>
                </div>
                {!isEditingGemini ? (
                  <button 
                    onClick={() => { setTempGeminiKey(geminiKey); setIsEditingGemini(true); }}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    {geminiKey ? 'Ubah' : 'Atur Sekarang'}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingGemini(false)} className="text-xs font-bold text-slate-400">Batal</button>
                    <button 
                      onClick={() => { onSaveGeminiKey(tempGeminiKey); setIsEditingGemini(false); }} 
                      className="text-xs font-bold text-brand-600"
                    >
                      Simpan
                    </button>
                  </div>
                )}
              </div>

              {isEditingGemini ? (
                <div className="relative">
                  <input 
                    type="password"
                    value={tempGeminiKey}
                    onChange={(e) => setTempGeminiKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmed = tempGeminiKey.trim();
                        onSaveGeminiKey(trimmed);
                        setTempGeminiKey(trimmed);
                        setIsEditingGemini(false);
                      }
                    }}
                    placeholder="Masukkan Gemini API Key Anda..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      const trimmed = tempGeminiKey.trim();
                      onSaveGeminiKey(trimmed);
                      setTempGeminiKey(trimmed);
                      setIsEditingGemini(false);
                    }}
                    className="absolute right-3 top-2 text-xs font-bold text-brand-600 bg-white"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                  <Lock size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-400 font-mono">
                    {geminiKey ? '••••••••••••••••' : 'Belum diatur'}
                  </span>
                </div>
              )}
              
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                * Kunci ini disimpan secara lokal di browser Anda. Kami tidak membagikan kunci ini kepada siapapun.
                Dapatkan kunci Anda di <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-brand-500 underline">Google AI Studio</a>.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">Mulai Ulang Tour Panduan</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Tampilkan kembali tour perkenalan aplikasi di sesi masuk berikutnya.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('tour_completed');
                    window.location.reload();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all font-display shadow-sm active:scale-95"
                >
                  Reset Guide
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showGeminiHelp && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 mt-2 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-indigo-900 border-b border-indigo-200 pb-1">Cara Mendapatkan API Key (Gratis)</h4>
                      <button onClick={() => setShowGeminiHelp(false)} className="text-indigo-400 hover:text-indigo-600">
                        <X size={14} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { step: '1', text: 'Buka situs Google AI Studio.', link: 'https://aistudio.google.com/app/apikey' },
                        { step: '2', text: 'Login menggunakan akun Google Anda.' },
                        { step: '3', text: 'Klik tombol "Get API Key" di bilah sisi kiri.' },
                        { step: '4', text: 'Pilih "Create API Key in new project".' },
                        { step: '5', text: 'Salin kode yang muncul, lalu tempelkan pada kotak input di atas.' }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm shrink-0 border border-indigo-100">
                            {item.step}
                          </span>
                          <p className="text-[11px] text-indigo-800 leading-relaxed">
                            {item.text}
                            {item.link && (
                              <a href={item.link} target="_blank" className="ml-1 text-brand-600 underline font-medium">Buka Link</a>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                       <p className="text-[10px] text-indigo-600 bg-white/60 p-2 rounded-lg border border-indigo-100 italic">
                         <b>Tips:</b> Kunci ini memungkinkan asisten AI kami bekerja secara instan tanpa biaya cloud pusat.
                       </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-card p-6 rounded-3xl shadow-xl shadow-slate-100/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900">
                <Globe size={22} className="text-brand-600" />
                Akun Sosial Media
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                {Object.values(accounts).filter(Boolean).length}/5 Terhubung
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Diagnostic status bar for Admin debugging */}
              {Object.keys(serverConfig).length > 0 && (
                <div className="mb-4 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Integrasi Status (Server):</p>
                    <button onClick={() => window.location.reload()} className="text-[8px] font-bold text-brand-600 hover:underline">Refresh</button>
                  </div>
                  <div className="flex flex-wrap gap-1 px-1">
                    {Object.entries(serverConfig).map(([id, info]) => (
                      <div key={id} className={cn(
                        "text-[8px] font-bold p-1 rounded border flex flex-col gap-0.5 min-w-[70px]", 
                        info.ready ? "bg-emerald-50 border-emerald-200" : "bg-slate-100 border-slate-200"
                      )}>
                        <span className={cn("uppercase", info.ready ? "text-emerald-700" : "text-slate-600")}>{id}</span>
                        <div className="flex gap-1">
                          <span className={info.id ? "text-emerald-600" : "text-rose-500"}>ID:{info.id ? '✓' : '×'}</span>
                          <span className={info.secret ? "text-emerald-600" : "text-rose-500"}>SEC:{info.secret ? '✓' : '×'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {[
                { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
                { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
                { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: 'text-slate-900', bg: 'bg-slate-50' },
                { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
                { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'text-slate-900', bg: 'bg-slate-50', isEnterprise: true },
              ].map((platform) => {
                const isConfigured = !!apiKeys[platform.id]?.clientId || !!serverConfig[platform.id]?.ready;
                const isConnected = accounts[platform.id];
                const isLocked = platform.isEnterprise && userStatus !== 'enterprise';
                
                return (
                  <div key={platform.id} className={cn(
                    "group relative p-4 rounded-2xl border transition-all",
                    isLocked ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-100 hover:border-brand-200 hover:shadow-md"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-3 rounded-xl shadow-sm transition-transform", !isLocked && "group-hover:scale-110", platform.bg, platform.color)}>
                          <platform.icon size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {platform.name}
                            {isLocked && <Lock size={12} className="text-slate-400" />}
                            {(!isConfigured || apiKeys[platform.id]) && !isLocked && (
                              <button 
                                onClick={() => startEditing(platform.id)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                                title="Konfigurasi API"
                              >
                                <Settings size={12} />
                              </button>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {isLocked ? (
                              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                <ShieldCheck size={10} /> Enterprise Only
                              </span>
                            ) : isConnected ? (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Terhubung
                              </span>
                            ) : serverConfig[platform.id]?.ready ? (
                              <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                                <ShieldCheck size={10} /> Sistem Siap (1-Klik)
                              </span>
                            ) : isConfigured ? (
                              <span className="text-[10px] font-bold text-brand-600 flex items-center gap-1">
                                <Zap size={10} /> Kunci Personal Aktif
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <AlertCircle size={10} /> Hubungi Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!isConfigured && !isLocked && (
                          <p className="text-[9px] text-slate-400 hidden lg:block mr-2 italic">Belum disetup oleh Admin</p>
                        )}
                        <button 
                          onClick={() => !isLocked && onConnect(platform.id)}
                          disabled={!isConfigured || isLocked}
                          className={cn(
                            "ml-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            isLocked
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : isConnected 
                                ? "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent" 
                                : "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-30 disabled:grayscale"
                          )}
                        >
                          {isLocked ? 'Locked' : isConnected ? 'Putuskan' : 'Hubungkan'}
                        </button>
                      </div>
                    </div>

                    {/* Edit Configuration Area */}
                    <AnimatePresence>
                      {editingPlatform === platform.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-slate-100 space-y-3 overflow-hidden"
                        >
                          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider mb-2">Manual API Configuration ({platform.name})</p>
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 mb-4">
                            <p className="text-[10px] text-amber-800 leading-relaxed">
                              <b>Mode Pengembang:</b> Anda bisa memasukkan kunci API personal jika kunci sistem tidak tersedia atau Anda ingin menggunakan aplikasi Meta Anda sendiri.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Client ID / App ID</label>
                              <input 
                                type="text"
                                value={tempKeys.clientId}
                                onChange={(e) => setTempKeys(prev => ({ ...prev, clientId: e.target.value }))}
                                placeholder={`Masukkan ${platform.name} ID`}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Client Secret / App Secret</label>
                              <input 
                                type="password"
                                value={tempKeys.clientSecret}
                                onChange={(e) => setTempKeys(prev => ({ ...prev, clientSecret: e.target.value }))}
                                placeholder={`Masukkan ${platform.name} Secret`}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => setEditingPlatform(null)}
                              className="flex-1 py-2 text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              Batal
                            </button>
                            <button 
                              onClick={handleSave}
                              className="flex-1 py-2 text-[10px] font-bold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                            >
                              Simpan & Terapkan
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl shadow-xl shadow-slate-100/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900">
                <ShoppingBag size={22} className="text-brand-600" />
                Integrasi Toko Online
              </h3>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-lg">Beta</span>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'tokopedia', name: 'Tokopedia', desc: 'Manajemen produk otomatis' },
                { id: 'shopee', name: 'Shopee', desc: 'Sync pesanan ke CRM' },
              ].map((store) => {
                const storeInfo = onlineStores[store.id] || { connected: false };
                const isConnected = storeInfo.connected;

                return (
                  <div key={store.id} className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-brand-200 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-colors",
                          isConnected ? "bg-brand-50 text-brand-600" : "bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600"
                        )}>
                          {store.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{store.name}</p>
                          {isConnected ? (
                            <div className="flex flex-col">
                              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 size={10} /> Terhubung
                              </p>
                              {storeInfo.shopEmail && (
                                <p className="text-[9px] text-slate-400 mt-0.5">{storeInfo.shopEmail}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-500">{store.desc}</p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => onConnectStore(store.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                          isConnected 
                            ? "bg-slate-100 border-transparent text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100" 
                            : "border-slate-200 hover:border-brand-500 hover:text-brand-600"
                        )}
                      >
                        {isConnected ? 'Putuskan' : 'Hubungkan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-500 italic leading-relaxed text-center">
                Hubungkan toko online Anda untuk mengaktifkan fitur pembuatan konten otomatis berbasis katalog produk.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-100/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={28} className="text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Koneksi Aman</h3>
                <p className="text-xs text-slate-500">Privasi Anda adalah prioritas kami</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                SalesKu menggunakan protokol OAuth 2.0 resmi untuk menghubungkan akun Anda. 
                Kami tidak pernah menyimpan kata sandi sosial media Anda.
              </p>
              
              <div className="grid grid-cols-1 gap-3 pt-4">
                {[
                  { label: 'Enkripsi Data', desc: 'AES-256 Bit Encryption', icon: CheckCircle2 },
                  { label: 'Jalur Resmi', desc: 'Official API Integration', icon: CheckCircle2 },
                  { label: 'Kontrol Penuh', desc: 'Revoke Access Anytime', icon: CheckCircle2 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <item.icon size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-900">{item.label}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-brand-50/50 rounded-2xl border border-brand-100 text-center">
              <p className="text-[10px] text-brand-800 font-medium mb-3">
                Sistem ini dikonfigurasi secara aman oleh administrator.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-900">
              <Bell size={18} className="text-brand-600" />
              Notifikasi & Laporan
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Laporan Performa Mingguan', desc: 'Dapatkan ringkasan statistik via email.' },
                { label: 'Notifikasi Posting Berhasil', desc: 'Pemberitahuan saat konten tayang.' },
                { label: 'Alert Keamanan Akun', desc: 'Peringatan jika ada login mencurigakan.' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                  <div className="w-12 h-6 bg-brand-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppChecker = () => {
  const [checks, setChecks] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results = [];

    // 1. Firebase Firestore Test
    try {
      const start = Date.now();
      await getDoc(doc(db, 'settings', 'global'));
      results.push({ id: 'firestore', name: 'Database Connectivity', status: 'pass', detail: `${Date.now() - start}ms response` });
    } catch (e) {
      results.push({ id: 'firestore', name: 'Database Connectivity', status: 'fail', detail: 'Could not reach Firestore' });
    }

    // 2. Auth Status
    results.push({ id: 'auth', name: 'Auth System', status: auth.currentUser ? 'pass' : 'info', detail: auth.currentUser ? `Signed in as ${auth.currentUser.email}` : 'No user logged in' });

    // 3. Storage Availability
    try {
      localStorage.setItem('diag_test', '1');
      localStorage.removeItem('diag_test');
      results.push({ id: 'storage', name: 'Local Storage', status: 'pass', detail: 'Writable & Persistent' });
    } catch (e) {
      results.push({ id: 'storage', name: 'Local Storage', status: 'fail', detail: 'Browser storage blocked' });
    }

    // 4. Gemini Configuration
    const userKey = localStorage.getItem('user_gemini_key');
    results.push({ id: 'gemini', name: 'AI Engine (Gemini)', status: userKey ? 'pass' : 'warning', detail: userKey ? 'API Key present in local storage' : 'BYOK Missing: AI features limited' });

    setChecks(results);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest text-[10px]">
          <Activity size={14} className="text-brand-600" />
          Health Check Diagnostics
        </h3>
        <button 
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-bold hover:bg-brand-700 transition-all flex items-center gap-2 shadow-sm"
        >
          {isRunning ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Run Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <ShieldAlert size={32} className="mx-auto mb-4 opacity-20" />
            <p className="text-xs px-6">Tekan "Run Diagnostics" untuk memverifikasi kondisi sistem.</p>
          </div>
        ) : (
          checks.map(check => (
            <div key={check.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm gap-4">
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  check.status === 'pass' ? "bg-emerald-50 text-emerald-600" :
                  check.status === 'fail' ? "bg-rose-50 text-rose-600" :
                  check.status === 'warning' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
                )}>
                  {check.status === 'pass' ? <ShieldCheck size={18} /> :
                   check.status === 'fail' ? <AlertCircle size={18} /> : 
                   check.status === 'warning' ? <Zap size={18} /> : <HelpCircle size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 truncate">{check.name}</p>
                  <p className="text-[9px] text-slate-500 truncate" title={check.detail}>{check.detail}</p>
                </div>
              </div>
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 whitespace-nowrap",
                check.status === 'pass' ? "text-emerald-600 bg-emerald-50" :
                check.status === 'fail' ? "text-rose-600 bg-rose-50" :
                check.status === 'warning' ? "text-amber-600 bg-amber-50" : "text-slate-400 bg-slate-50"
              )}>
                {check.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SegmentationView = ({ contacts, segments, onAddSegment }: { contacts: any[], segments: any[], onAddSegment: (segment: any) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: '',
    minAge: 18,
    maxAge: 65,
    location: '',
    gender: 'All',
    interests: [] as string[],
    minInteractions: 0,
    browsingHistory: ''
  });

  const filteredPreview = contacts.filter(c => {
    const matchesAge = (c.age || 0) >= newSegment.minAge && (c.age || 0) <= newSegment.maxAge;
    const matchesLocation = !newSegment.location || (c.location || '').toLowerCase().includes(newSegment.location.toLowerCase());
    const matchesGender = newSegment.gender === 'All' || c.gender === newSegment.gender;
    const matchesInteractions = (c.brandInteractions || 0) >= newSegment.minInteractions;
    const matchesInterests = newSegment.interests.length === 0 || newSegment.interests.some(i => (c.interests || []).includes(i));
    return matchesAge && matchesLocation && matchesGender && matchesInteractions && matchesInterests;
  });

  const handleSave = () => {
    if (!newSegment.name) return;
    onAddSegment({ ...newSegment, id: Date.now(), count: filteredPreview.length });
    setIsModalOpen(false);
    setNewSegment({
      name: '',
      minAge: 18,
      maxAge: 65,
      location: '',
      gender: 'All',
      interests: [],
      minInteractions: 0,
      browsingHistory: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Segmentasi Audiens</h2>
          <p className="text-slate-500 text-sm">Buat target audiens spesifik untuk kampanye yang lebih efektif.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
        >
          <Plus size={18} />
          <span>Buat Segmen Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segments.map(s => (
          <motion.div 
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-3xl border border-slate-100 hover:border-brand-200 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                {s.count} Kontak
              </span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{s.name}</h3>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <span>Demografis: {s.minAge}-{s.maxAge} thn, {s.location || 'Semua Lokasi'}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <span>Min. Interaksi: {s.minInteractions}+ kali</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-brand-50 hover:text-brand-600 transition-colors">
              Lihat Detail
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-600 text-white">
                <div className="flex items-center gap-3">
                  <Filter size={24} />
                  <div>
                    <h3 className="font-bold">Konfigurasi Segmen Audiens</h3>
                    <p className="text-xs text-brand-100">Tentukan kriteria penargetan Anda.</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8 no-scrollbar">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">Nama Segmen</label>
                  <input 
                    type="text" 
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    placeholder="Contoh: Millennial Jakarta Tech Enthusiast"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Demografis</h4>
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-slate-700">Rentang Usia ({newSegment.minAge} - {newSegment.maxAge})</label>
                      <div className="flex gap-4">
                        <input 
                          type="range" min="18" max="65" value={newSegment.minAge}
                          onChange={(e) => setNewSegment({ ...newSegment, minAge: parseInt(e.target.value) })}
                          className="flex-1 accent-brand-600"
                        />
                        <input 
                          type="range" min="18" max="65" value={newSegment.maxAge}
                          onChange={(e) => setNewSegment({ ...newSegment, maxAge: parseInt(e.target.value) })}
                          className="flex-1 accent-brand-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Lokasi</label>
                      <input 
                        type="text" 
                        value={newSegment.location}
                        onChange={(e) => setNewSegment({ ...newSegment, location: e.target.value })}
                        placeholder="Contoh: Jakarta, Bandung"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Jenis Kelamin</label>
                      <div className="flex gap-2">
                        {['All', 'Male', 'Female'].map(g => (
                          <button
                            key={g}
                            onClick={() => setNewSegment({ ...newSegment, gender: g })}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                              newSegment.gender === g ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-slate-100 text-slate-500"
                            )}
                          >
                            {g === 'All' ? 'Semua' : g === 'Male' ? 'Pria' : 'Wanita'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perilaku & Minat</h4>
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-slate-700">Min. Interaksi Brand ({newSegment.minInteractions})</label>
                      <input 
                        type="range" min="0" max="50" value={newSegment.minInteractions}
                        onChange={(e) => setNewSegment({ ...newSegment, minInteractions: parseInt(e.target.value) })}
                        className="w-full accent-brand-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Minat (Hobi/Preferensi)</label>
                      <div className="flex flex-wrap gap-2">
                        {['Technology', 'Business', 'Design', 'Marketing', 'Fashion', 'Travel'].map(i => (
                          <button
                            key={i}
                            onClick={() => setNewSegment(prev => ({
                              ...prev,
                              interests: prev.interests.includes(i) ? prev.interests.filter(t => t !== i) : [...prev.interests, i]
                            }))}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                              newSegment.interests.includes(i) ? "bg-brand-50 border-brand-200 text-brand-600" : "bg-white border-slate-100 text-slate-500"
                            )}
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-900">Estimasi Jangkauan</p>
                      <p className="text-xs text-brand-600">Berdasarkan kriteria yang dipilih</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-brand-600">{filteredPreview.length}</p>
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Kontak Terpilih</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!newSegment.name}
                  className="px-8 py-2 text-sm font-bold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100 disabled:opacity-50"
                >
                  Simpan Segmen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AIKeyPromptModal = ({ isOpen, onClose, onGoToSettings }: { isOpen: boolean, onClose: () => void, onGoToSettings: (showHelp: boolean) => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="h-2 bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500" />
        <div className="p-8 text-center text-balance">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-100">
            <Sparkles size={32} className="animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Tautkan API Key AI Anda</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Untuk menggunakan fitur asisten AI kami, Anda perlu menautkan Gemini API Key terlebih dahulu.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => onGoToSettings(false)}
              className="w-full bg-brand-600 text-white py-3.5 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
            >
              <Settings size={18} />
              <span>Pengaturan API Key</span>
            </button>
            <button 
              onClick={() => onGoToSettings(true)}
              className="w-full bg-slate-50 text-slate-600 py-3.5 rounded-2xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-200"
            >
              <HelpCircle size={18} className="text-brand-500" />
              <span>Butuh Bantuan?</span>
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            Nanti Saja
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const initialContacts = [
  { 
    id: 1, 
    name: 'Budi Santoso', 
    company: 'Tech Corp', 
    status: 'Hot', 
    segment: 'VIP',
    tags: ['Software', 'Enterprise'],
    email: 'budi@tech.com', 
    phone: '+62 812-3456-7890',
    lastContacted: '2 jam yang lalu',
    age: 35,
    location: 'Jakarta',
    gender: 'Male',
    interests: ['Technology', 'Business', 'Golf'],
    browsingHistory: ['/pricing', '/features/crm', '/blog/marketing-trends'],
    brandInteractions: 12,
    interactions: [
      { date: '04 Apr 2026', type: 'Email', notes: 'Mengirimkan proposal penawaran harga.' },
      { date: '02 Apr 2026', type: 'Call', notes: 'Diskusi awal mengenai kebutuhan kampanye.' }
    ],
    reminders: [
      { id: 1, title: 'Follow up proposal', date: '06 Apr 2026', completed: false }
    ]
  },
  { 
    id: 2, 
    name: 'Siti Aminah', 
    company: 'Creative Co', 
    status: 'Warm', 
    segment: 'New Leads',
    tags: ['Design', 'Retainer'],
    email: 'siti@creative.id', 
    phone: '+62 856-7890-1234',
    lastContacted: '1 hari yang lalu',
    age: 28,
    location: 'Bandung',
    gender: 'Female',
    interests: ['Design', 'Art', 'Travel'],
    browsingHistory: ['/portfolio', '/services/design'],
    brandInteractions: 4,
    interactions: [
      { date: '03 Apr 2026', type: 'Meeting', notes: 'Presentasi strategi konten media sosial.' }
    ],
    reminders: []
  },
  { 
    id: 3, 
    name: 'John Doe', 
    company: 'Global Inc', 
    status: 'Cold', 
    segment: 'Partners',
    tags: ['International', 'Tech'],
    email: 'john@global.com', 
    phone: '+1 555-0123',
    lastContacted: '3 hari yang lalu',
    age: 42,
    location: 'Singapore',
    gender: 'Male',
    interests: ['Finance', 'Strategy', 'Sailing'],
    browsingHistory: ['/about'],
    brandInteractions: 1,
    interactions: [
      { date: '01 Apr 2026', type: 'Email', notes: 'Cold outreach melalui LinkedIn.' }
    ],
    reminders: [
      { id: 2, title: 'Check partnership status', date: '10 Apr 2026', completed: false }
    ]
  },
  { 
    id: 4, 
    name: 'Ani Wijaya', 
    company: 'Retail Jaya', 
    status: 'Hot', 
    segment: 'VIP',
    tags: ['Retail', 'E-commerce'],
    email: 'ani@retailjaya.com', 
    phone: '+62 813-1122-3344',
    lastContacted: '3 jam yang lalu',
    age: 31,
    location: 'Surabaya',
    gender: 'Female',
    interests: ['Shopping', 'Fashion', 'Marketing'],
    browsingHistory: ['/pricing', '/features/automation', '/case-studies/retail'],
    brandInteractions: 25,
    interactions: [
      { date: '05 Apr 2026', type: 'Meeting', notes: 'Presentasi fitur automasi marketing.' }
    ],
    reminders: [
      { id: 3, title: 'Kirim kontrak kerjasama', date: '08 Apr 2026', completed: false }
    ]
  }
];

const CRMView = ({ addNotification, userGeminiKey }: { addNotification: (type: string, title: string, message: string) => void, userGeminiKey?: string }) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContact, setSelectedContact] = useState<typeof initialContacts[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState('All');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [crmTab, setCrmTab] = useState<'contacts' | 'segmentation'>('contacts');
  const [customSegments, setCustomSegments] = useState([
    { id: 1, name: 'Millennial Tech Jakarta', minAge: 25, maxAge: 40, location: 'Jakarta', gender: 'All', interests: ['Technology'], minInteractions: 5, count: 1 },
    { id: 2, name: 'High Engagement Female', minAge: 18, maxAge: 65, location: '', gender: 'Female', interests: [], minInteractions: 10, count: 2 }
  ]);
  
  // Automation State
  const [automationStep, setAutomationStep] = useState(1);
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const segments = ['All', 'VIP', 'New Leads', 'Partners', 'Inactive'];
  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags)));

  const targetContacts = contacts.filter(c => {
    const matchesSegment = selectedSegment === 'All' || c.segment === selectedSegment;
    const matchesTags = selectedTags.length === 0 || selectedTags.some(t => c.tags.includes(t));
    return matchesSegment && matchesTags;
  });

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Buatlah subjek dan isi email marketing profesional untuk segmen ${selectedSegment}. Tema: Penawaran Spesial dan Terima Kasih.`;
      const content = await generateMarketingContent(prompt, 'Email Newsletter', undefined, userGeminiKey);
      
      const parts = content.split('---ADVICE---')[0].split('\n\n');
      const subject = parts[0].replace(/Subject:|Subjek:/i, '').trim();
      const body = parts.slice(1).join('\n\n').trim();
      
      setCampaignSubject(subject);
      setCampaignBody(body);
      addNotification('milestone', 'AI Berhasil Menulis', 'Konten email telah dibuat secara otomatis.');
    } catch (error) {
      console.error('AI Generation error:', error);
      addNotification('alert', 'Gagal Generate', 'Terjadi kesalahan saat menggunakan AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTriggerCampaign = () => {
    setIsAutomationModalOpen(false);
    setAutomationStep(1);
    const message = scheduleDate 
      ? `Email otomatis dijadwalkan untuk ${targetContacts.length} kontak pada ${scheduleDate} jam ${scheduleTime}.`
      : `Email otomatis sedang dikirim ke ${targetContacts.length} kontak.`;
    addNotification('milestone', scheduleDate ? 'Kampanye Dijadwalkan' : 'Kampanye Dimulai', message);
    
    // Reset form
    setCampaignSubject('');
    setCampaignBody('');
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportPreview([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors } = results;
        
        if (errors.length > 0) {
          setImportError('Gagal membaca file CSV. Pastikan format file benar.');
          return;
        }

        // Basic validation: check for required headers
        const requiredHeaders = ['name', 'email'];
        const headers = Object.keys(data[0] || {});
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
          setImportError(`Header kolom tidak lengkap. Kolom wajib: ${requiredHeaders.join(', ')}`);
          return;
        }

        setImportPreview(data);
      },
      error: (error) => {
        setImportError(`Terjadi kesalahan: ${error.message}`);
      }
    });
  };

  const confirmImport = () => {
    const newContacts = importPreview.map((row, index) => ({
      id: Date.now() + index,
      name: row.name || 'Unknown',
      company: row.company || '-',
      status: row.status || 'Cold',
      segment: row.segment || 'New Leads',
      tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
      email: row.email || '',
      phone: row.phone || '-',
      lastContacted: 'Baru diimpor',
      age: row.age ? parseInt(row.age) : 30,
      location: row.location || 'Unknown',
      gender: row.gender || 'Other',
      interests: row.interests ? row.interests.split(',').map((t: string) => t.trim()) : [],
      browsingHistory: [],
      brandInteractions: 0,
      interactions: [],
      reminders: []
    }));

    setContacts([...newContacts, ...contacts]);
    setIsImportModalOpen(false);
    setImportPreview([]);
    setImportError(null);
    // Add notification
    // addNotification('lead', 'Impor Berhasil', `${newContacts.length} kontak baru telah ditambahkan.`);
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = activeSegment === 'All' || c.segment === activeSegment;
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">CRM & Leads</h1>
          <p className="text-slate-500">Kelola hubungan pelanggan dan lacak prospek bisnis Anda.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0 shrink-0">
          <button 
            onClick={() => setIsAutomationModalOpen(true)}
            className="flex-none bg-brand-50 text-brand-600 border border-brand-100 px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-100 transition-colors whitespace-nowrap active:scale-95"
          >
            <Zap size={16} />
            <span className="text-xs font-bold">Automasi</span>
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors whitespace-nowrap active:scale-95"
          >
            <Upload size={16} />
            <span className="text-xs font-bold">Impor CSV</span>
          </button>
          <button className="flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors whitespace-nowrap active:scale-95">
            <Filter size={16} />
            <span className="text-xs font-bold">Filter</span>
          </button>
          <button className="flex-none bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors shadow-md whitespace-nowrap active:scale-95">
            <Plus size={16} />
            <span className="text-xs font-bold">Tambah</span>
          </button>
        </div>
      </header>

      {/* Automation Modal */}
      <AnimatePresence>
        {isAutomationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAutomationModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-brand-600 text-white">
                <div className="flex items-center gap-3">
                  <Zap size={24} />
                  <div>
                    <h3 className="font-bold">Automasi Kampanye Email</h3>
                    <p className="text-xs text-brand-100">Kirim email massal berdasarkan segmen & tag.</p>
                  </div>
                </div>
                <button onClick={() => setIsAutomationModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                        automationStep >= step ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        {step}
                      </div>
                      {step < 3 && <div className={cn("w-12 h-0.5", automationStep > step ? "bg-brand-600" : "bg-slate-100")} />}
                    </div>
                  ))}
                </div>

                {automationStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Pilih Segmen Target</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {segments.map(s => (
                          <button
                            key={s}
                            onClick={() => setSelectedSegment(s)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                              selectedSegment === s ? "bg-brand-50 border-brand-200 text-brand-600" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Filter Berdasarkan Tag (Opsional)</label>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5",
                              selectedTags.includes(tag) ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                            )}
                          >
                            <Tag size={12} />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="text-slate-400" size={20} />
                        <span className="text-sm font-medium text-slate-600">Total Kontak Terpilih:</span>
                      </div>
                      <span className="text-lg font-bold text-brand-600">{targetContacts.length}</span>
                    </div>
                  </motion.div>
                )}

                {automationStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Subjek Email</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Penawaran Eksklusif untuk Anda"
                        value={campaignSubject}
                        onChange={(e) => setCampaignSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Isi Email (Markdown didukung)</label>
                      <textarea 
                        rows={6}
                        placeholder="Tulis pesan Anda di sini..."
                        value={campaignBody}
                        onChange={(e) => setCampaignBody(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                      />
                    </div>
                    <button 
                      onClick={handleGenerateEmail}
                      disabled={isGenerating}
                      className="w-full py-2 border-2 border-dashed border-brand-200 text-brand-600 rounded-xl text-xs font-bold hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} 
                      {isGenerating ? 'Menghasilkan Konten...' : 'Gunakan AI untuk Menulis Email'}
                    </button>
                  </motion.div>
                )}

                {automationStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Jadwal Pengiriman (Opsional)</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                          <input 
                            type="date" 
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                          <input 
                            type="time" 
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">Kosongkan jika ingin mengirim sekarang secara instan.</p>
                    </div>

                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                      <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
                        {scheduleDate ? <Clock size={32} /> : <Play size={32} fill="currentColor" />}
                      </div>
                      <h4 className="text-lg font-bold text-emerald-900">{scheduleDate ? 'Siap Dijadwalkan!' : 'Siap untuk Meluncur!'}</h4>
                      <p className="text-sm text-emerald-700 mt-1">
                        Kampanye akan dikirimkan ke {targetContacts.length} kontak terpilih 
                        {scheduleDate ? ` pada ${scheduleDate}` : ' secara instan'}.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Target Audience:</span>
                        <span className="font-bold text-slate-900">{selectedSegment} {selectedTags.length > 0 && `(${selectedTags.join(', ')})`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subjek:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{campaignSubject || '(Tanpa Subjek)'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
                <button 
                  onClick={() => automationStep > 1 ? setAutomationStep(prev => prev - 1) : setIsAutomationModalOpen(false)}
                  className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {automationStep === 1 ? 'Batal' : 'Kembali'}
                </button>
                <button 
                  onClick={() => automationStep < 3 ? setAutomationStep(prev => prev + 1) : handleTriggerCampaign()}
                  disabled={(automationStep === 2 && !campaignSubject) || isGenerating}
                  className="px-6 py-2 text-sm font-bold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100 disabled:opacity-50"
                >
                  {automationStep === 3 ? (scheduleDate ? 'Jadwalkan Kampanye' : 'Luncurkan Kampanye') : 'Lanjut'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Impor Kontak CSV</h3>
                    <p className="text-xs text-slate-500">Unggah file CSV untuk menambah kontak massal.</p>
                  </div>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
                  <AlertCircle className="text-blue-500 shrink-0" size={20} />
                  <div className="text-xs text-blue-700 space-y-1">
                    <p className="font-bold">Instruksi Format CSV:</p>
                    <p>Pastikan file CSV Anda memiliki header kolom berikut:</p>
                    <code className="block bg-white/50 p-2 rounded mt-1 font-mono">
                      name, company, email, phone, status, segment, tags
                    </code>
                    <p className="mt-2">* Kolom <span className="font-bold">name</span> dan <span className="font-bold">email</span> wajib diisi.</p>
                    <p>* Pisahkan tag dengan koma (contoh: "Tech, VIP").</p>
                  </div>
                </div>

                {/* File Upload Area */}
                {!importPreview.length ? (
                  <label className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all group">
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText size={32} />
                    </div>
                    <p className="font-bold text-slate-700">Klik atau seret file CSV ke sini</p>
                    <p className="text-xs text-slate-400 mt-1">Hanya mendukung format .csv (Max 5MB)</p>
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-700">Pratinjau Data ({importPreview.length} baris ditemukan)</p>
                      <button onClick={() => setImportPreview([])} className="text-xs text-rose-600 font-bold hover:underline">Ganti File</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="p-3 font-bold text-slate-500">Nama</th>
                            <th className="p-3 font-bold text-slate-500">Email</th>
                            <th className="p-3 font-bold text-slate-500">Perusahaan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {importPreview.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                              <td className="p-3 text-slate-700">{row.name}</td>
                              <td className="p-3 text-slate-700">{row.email}</td>
                              <td className="p-3 text-slate-700">{row.company}</td>
                            </tr>
                          ))}
                          {importPreview.length > 5 && (
                            <tr>
                              <td colSpan={3} className="p-3 text-center text-slate-400 italic">
                                ... dan {importPreview.length - 5} baris lainnya
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {importError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} />
                    {importError}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  disabled={!importPreview.length}
                  onClick={confirmImport}
                  className="px-6 py-2 text-sm font-bold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-100"
                >
                  Konfirmasi Impor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CRM Sub-tabs */}
      <div className="flex border-b border-slate-100 mb-6">
        <button 
          onClick={() => setCrmTab('contacts')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            crmTab === 'contacts' ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Daftar Kontak
          {crmTab === 'contacts' && <motion.div layoutId="crm-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
        </button>
        <button 
          onClick={() => setCrmTab('segmentation')}
          className={cn(
            "px-6 py-3 text-sm font-bold transition-all relative",
            crmTab === 'segmentation' ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Segmentasi Audiens
          {crmTab === 'segmentation' && <motion.div layoutId="crm-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />}
        </button>
      </div>

      {crmTab === 'contacts' ? (
        <>
          {/* Segmentation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {segments.map(s => (
          <button
            key={s}
            onClick={() => setActiveSegment(s)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
              activeSegment === s 
                ? "bg-brand-600 text-white shadow-lg shadow-brand-100" 
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact List */}
        <div className={cn("lg:col-span-2 space-y-4", selectedContact && "hidden lg:block")}>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari nama atau perusahaan..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">Kontak</th>
                    <th className="px-6 py-4">Status & Tags</th>
                    <th className="px-6 py-4">Terakhir Dihubungi</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredContacts.map((contact) => (
                    <tr 
                      key={contact.id} 
                      onClick={() => setSelectedContact(contact)}
                      className="hover:bg-brand-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold shrink-0">
                            {contact.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{contact.name}</p>
                            <p className="text-xs text-slate-500 truncate">{contact.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit",
                            contact.status === 'Hot' ? "bg-orange-100 text-orange-600" : 
                            contact.status === 'Warm' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                          )}>
                            {contact.status}
                          </span>
                          <div className="flex gap-1 flex-wrap">
                            {contact.tags.map(tag => (
                              <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {contact.lastContacted}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Contact Details / Interaction History */}
        <div className={cn("lg:col-span-1", !selectedContact && "hidden lg:block")}>
          {selectedContact ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar"
            >
              <button 
                onClick={() => setSelectedContact(null)}
                className="lg:hidden mb-4 text-brand-600 font-bold text-sm flex items-center gap-1"
              >
                <ChevronRight className="rotate-180" size={16} /> Kembali
              </button>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-brand-200">
                  {selectedContact.name[0]}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedContact.name}</h3>
                <p className="text-slate-500 text-sm">{selectedContact.company}</p>
                <div className="flex justify-center gap-1 mt-2">
                  {selectedContact.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <a 
                  href={`mailto:${selectedContact.email}`}
                  className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors group text-center"
                >
                  <Mail size={18} className="text-slate-400 group-hover:text-brand-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Email</span>
                </a>
                <a 
                  href={`tel:${selectedContact.phone}`}
                  className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-xl hover:bg-brand-50 transition-colors group text-center"
                >
                  <MessageSquare size={18} className="text-slate-400 group-hover:text-brand-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Call</span>
                </a>
              </div>

              {/* Reminders Section */}
              <div className="mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengingat</h4>
                  <button className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
                    <Plus size={12} /> Tambah
                  </button>
                </div>
                {selectedContact.reminders.length > 0 ? (
                  selectedContact.reminders.map(r => (
                    <div key={r.id} className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                      <Clock size={16} className="text-rose-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-900">{r.title}</p>
                        <p className="text-[10px] text-rose-600">{r.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-2">Tidak ada pengingat aktif.</p>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Riwayat Interaksi</h4>
                <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                  {selectedContact.interactions.map((interaction, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center z-10 shadow-sm">
                        {interaction.type === 'Email' ? <Mail size={14} className="text-blue-500" /> :
                         interaction.type === 'Call' ? <MessageSquare size={14} className="text-emerald-500" /> :
                         <Users size={14} className="text-brand-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{interaction.type} - {interaction.date}</p>
                        <p className="text-xs text-slate-500 mt-1">{interaction.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full mt-8 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100">
                Log Interaksi Baru
              </button>
            </motion.div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full border-dashed border-2">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <Users size={32} />
              </div>
              <p className="text-slate-400 text-sm font-medium">Pilih kontak untuk melihat detail, tag, dan pengingat.</p>
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <SegmentationView 
      contacts={contacts} 
      segments={customSegments} 
      onAddSegment={(s) => setCustomSegments([...customSegments, s])} 
    />
  )}
</div>
);
};

const PortfolioView = () => {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const categories = ['Semua', 'Social Media', 'SEO', 'Ads', 'Branding'];

  const portfolioItems = [
    {
      id: 1,
      title: 'Kampanye Ramadhan Brand Hijab A',
      category: 'Social Media',
      description: 'Strategi konten komprehensif untuk meningkatkan kesadaran merek selama bulan Ramadhan.',
      visuals: 'https://picsum.photos/seed/hijab/800/600',
      services: ['Content Planning', 'Influencer Marketing', 'AI Copywriting'],
      results: {
        roi: '3.5x',
        reach: '1.2M+',
        engagement: '15%'
      }
    },
    {
      id: 2,
      title: 'Optimasi SEO E-commerce Gadget',
      category: 'SEO',
      description: 'Meningkatkan peringkat kata kunci strategis untuk produk elektronik unggulan.',
      visuals: 'https://picsum.photos/seed/gadget/800/600',
      services: ['Keyword Research', 'Technical SEO', 'Backlink Building'],
      results: {
        organicTraffic: '+150%',
        conversions: '+45%',
        topKeywords: '25'
      }
    },
    {
      id: 3,
      title: 'Facebook Ads Skincare Launch',
      category: 'Ads',
      description: 'Peluncuran produk baru dengan penargetan audiens yang sangat spesifik menggunakan data CRM.',
      visuals: 'https://picsum.photos/seed/skincare/800/600',
      services: ['Ads Creative', 'Audience Targeting', 'A/B Testing'],
      results: {
        roas: '4.8x',
        cpa: 'Rp 12.500',
        leads: '5.000+'
      }
    }
  ];

  const filteredItems = selectedCategory === 'Semua' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Portofolio Proyek</h1>
          <p className="text-slate-500">Pamerkan hasil kerja terbaik dan pencapaian terukur tim Anda.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                selectedCategory === cat ? "bg-brand-600 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredItems.map(item => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.id} 
            className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-brand-100/20 transition-all duration-500 group"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={item.visuals} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-md text-brand-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{item.description}</p>
              
              <div className="mb-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Palette size={12} className="text-brand-500" /> Layanan Diterapkan
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.services.map(service => (
                    <span key={service} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-medium border border-slate-100">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={12} className="text-emerald-500" /> Hasil Terukur
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(item.results).map(([key, value]) => (
                    <div key={key} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 text-center">
                      <p className="text-xl font-bold text-emerald-700 leading-none">{value}</p>
                      <p className="text-[9px] font-bold text-emerald-600/70 uppercase mt-1 tracking-tight">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Placeholder for adding new project */}
        <button className="glass-card rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:bg-brand-50/30 transition-all group">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200 group-hover:scale-110 group-hover:bg-white group-hover:text-brand-600 group-hover:border-brand-200 transition-all">
            <Plus size={40} />
          </div>
          <p className="text-lg font-bold group-hover:text-brand-600 transition-colors">Tambah Proyek Baru</p>
          <p className="text-sm mt-2 opacity-60">Klik untuk mulai mendokumentasikan sukses klien Anda.</p>
        </button>
      </div>
    </div>
  );
};

const LandingPage = ({ onSelectPlan, onLogin, error, settings }: { onSelectPlan: (plan: any) => void, onLogin: () => void, error: string | null, settings: any }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-100">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100 overflow-hidden">
              {settings.branding.logoUrl ? (
                <img src={settings.branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Logo className="w-7 h-7" />
              )}
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-900">
              {settings.branding.name}
            </span>
          </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <a href="#features" className="hover:text-brand-600 transition-colors">Fitur</a>
          <a href="#pricing" className="hover:text-brand-600 transition-colors">Harga</a>
          <a href="#testimonials" className="hover:text-brand-600 transition-colors">Testimoni</a>
          {settings.landingPage.discountCode && (
            <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">
              PROMO: {settings.landingPage.discountCode} (-{settings.landingPage.discountValue}%)
            </div>
          )}
        </div>
        <button 
          onClick={onLogin}
          className="bg-brand-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-100"
        >
          Mulai Gratis
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold mb-6 border border-rose-100 flex items-center gap-3"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-brand-100">
            <Sparkles size={14} />
            <span>{settings.promoText}</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold font-display leading-[0.9] tracking-tight mb-8">
            Pemasaran <span className="text-brand-600">Otomatis</span> Tanpa Ribet.
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed">
            Tingkatkan jangkauan bisnis Anda dengan konten AI, video studio, dan alat SEO profesional dalam satu platform terpadu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLogin}
              className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200 flex items-center justify-center gap-2"
            >
              Mulai Trial 30 Hari <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <PlayCircle size={20} /> Lihat Demo
            </button>
          </div>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Bergabung dengan <span className="font-bold text-slate-900">2,500+</span> pengusaha sukses.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 bg-slate-900 rounded-[2.5rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-800">
              <img 
                src={settings.landingPage.heroImage} 
                alt="Dashboard Preview" 
                className="rounded-[1.5rem] w-full shadow-2xl"
                referrerPolicy="no-referrer"
              />
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-400/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full" />
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -right-8 top-1/4 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 z-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reach</p>
                <p className="text-lg font-bold text-slate-900">+124%</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold font-display mb-6">Satu Platform, <span className="text-brand-600">Semua Solusi</span>.</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Kami menyediakan alat yang Anda butuhkan untuk mendominasi pasar digital tanpa harus menjadi ahli teknologi.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { title: 'AI Content Studio', desc: 'Buat ribuan konten teks dalam hitungan detik dengan AI tercanggih.', icon: Sparkles, color: 'bg-brand-50 text-brand-600' },
            { title: 'Video Studio AI', desc: 'Ubah teks menjadi video profesional untuk TikTok, Reels, dan Shorts.', icon: Film, color: 'bg-blue-50 text-blue-600' },
            { title: 'Smart SEO Tools', desc: 'Optimalkan website Anda di halaman pertama Google secara otomatis.', icon: Search, color: 'bg-emerald-50 text-emerald-600' },
            { title: 'CRM Terpadu', desc: 'Kelola ribuan pelanggan dengan segmentasi cerdas dan otomatis.', icon: Users, color: 'bg-orange-50 text-orange-600' },
            { title: 'Social Planner', icon: Calendar, desc: 'Jadwalkan konten Anda di semua platform dalam satu kalender.', color: 'bg-purple-50 text-purple-600' },
            { title: 'Asset Gallery', icon: ImageIcon, desc: 'Penyimpanan cloud aman untuk semua aset visual bisnis Anda.', color: 'bg-rose-50 text-rose-600' },
          ].map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-brand-200 transition-all hover:shadow-xl group">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", f.color)}>
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold font-display mb-6">Pilih Paket <span className="text-brand-600">Sesuai Usaha</span> Anda.</h2>
          <p className="text-slate-500 text-lg">Mulai dengan trial 30 hari. Batalkan kapan saja.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Trial', price: '0', features: ['AI Content Studio (Limited)', 'Campaign Planner', 'CRM Dasar', 'Analisis Dasar'], popular: false },
            { name: 'Pro', price: settings.proPrice, features: ['Semua fitur Trial', 'Video Studio AI', 'SEO Optimizer Pro', 'Auto-Posting Terjadwal', 'Smart Time Recommendation'], popular: true },
            { name: 'Enterprise', price: settings.enterprisePrice, features: ['Semua fitur Pro', 'Akun VVIP Enterprise', 'Support Prioritas 24/7', 'Custom Branding', 'API Access'], popular: false },
          ].map((p, i) => (
            <div key={i} className={cn(
              "p-8 rounded-[2.5rem] border transition-all relative",
              p.popular ? "bg-slate-900 text-white border-slate-900 shadow-2xl scale-105 z-10" : "bg-white text-slate-900 border-slate-100 hover:border-brand-200"
            )}>
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Paling Populer
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-sm font-bold opacity-60">Rp</span>
                <span className="text-5xl font-bold font-display">{p.price}</span>
                <span className="text-sm font-bold opacity-60">/bln</span>
              </div>
              <ul className="space-y-4 mb-10">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={18} className={p.popular ? "text-brand-400" : "text-brand-600"} />
                    <span className={p.popular ? "text-slate-300" : "text-slate-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => onSelectPlan(p)}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold transition-all",
                  p.popular ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                )}
              >
                Pilih Paket {p.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-4">Dipercaya oleh <span className="text-brand-600">Ribuan Bisnis</span></h2>
            <p className="text-slate-500">Apa kata mereka yang telah menggunakan SalesKu untuk melejitkan omzet.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Budi Santoso", role: "Owner Fashion Brand", text: "SalesKu mengubah cara saya berjualan. Video Studio AI-nya sangat membantu buat konten TikTok yang viral!", img: "https://picsum.photos/seed/person1/100/100" },
              { name: "Siti Aminah", role: "Digital Marketer", text: "Fitur SEO-nya luar biasa. Website klien saya naik ke halaman pertama Google hanya dalam 2 minggu.", img: "https://picsum.photos/seed/person2/100/100" },
              { name: "Andi Wijaya", role: "UMKM Kuliner", text: "Sangat mudah digunakan bahkan untuk saya yang gaptek. CRM-nya bikin saya gampang kelola ribuan chat pelanggan.", img: "https://picsum.photos/seed/person3/100/100" }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed">"{t.text}"</p>
                <div className="flex gap-1 mt-6 text-brand-500">
                  {[...Array(5)].map((_, j) => <Sparkles key={j} size={14} fill="currentColor" />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto bg-brand-600 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-200">
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-bold font-display mb-8">Siap Melejitkan Penjualan Anda?</h2>
            <p className="text-xl text-brand-100 mb-12 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pengusaha lainnya dan rasakan kemudahan pemasaran otomatis dengan SalesKu.
            </p>
            <button 
              onClick={onLogin}
              className="bg-white text-brand-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-brand-50 transition-all shadow-xl flex items-center justify-center gap-2 mx-auto"
            >
              Mulai Trial Gratis Sekarang <ArrowRight size={24} />
            </button>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
                <Logo className="w-7 h-7" />
              </div>
              <span className="text-xl font-bold font-display text-slate-900">SalesKu</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Solusi pemasaran digital terpadu untuk pengusaha modern Indonesia. Didukung oleh teknologi AI tercanggih untuk pertumbuhan bisnis Anda.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Produk</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li><a href="#" className="hover:text-brand-600">AI Studio</a></li>
              <li><a href="#" className="hover:text-brand-600">Video Studio</a></li>
              <li><a href="#" className="hover:text-brand-600">SEO Tools</a></li>
              <li><a href="#" className="hover:text-brand-600">CRM</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li>support@salesku.id</li>
              <li>+62 812 3456 7890</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">© 2026 SalesKu. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <Instagram size={18} className="text-slate-400 hover:text-brand-600 cursor-pointer" />
            <Facebook size={18} className="text-slate-400 hover:text-brand-600 cursor-pointer" />
            <Twitter size={18} className="text-slate-400 hover:text-brand-600 cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, plan, onComplete }: { isOpen: boolean, onClose: () => void, plan: any, onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (loading) return;
    
    if (typeof window.snap === 'undefined') {
      alert("Sistem pembayaran (Midtrans Snap) belum termuat sempurna. Silakan muat ulang halaman (Refresh).");
      return;
    }

    setLoading(true);
    try {
      const priceVal = plan.price || '0';
      const cleanPriceStr = priceVal.toString().replace(/\./g, '').replace('Rp ', '');
      const cleanPrice = parseInt(cleanPriceStr);
      
      if (cleanPrice === 0) {
        onComplete();
        return;
      }
      
      const response = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id || plan.name,
          amount: cleanPrice,
          userEmail: auth.currentUser?.email,
          userName: auth.currentUser?.displayName
        }),
      });
      
      if (!response.ok) {
        let errorMessage = `Server Error: ${response.status}`;
        const responseText = await response.text();
        
        try {
          const errData = JSON.parse(responseText);
          errorMessage = errData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, might be HTML error from Vercel
          if (responseText.includes('<!DOCTYPE html>')) {
            errorMessage = "Server Vercel mengirimkan halaman HTML, kemungkinan ada kesalahan konfigurasi route atau server crash.";
          } else {
            errorMessage = responseText.slice(0, 100) || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Gagal mengurai respon dari server. Pastikan server berjalan dengan benar.");
      }
      
      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            onComplete();
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            onClose();
            alert("Pembayaran Anda sedang kami proses. Status akan diperbarui otomatis.");
          },
          onError: (err: any) => {
            console.error('Payment error:', err);
            alert("Pembayaran gagal. Silakan periksa limit atau metode pembayaran Anda.");
          },
          onClose: () => {
            console.log('Customer closed the popup without finishing the payment');
          }
        });
      } else {
        throw new Error(data.error || "Server tidak memberikan token pembayaran.");
      }
    } catch (e: any) {
      console.error("Payment setup error:", e);
      alert(`Gagal memulai pembayaran: ${e.message}. Pastikan Anda telah memasukkan "MIDTRANS_SERVER_KEY" di menu Settings > Secrets.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold font-display">Pembayaran</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Paket Dipilih</span>
              <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{plan.name}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-slate-400">Rp</span>
              <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
              <span className="text-sm font-bold text-slate-400">/bln</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">Masa Trial (30 Hari)</span>
              <span className="text-xs font-bold text-emerald-600">Gratis</span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">Tagihan Pertama (12 Mei 2026)</span>
              <span className="text-xs font-bold text-slate-900">Rp {plan.price}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Metode Pembayaran</p>
            <div 
              onClick={handlePayment}
              className="w-full flex items-center justify-between p-6 rounded-3xl bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold block leading-none mb-1">Bayar Sekarang</span>
                  <span className="text-[10px] opacity-70">QRIS, VA, E-Wallet, Kartu Kredit</span>
                </div>
              </div>
              <ArrowRight size={20} />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[10px] text-slate-400 justify-center">
            <ShieldCheck size={14} />
            <span>Pembayaran Aman & Terenkripsi oleh Midtrans Snap</span>
          </div>
        </div>

        {step === 2 && (
          <div className="hidden absolute inset-0 bg-white p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6">
              <CreditCard size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">Konfirmasi Pembayaran</h3>
            <p className="text-sm text-slate-500 mb-8">Anda akan memulai trial gratis selama 30 hari. Tagihan pertama akan ditarik secara otomatis setelah masa trial berakhir.</p>
            
            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Konfirmasi & Mulai Trial'}
            </button>
            <button onClick={() => setStep(1)} className="mt-4 text-sm font-bold text-slate-400 hover:text-slate-600">Kembali</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const GalleryView = () => {
  const [filter, setFilter] = useState('All');
  const assets = [
    { id: 1, name: 'Logo SalesKu', type: 'Image', size: '1.2 MB', url: 'https://picsum.photos/seed/sales/400/400', date: '10 Apr 2026' },
    { id: 2, name: 'Campaign Banner', type: 'Image', size: '2.5 MB', url: 'https://picsum.photos/seed/banner/800/400', date: '09 Apr 2026' },
    { id: 3, name: 'Product Demo', type: 'Video', size: '15.4 MB', url: 'https://picsum.photos/seed/video/400/225', date: '08 Apr 2026' },
    { id: 4, name: 'Brand Guidelines', type: 'Document', size: '4.8 MB', url: '', date: '07 Apr 2026' },
    { id: 5, name: 'Social Media Post 1', type: 'Image', size: '0.8 MB', url: 'https://picsum.photos/seed/post1/400/400', date: '06 Apr 2026' },
    { id: 6, name: 'Social Media Post 2', type: 'Image', size: '0.9 MB', url: 'https://picsum.photos/seed/post2/400/400', date: '05 Apr 2026' },
  ];

  const filteredAssets = assets.filter(a => filter === 'All' || a.type === filter);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Galeri Aset</h1>
          <p className="text-slate-500">Kelola semua aset visual dan dokumen pemasaran Anda.</p>
        </div>
        <button className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-md">
          <Upload size={18} />
          <span>Unggah Aset</span>
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Image', 'Video', 'Document'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
              filter === f 
                ? "bg-brand-600 text-white shadow-lg shadow-brand-100" 
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map(asset => (
          <motion.div 
            layout
            key={asset.id}
            className="glass-card rounded-2xl overflow-hidden group border border-slate-100 hover:border-brand-200 transition-all"
          >
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
              {asset.type === 'Image' ? (
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              ) : asset.type === 'Video' ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 relative">
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
                  <PlayCircle className="text-white absolute" size={48} />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <FileText size={64} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex gap-2">
                  <button className="flex-1 bg-white/20 backdrop-blur-md text-white py-2 rounded-lg text-xs font-bold hover:bg-white/30 transition-colors">
                    Pratinjau
                  </button>
                  <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900 text-sm truncate">{asset.name}</h4>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">{asset.type}</span>
                <span>•</span>
                <span>{asset.size}</span>
                <span>•</span>
                <span>{asset.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const VideoStudioView = ({ onSchedule }: { onSchedule: (content: string, type: string) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [activeFilter, setActiveFilter] = useState('none');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [is3D, setIs3D] = useState(false);

  const AI_FILTERS = [
    { id: 'none', label: 'Original', filter: 'none', icon: <RefreshCw size={14} /> },
    { id: 'cinematic', label: 'Cinematic', filter: 'contrast(1.2) saturate(0.8) brightness(0.9)', icon: <Film size={14} /> },
    { id: 'vibrant', label: 'Vibrant', filter: 'saturate(1.5) brightness(1.1)', icon: <Zap size={14} /> },
    { id: 'noir', label: 'Noir', filter: 'grayscale(1) contrast(1.5)', icon: <Moon size={14} /> },
  ];

  const handleMagicEnhance = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setActiveFilter('cinematic');
      setIsEnhancing(false);
    }, 1500);
  };

  const handleScheduleSubmit = () => {
    if (!scheduleDate || !scheduleTime) return;
    onSchedule(`Video Campaign: ${prompt}`, `Scheduled: ${scheduleDate} ${scheduleTime}`);
    setShowScheduleModal(false);
  };

  const handleGenerateVideo = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedVideo('https://picsum.photos/seed/gen-video/800/450');
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 font-display flex items-center gap-3">
          <Film className="text-brand-500" />
          Video Studio AI
        </h1>
        <p className="text-slate-500">Ubah ide Anda menjadi video profesional dalam hitungan detik.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Prompt Video</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Contoh: Video sinematik drone melintasi pegunungan saat matahari terbenam..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none min-h-[150px] resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Durasi</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none">
                  <option>5 Detik</option>
                  <option>10 Detik</option>
                  <option>15 Detik</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Aspek Rasio</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none">
                  <option>16:9 (Lanskap)</option>
                  <option>9:16 (Portrait)</option>
                  <option>1:1 (Square)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerateVideo}
              disabled={isGenerating || !prompt}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Sedang Membuat...</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h4 className="font-bold text-slate-900 mb-4 text-sm">Tips Prompt</h4>
            <ul className="space-y-3">
              {[
                'Gunakan kata sifat yang deskriptif (sinematik, dramatis).',
                'Sebutkan pencahayaan (golden hour, neon).',
                'Tentukan gerakan kamera (pan, zoom, drone).',
                'Sebutkan gaya visual (realistik, anime, 3D render).'
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center relative group">
            {generatedVideo ? (
              <>
                <img 
                  src={generatedVideo} 
                  className={cn(
                    "w-full h-full object-cover transition-all duration-700",
                    is3D && "scale-110 rotate-y-12 rotate-x-6 shadow-[20px_20px_50px_rgba(0,0,0,0.5)]"
                  )}
                  style={{ 
                    filter: AI_FILTERS.find(f => f.id === activeFilter)?.filter,
                    transform: is3D ? 'perspective(1000px) rotateY(15deg) rotateX(5deg)' : 'none'
                  }}
                  referrerPolicy="no-referrer" 
                />
                {showWatermark && (
                  <div className="absolute bottom-10 left-10 pointer-events-none opacity-60 flex items-center gap-1.5 text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-2xl">
                    <Sparkles size={16} className="text-brand-400" />
                    <span className="text-xs font-bold tracking-[0.3em] uppercase">SalesKu AI</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <button className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <Play size={32} fill="currentColor" />
                  </button>
                </div>
                <div className="absolute top-6 left-6 z-10">
                  <button 
                    onClick={handleMagicEnhance}
                    disabled={isEnhancing}
                    className="bg-brand-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-brand-700 transition-all shadow-lg flex items-center gap-2"
                  >
                    {isEnhancing ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                    MAGIC ENHANCE
                  </button>
                </div>
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <button className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Download size={16} /> Unduh
                  </button>
                  <button 
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors flex items-center gap-2"
                  >
                    <Clock size={16} /> Jadwalkan
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-12">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Film size={40} />
                </div>
                <h3 className="text-white font-bold mb-2">Belum ada video</h3>
                <p className="text-slate-500 text-sm max-w-xs">Masukkan prompt di sebelah kiri untuk mulai membuat video AI pertama Anda.</p>
              </div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8">
                <Loader2 className="animate-spin mb-4 text-brand-500" size={48} />
                <h3 className="text-xl font-bold mb-2">Menyusun Frame...</h3>
                <p className="text-slate-400 text-center text-sm max-w-xs">AI kami sedang memproses prompt Anda untuk menghasilkan visual terbaik. Ini biasanya memakan waktu 30-60 detik.</p>
                <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full mt-8 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                    className="h-full bg-brand-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filter Bar for Video */}
          {generatedVideo && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {AI_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap border",
                    activeFilter === filter.id 
                      ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-100" 
                      : "bg-slate-100 text-slate-500 border-slate-200 hover:border-brand-300"
                  )}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button 
                  onClick={() => setShowWatermark(!showWatermark)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                    showWatermark 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  )}
                >
                  <ShieldCheck size={14} />
                  {showWatermark ? 'Watermark' : '+ Watermark'}
                </button>
                <button 
                  onClick={() => setIs3D(!is3D)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                    is3D 
                      ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  )}
                >
                  <Box size={14} />
                  {is3D ? '3D Mode Aktif' : 'Ubah ke 3D'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Riwayat Video
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card rounded-xl overflow-hidden group cursor-pointer border border-slate-100">
                  <div className="aspect-video bg-slate-100 relative">
                    <img src={`https://picsum.photos/seed/vid-${i}/400/225`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-slate-900 truncate">Video Campaign {i}</p>
                    <p className="text-[8px] text-slate-500">10 Apr 2026 • 10s</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="text-brand-500" />
                Jadwalkan Video
              </h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal</label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Waktu</label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleScheduleSubmit}
                  disabled={!scheduleDate || !scheduleTime}
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
                >
                  Simpan Jadwal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AIStudioView = ({ 
  onSchedule, 
  socialAccounts,
  onPost,
  onSwitchTab,
  userStatus,
  userGeminiKey,
  onMissingKey
}: { 
  onSchedule: (content: string, type: string) => void,
  socialAccounts: Record<string, boolean>,
  onPost: (content: string, platform: string, media?: string | null) => Promise<void>,
  onSwitchTab: (tab: string) => void,
  userStatus?: string,
  userGeminiKey?: string,
  onMissingKey?: () => void
}) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState('Social Media Post');
  const [result, setResult] = useState('');
  const [caption, setCaption] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPosting, setIsPosting] = useState<string | null>(null);
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [activeFilter, setActiveFilter] = useState('none');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const AI_FILTERS = [
    { id: 'none', label: 'Original', filter: 'none', icon: <RefreshCw size={14} /> },
    { id: 'cinematic', label: 'Cinematic', filter: 'contrast(1.2) saturate(0.8) brightness(0.9)', icon: <Film size={14} /> },
    { id: 'vibrant', label: 'Vibrant', filter: 'saturate(1.5) brightness(1.1)', icon: <Zap size={14} /> },
    { id: 'noir', label: 'Noir', filter: 'grayscale(1) contrast(1.5)', icon: <Moon size={14} /> },
    { id: 'warm', label: 'Warm', filter: 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)', icon: <Sun size={14} /> },
    { id: 'cool', label: 'Cool', filter: 'saturate(1.1) hue-rotate(10deg) brightness(1.05)', icon: <Wind size={14} /> },
  ];

  const handleMagicEnhance = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setActiveFilter('cinematic');
      setIsEnhancing(false);
    }, 1500);
  };

  const handleScheduleSubmit = () => {
    if (!scheduleDate || !scheduleTime) return;
    onSchedule(caption || result, `Scheduled: ${scheduleDate} ${scheduleTime}`);
    setShowScheduleModal(false);
    setShowScheduleOptions(false);
  };

  const handleGenerate = async () => {
    if (!userGeminiKey) {
      onMissingKey?.();
      return;
    }
    setLoading(true);
    let content = await generateMarketingContent(prompt, type, mediaBase64 || undefined, userGeminiKey);
    
    // Defensive: Strip markdown code block wrappers if AI included them
    content = content.replace(/^```markdown\n/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    
    setResult(content);
    
    // Split content into caption and advice
    const parts = content.split('---ADVICE---');
    const rawCaption = parts[0]?.trim() || '';
    const rawAdvice = parts[1]?.trim() || '';

    setCaption(rawCaption);
    setAdvice(rawAdvice);
    setIsEditing(false);
    setLoading(false);
  };

  const handleAutoCaption = async (base64: string) => {
    if (!userGeminiKey) {
      onMissingKey?.();
      return;
    }
    setLoading(true);
    const content = await generateAutoCaption(base64, userGeminiKey);
    if (content) {
      setResult(content);
      setCaption(content);
      setAdvice("AI mendeteksi objek dan suasana dalam gambar Master untuk membuat caption ini secara otomatis.");
    }
    setLoading(false);
  };

  const handleTTS = () => {
    if (!caption && !result) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const textToSpeak = caption || result;
    // Remove markdown symbols for cleaner speech
    const cleanText = textToSpeak.replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setMediaBase64(base64);
      setSelectedMedia(URL.createObjectURL(file));
      setIsUploading(false);
      
      // Auto-generate caption after upload if it's an image
      if (file.type.startsWith('image')) {
        setTimeout(() => {
          handleAutoCaption(base64);
        }, 500);
      } else {
        setTimeout(() => {
          handleGenerate();
        }, 500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async (platform: string) => {
    setIsPosting(platform);
    await onPost(caption || result, platform, mediaBase64);
    setIsPosting(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 font-display flex items-center gap-3">
          <Sparkles className="text-brand-500" />
          AI Content Studio
        </h1>
        <p className="text-slate-500">Gunakan kekuatan Gemini AI untuk membuat konten pemasaran yang memikat.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-4 rounded-2xl space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Tipe Konten</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>Social Media Post</option>
                <option disabled={userStatus !== 'enterprise'}>TikTok Viral Script {userStatus !== 'enterprise' && '🔒'}</option>
                <option>Ad Copy (Facebook/IG)</option>
                <option>Email Newsletter</option>
                <option>Blog Outline</option>
                <option>Product Description</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Platform Target</label>
              <div className="flex flex-wrap gap-2">
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Instagram"><Instagram size={18} /></button>
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Facebook"><Facebook size={18} /></button>
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Twitter"><Twitter size={18} /></button>
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="LinkedIn"><Linkedin size={18} /></button>
                <button 
                  className={cn(
                    "p-2 rounded-lg text-slate-400 transition-colors relative",
                    userStatus === 'enterprise' ? "bg-slate-50 hover:text-brand-600 hover:bg-brand-50" : "bg-slate-100/50 cursor-not-allowed"
                  )} 
                  title={userStatus === 'enterprise' ? "TikTok" : "TikTok (Hanya Enterprise)"}
                  disabled={userStatus !== 'enterprise'}
                >
                  <Video size={18} />
                  {userStatus !== 'enterprise' && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm">
                      <Lock size={8} className="text-slate-400" />
                    </div>
                  )}
                </button>
                <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Email"><Mail size={18} /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {/* Media Assets Section - Moved to top for "Upload-first" workflow */}
          <div className="glass-card p-6 rounded-2xl border-2 border-brand-100 bg-brand-50/10 space-y-4 shadow-xl shadow-brand-50/20">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon size={18} className="text-brand-500" />
                Langkah 1: Unggah Bahan Visual
              </h4>
              <span className="text-[10px] bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-bold uppercase">Otomatis Generate</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Media Preview/Upload */}
              <div className={cn(
                "w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all bg-slate-50/50",
                selectedMedia ? "border-brand-400 bg-slate-900 min-h-[400px]" : "border-brand-200 hover:border-brand-400 hover:bg-brand-50/50 aspect-video"
              )}>
                {selectedMedia ? (
                  <>
                    <div className="w-full h-full flex items-center justify-center p-2">
                      {mediaType === 'video' ? (
                        <video 
                          src={selectedMedia} 
                          className={cn(
                            "max-w-full max-h-[600px] w-auto h-auto rounded-lg shadow-2xl transition-all duration-700",
                            is3D && "scale-110"
                          )}
                          style={{ 
                            filter: AI_FILTERS.find(f => f.id === activeFilter)?.filter,
                            transform: is3D ? 'perspective(1000px) rotateY(15deg) rotateX(5deg)' : 'none'
                          }}
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                        />
                      ) : (
                        <img 
                          src={selectedMedia} 
                          alt="Preview" 
                          className={cn(
                            "max-w-full max-h-[600px] w-auto h-auto rounded-lg shadow-2xl object-contain transition-all duration-700",
                            is3D && "scale-110"
                          )}
                          style={{ 
                            filter: AI_FILTERS.find(f => f.id === activeFilter)?.filter,
                            transform: is3D ? 'perspective(1000px) rotateY(15deg) rotateX(5deg)' : 'none'
                          }}
                          referrerPolicy="no-referrer" 
                        />
                      )}
                      {showWatermark && (
                        <div className="absolute bottom-6 left-6 pointer-events-none opacity-60 flex items-center gap-1.5 text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-2xl">
                          <Sparkles size={14} className="text-brand-400" />
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">SalesKu AI</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button 
                        onClick={handleMagicEnhance}
                        disabled={isEnhancing}
                        className="p-2 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-all backdrop-blur-sm flex items-center gap-2 px-4"
                      >
                        {isEnhancing ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                        <span className="text-[10px] font-bold uppercase tracking-wider">Magic Enhance</span>
                      </button>
                      {mediaType === 'image' && (
                        <button 
                          onClick={() => mediaBase64 && handleAutoCaption(mediaBase64)}
                          disabled={loading}
                          className="p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all backdrop-blur-sm flex items-center gap-2 px-4"
                        >
                          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                          <span className="text-[10px] font-bold uppercase tracking-wider">AI Auto-Caption</span>
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedMedia(null);
                          setMediaBase64(null);
                          setMediaType(null);
                          setActiveFilter('none');
                        }}
                        className="p-2 bg-rose-500/90 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors backdrop-blur-sm"
                        title="Hapus Media"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 text-center group">
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                    {isUploading ? (
                      <Loader2 className="animate-spin text-brand-500 mb-2" size={32} />
                    ) : (
                      <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                    )}
                    <p className="text-sm font-bold text-slate-700">{isUploading ? 'Sedang Memproses...' : 'Klik untuk Upload Foto/Video'}</p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">AI akan langsung membuatkan deskripsi & naskah viral untuk Master</p>
                  </label>
                )}
              </div>

              {/* Filter Bar */}
              {selectedMedia && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {AI_FILTERS.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all whitespace-nowrap border",
                        activeFilter === filter.id 
                          ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-100" 
                          : "bg-white text-slate-500 border-slate-200 hover:border-brand-300"
                      )}
                    >
                      {filter.icon}
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}

              {selectedMedia && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowWatermark(!showWatermark)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                        showWatermark 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      )}
                    >
                      <ShieldCheck size={14} />
                      {showWatermark ? 'Watermark Aktif' : 'Tambah Watermark'}
                    </button>
                    <button 
                      onClick={() => setIs3D(!is3D)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                        is3D 
                          ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      )}
                    >
                      <Box size={14} />
                      {is3D ? '3D Mode Aktif' : 'Ubah ke 3D'}
                    </button>
                    {(caption || result) && (
                      <button 
                        onClick={handleTTS}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                          isSpeaking 
                            ? "bg-brand-50 text-brand-600 border-brand-200" 
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        )}
                      >
                        <Volume2 size={14} className={isSpeaking ? "animate-pulse" : ""} />
                        {isSpeaking ? 'Berhenti' : 'Dengarkan Caption'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">AI Magic: Mempercantik visual secara otomatis</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* AI Generation Shortcut */}
              <div className="w-full rounded-2xl border border-slate-100 bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between text-white relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 p-8 opacity-10 group-hover:scale-110 transition-transform rotate-12">
                  <Zap size={80} />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-sm mb-1 flex items-center gap-2">
                    <Sparkles size={14} className="text-brand-400" />
                    Belum punya bahan?
                  </h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-md">Jangan khawatir! Master bisa membuat video sinematik hanya dengan teks di Video Studio.</p>
                </div>
                <button 
                  onClick={() => onSwitchTab('video')}
                  className="mt-4 sm:mt-0 sm:w-auto px-8 bg-brand-600 text-white py-2.5 rounded-xl text-[11px] font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-900/20"
                >
                  <Film size={14} />
                  Buka Video Studio AI
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 block">Langkah 2: Detail Tambahan (Opsional)</label>
              <span className="text-[10px] text-slate-400 italic">Kosongkan jika ingin AI menganalisis foto saja</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tambahkan detail khusus (misal: Diskon 50%, Promo Lebaran, dll)..."
              className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || (!prompt && !selectedMedia)}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition-all disabled:opacity-50 shadow-lg shadow-brand-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Sedang Menganalisis...' : 'Generate Konten Sekarang'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Caption Box - Always visible or appears on first generate */}
            <div className={cn(
              "glass-card p-6 rounded-2xl border-2 transition-all duration-500 relative overflow-hidden",
              caption ? "border-brand-200 bg-white shadow-xl shadow-brand-50/50" : "border-slate-100 bg-slate-50/50 opacity-60"
            )}>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Quote size={80} className="text-brand-600" />
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Send size={18} className={cn(caption ? "text-brand-500" : "text-slate-400")} />
                  Caption Hasil AI
                </h4>
                {caption && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className={cn(
                        "text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                        isEditing ? "bg-brand-600 text-white" : "text-brand-600 bg-brand-50 hover:bg-brand-100"
                      )}
                    >
                      <Edit3 size={14} /> {isEditing ? 'Selesai Edit' : 'Edit Caption'}
                    </button>
                    <button 
                      onClick={handleGenerate}
                      disabled={loading}
                      className="text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      Generate Ulang
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="animate-spin text-brand-500" size={40} />
                  <p className="text-sm font-bold text-slate-500 animate-pulse">AI sedang meracik caption viral untuk Master...</p>
                </div>
              ) : isEditing ? (
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-slate-50 border border-brand-100 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[150px] font-sans leading-relaxed"
                />
              ) : (
                <div className={cn(
                  "p-5 rounded-xl border font-sans leading-relaxed whitespace-pre-wrap text-sm transition-all",
                  caption ? "bg-slate-50/50 border-slate-100 text-slate-700" : "bg-white/50 border-dashed border-slate-200 text-slate-400 italic text-center py-10"
                )}>
                  {caption || "Belum ada caption. Silakan upload foto atau klik 'Generate Konten Sekarang'."}
                </div>
              )}

              {caption && !loading && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowPreview(true)}
                      className="text-xs font-bold text-brand-600 hover:bg-brand-50 px-4 py-2 rounded-xl border border-brand-100 transition-all flex items-center gap-2"
                    >
                      <Eye size={16} /> Preview Postingan
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(caption)}
                      className="text-xs font-bold text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 transition-all flex items-center gap-2"
                    >
                      <Copy size={16} /> Salin
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative">
                      <button 
                        onClick={() => setShowScheduleOptions(!showScheduleOptions)}
                        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                        title="Jadwalkan Postingan"
                      >
                        <Clock size={20} />
                      </button>
                      
                      <AnimatePresence>
                        {showScheduleOptions && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                          >
                            <button 
                              onClick={() => setShowScheduleModal(true)}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-colors flex items-center gap-2"
                            >
                              <Calendar size={14} /> Pilih Tanggal & Waktu
                            </button>
                            <button 
                              onClick={() => {
                                onSchedule(caption || result, 'Besok Pagi (08:00)');
                                setShowScheduleOptions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-600 rounded-xl transition-colors flex items-center gap-2"
                            >
                              <Clock size={14} /> Besok Pagi (08:00)
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={() => handlePost('instagram')}
                      disabled={isPosting === 'instagram'}
                      className="p-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                      title="Post ke Instagram"
                    >
                      {isPosting === 'instagram' ? <Loader2 className="animate-spin" size={20} /> : <Instagram size={20} />}
                    </button>
                    <button 
                      onClick={() => handlePost('tiktok')}
                      disabled={isPosting === 'tiktok'}
                      className="p-2.5 bg-black text-white rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                      title="Post ke TikTok"
                    >
                      {isPosting === 'tiktok' ? <Loader2 className="animate-spin" size={20} /> : <Video size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Advice Section - Displayed below without the caption */}
            <AnimatePresence>
              {advice && !loading && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-6 rounded-2xl border border-slate-100 bg-slate-50/30"
                >
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-amber-500" />
                    Saran & Strategi AI
                  </h4>
                  <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
                    <Markdown>{advice}</Markdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="text-brand-500" />
                Jadwalkan Postingan
              </h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tanggal</label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Waktu</label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleScheduleSubmit}
                  disabled={!scheduleDate || !scheduleTime}
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
                >
                  Simpan Jadwal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Media Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-slate-900"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowPreview(false)}
                className="absolute top-12 right-4 z-50 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all border border-white/30"
                title="Tutup Preview"
              >
                <X size={20} />
              </button>

              {/* Mock Phone Header */}
              <div className="h-10 bg-slate-900 flex items-center justify-center">
                <div className="w-20 h-4 bg-slate-800 rounded-full" />
              </div>
              
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-brand-700" />
                  <span className="text-xs font-bold">salesku</span>
                </div>
                <MoreVertical size={16} className="text-slate-400" />
              </div>

              <div className="aspect-square bg-slate-100">
                {selectedMedia ? (
                  mediaType === 'video' ? (
                    <video src={selectedMedia} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img src={selectedMedia} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={48} />
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex gap-4">
                  <Instagram size={20} className="text-slate-700" />
                  <MessageSquare size={20} className="text-slate-700" />
                  <Send size={20} className="text-slate-700" />
                </div>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold mr-2">nexus_suite</span>
                  <span className="text-slate-700 whitespace-pre-wrap">{caption}</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">1 Menit yang lalu</p>
              </div>

              <button 
                onClick={() => setShowPreview(false)}
                className="w-full p-4 bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Tutup Preview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminPanelView = ({ 
  settings, 
  onUpdateSettings,
  secrets,
  onUpdateSecrets,
  addNotification
}: { 
  settings: any, 
  onUpdateSettings: (s: any) => void,
  secrets: any,
  onUpdateSecrets: (s: any) => void,
  addNotification: (type: string, title: string, message: string) => void
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [newVvip, setNewVvip] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'landing' | 'branding' | 'oauth' | 'status'>('users');
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    return () => unsubscribe();
  }, []);

  const addVvip = () => {
    if (!newVvip) return;
    onUpdateSettings({ ...settings, vvipEmails: [...settings.vvipEmails, newVvip] });
    setNewVvip('');
  };

  const removeVvip = (email: string) => {
    onUpdateSettings({ ...settings, vvipEmails: settings.vvipEmails.filter((e: string) => e !== email) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (field === 'logo') {
        onUpdateSettings({ ...settings, branding: { ...settings.branding, logoUrl: base64 } });
      } else if (field === 'hero') {
        onUpdateSettings({ ...settings, landingPage: { ...settings.landingPage, heroImage: base64 } });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-display flex items-center gap-3">
            <ShieldCheck className="text-rose-600 shrink-0" />
            Super Admin Panel
          </h1>
          <p className="text-slate-500 text-xs md:text-sm">Kelola seluruh ekosistem SalesKu dari satu tempat.</p>
        </div>
        <div className="relative group">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
            <div className="flex items-center gap-1.5 min-w-max">
              {[
                { id: 'users', label: 'Pengguna', icon: Users },
                { id: 'landing', label: 'Landing Page', icon: LayoutDashboard },
                { id: 'branding', label: 'Branding', icon: Palette },
                { id: 'oauth', label: 'OAuth', icon: Lock },
                { id: 'status', label: 'Status', icon: Activity },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all whitespace-nowrap active:scale-95",
                    activeTab === tab.id 
                      ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
                >
                  <tab.icon size={14} className={cn(activeTab === tab.id ? "text-brand-600" : "text-slate-400")} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {/* Subtle scroll hint gradient for mobile */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 to-transparent pointer-events-none rounded-r-2xl md:hidden opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-4 md:p-6 rounded-3xl">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users size={18} /> Daftar Pengguna
                </h3>
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Pengguna</th>
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Bergabung</th>
                        <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((user) => (
                        <tr key={user.id} className="group">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                {user.displayName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                                <p className="text-[10px] text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                              user.role === 'admin' ? "bg-rose-100 text-rose-600" :
                              user.role === 'enterprise' ? "bg-purple-100 text-purple-600" :
                              user.role === 'pro' ? "bg-brand-100 text-brand-600" : "bg-amber-100 text-amber-600"
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 text-xs text-slate-500">
                            {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={async () => {
                                  const newRole = user.role === 'admin' ? 'pro' : 'admin';
                                  try {
                                    await setDoc(doc(db, 'users', user.uid), { role: newRole }, { merge: true });
                                    addNotification('milestone', 'Role Diperbarui', `Berhasil mengubah role ${user.displayName} menjadi ${newRole}.`);
                                  } catch (error) {
                                    handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
                                  }
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                                title="Ubah Role"
                              >
                                <ShieldCheck size={16} />
                              </button>
                              <button 
                                onClick={() => setUserToDelete(user)}
                                className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                                title="Hapus User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                          {user.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.displayName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Status & Terdaftar</p>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                              user.role === 'admin' ? "bg-rose-100 text-rose-600" :
                              user.role === 'enterprise' ? "bg-purple-100 text-purple-600" :
                              user.role === 'pro' ? "bg-brand-100 text-brand-600" : "bg-amber-100 text-amber-600"
                            )}>
                              {user.role}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              const newRole = user.role === 'admin' ? 'pro' : 'admin';
                              try {
                                await setDoc(doc(db, 'users', user.uid), { role: newRole }, { merge: true });
                                addNotification('milestone', 'Role Diperbarui', `Berhasil mengubah role ${user.displayName} menjadi ${newRole}.`);
                              } catch (error) {
                                handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-brand-600 shadow-sm border border-slate-100"
                          >
                            <ShieldCheck size={14} />
                          </button>
                          <button 
                            onClick={() => setUserToDelete(user)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-rose-600 shadow-sm border border-slate-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl space-y-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Settings size={18} /> Pengaturan Paket
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2">Harga Paket Pro (Rp)</label>
                    <input 
                      type="text" 
                      value={settings.proPrice}
                      onChange={(e) => onUpdateSettings({ ...settings, proPrice: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2">Harga Enterprise (Rp)</label>
                    <input 
                      type="text" 
                      value={settings.enterprisePrice}
                      onChange={(e) => onUpdateSettings({ ...settings, enterprisePrice: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Star size={18} className="text-purple-500" /> Kelola VVIP
                </h3>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Email VVIP baru..."
                    value={newVvip}
                    onChange={(e) => setNewVvip(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <button 
                    onClick={addVvip}
                    className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {settings.vvipEmails.map((email: string) => (
                    <div key={email} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg text-xs">
                      <span className="font-medium text-slate-700">{email}</span>
                      <button onClick={() => removeVvip(email)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'landing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 rounded-3xl space-y-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <LayoutDashboard size={18} /> Kustomisasi Landing Page
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-4">Hero Image (Preview Dashboard)</label>
                    <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 group">
                      <img 
                        src={settings.landingPage.heroImage} 
                        alt="Hero Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                        <Upload size={32} className="mb-2" />
                        <span className="font-bold">Ganti Gambar Hero</span>
                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'hero')} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-2">Kode Diskon</label>
                      <input 
                        type="text" 
                        value={settings.landingPage.discountCode}
                        onChange={(e) => onUpdateSettings({ ...settings, landingPage: { ...settings.landingPage, discountCode: e.target.value } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-2">Nilai Diskon (%)</label>
                      <input 
                        type="number" 
                        value={settings.landingPage.discountValue}
                        onChange={(e) => onUpdateSettings({ ...settings, landingPage: { ...settings.landingPage, discountValue: parseInt(e.target.value) } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl bg-slate-900 text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-brand-400" /> Promo Banner
                </h3>
                <textarea 
                  value={settings.promoText}
                  onChange={(e) => onUpdateSettings({ ...settings, promoText: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 resize-none h-32"
                  placeholder="Tulis teks promo yang akan muncul di dashboard pengguna..."
                />
              </div>
              <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100">
                <h4 className="font-bold text-brand-900 text-sm mb-2">Tips Admin</h4>
                <p className="text-xs text-brand-700 leading-relaxed">
                  Semua perubahan pada Landing Page akan langsung terlihat oleh calon pengguna baru. Pastikan gambar hero memiliki rasio 16:9 untuk tampilan terbaik.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 rounded-3xl space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Palette size={18} /> Identitas Brand
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Nama Aplikasi</label>
                    <input 
                      type="text" 
                      value={settings.branding.name}
                      onChange={(e) => onUpdateSettings({ ...settings, branding: { ...settings.branding, name: e.target.value } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Warna Utama</label>
                    <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={settings.branding.primaryColor}
                        onChange={(e) => onUpdateSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                        className="w-12 h-12 rounded-xl border-none cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={settings.branding.primaryColor}
                        onChange={(e) => onUpdateSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Logo Aplikasi</label>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center p-4 border border-slate-200 overflow-hidden">
                      {settings.branding.logoUrl ? (
                        <img src={settings.branding.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Logo className="w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-xs text-slate-500 leading-relaxed">Gunakan logo dengan latar belakang transparan (PNG/SVG) untuk hasil terbaik.</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all cursor-pointer font-bold text-xs shadow-sm">
                        <ImageIcon size={16} />
                        Unggah Logo Baru
                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-brand-50 rounded-3xl border border-brand-100">
                <h4 className="font-bold text-brand-900 text-sm mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} /> Keamanan Aset
                </h4>
                <p className="text-xs text-brand-700 leading-relaxed">
                  Semua aset visual disimpan dengan aman di sistem cloud kami. Pastikan ukuran file tidak melebihi 2MB.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'oauth' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 rounded-3xl space-y-8">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Lock size={18} /> Konfigurasi OAuth & API
                </h3>

                <div className="space-y-8">
                  {Object.keys(secrets).map((platform) => (
                    <div key={platform} className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 capitalize flex items-center gap-2">
                          {platform} API Keys
                        </h4>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          secrets[platform].clientId ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                        )}>
                          {secrets[platform].clientId ? 'Configured' : 'Not Set'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Client ID / App ID</label>
                          <input 
                            type="text" 
                            value={secrets[platform].clientId}
                            onChange={(e) => onUpdateSecrets({ ...secrets, [platform]: { ...secrets[platform], clientId: e.target.value } })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder={`Masukkan ${platform} Client ID`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Client Secret</label>
                          <div className="relative">
                            <input 
                              type="password" 
                              value={secrets[platform].clientSecret}
                              onChange={(e) => onUpdateSecrets({ ...secrets, [platform]: { ...secrets[platform], clientSecret: e.target.value } })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                              placeholder={`Masukkan ${platform} Client Secret`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl border-2 border-brand-100">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900">
                  <ShieldCheck size={18} className="text-brand-600" /> Redirect URIs
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Salin URL di bawah ini dan tempelkan ke <b>"Valid OAuth Redirect URIs"</b> di Developer Portal masing-masing platform.
                </p>
                <div className="space-y-4">
                  {['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'].map(p => (
                    <div key={p} className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p} Callback</span>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-600 truncate">
                          {`${window.location.origin}/auth/${p}/callback`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="glass-card p-8 rounded-3xl bg-white shadow-xl shadow-slate-100/50">
            <AppChecker />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setUserToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
                deleteError ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
              )}>
                {deleteError ? <AlertCircle size={32} /> : <Trash2 size={32} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {deleteError ? "Gagal Menghapus" : "Hapus Pengguna?"}
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                {deleteError 
                  ? deleteError 
                  : <>Apakah Anda yakin ingin menghapus <span className="font-bold text-slate-900">{userToDelete.displayName || userToDelete.email}</span>? Tindakan ini tidak dapat dibatalkan.</>
                }
              </p>

              {deleteError ? (
                <button 
                  onClick={() => {
                    setUserToDelete(null);
                    setDeleteError(null);
                  }}
                  className="w-full px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  Tutup
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    disabled={isDeleting}
                    onClick={() => setUserToDelete(null)}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button 
                    disabled={isDeleting}
                    onClick={async () => {
                      setIsDeleting(true);
                      setDeleteError(null);
                      try {
                        const targetId = userToDelete.id || userToDelete.uid;
                        if (!targetId) throw new Error("ID pengguna tidak ditemukan");
                        
                        await deleteDoc(doc(db, 'users', targetId));
                        addNotification('alert', 'User Dihapus', `Berhasil menghapus user ${userToDelete.displayName || userToDelete.email}.`);
                        setUserToDelete(null);
                      } catch (error: any) {
                        console.error("Delete user error:", error);
                        if (error.message?.includes('permission-denied')) {
                          setDeleteError("Anda tidak memiliki izin (Permission Denied) untuk menghapus pengguna ini. Pastikan Anda adalah Admin.");
                        } else {
                          setDeleteError("Terjadi kesalahan sistem saat mencoba menghapus pengguna. Silakan coba lagi.");
                        }
                        // Still call handleFirestoreError for logging purpose but don't rethrow to keep UI responsive
                        try { handleFirestoreError(error, OperationType.DELETE, `users/${userToDelete.id || userToDelete.uid}`); } catch(e) {}
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Ya, Hapus'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StoreConnectModal = ({ 
  store, 
  onClose, 
  onComplete 
}: { 
  store: string, 
  onClose: () => void, 
  onComplete: (shopEmail: string, shopId: string) => void 
}) => {
  const [email, setEmail] = useState('');
  const [shopId, setShopId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    // Simulate API connection/verification
    setTimeout(() => {
      onComplete(email, shopId);
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 capitalize">Hubungkan {store}</h3>
              <p className="text-sm text-slate-500">Gunakan akun toko Anda untuk sinkronisasi data.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="text-emerald-600 shrink-0" size={18} />
            <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
              Email toko boleh berbeda dengan akun login SalesKu Anda. Kami akan menggunakan akun ini khusus untuk sinkronisasi produk dan pesanan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Email Akun Toko</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="email@tokoanda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all pl-10"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">ID Toko / Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: toko_sukses_jaya"
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all pl-10"
                />
                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSyncing}
              className="w-full bg-brand-600 text-white font-bold py-4 rounded-2xl hover:bg-brand-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {isSyncing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memverifikasi Akun...
                </>
              ) : (
                'Hubungkan Sekarang'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const UserTour = ({ 
  userStatus, 
  onClose,
  onSwitchTab 
}: { 
  userStatus: string, 
  onClose: () => void,
  onSwitchTab: (tab: string) => void
}) => {
  const [step, setStep] = useState(0);

  const tourData = {
    trial: [
      {
        title: "Selamat Datang di SalesKu Trial!",
        desc: "Mari kita mulai perjalanan Anda menguasai pemasaran digital.",
        icon: <PartyPopper className="text-brand-500" />,
        action: () => onSwitchTab('dashboard')
      },
      {
        title: "Konfigurasi AI Anda",
        desc: "Pertama, hubungkan Gemini API Key Anda di menu Settings agar asisten AI bisa bekerja.",
        icon: <Wand2 className="text-brand-500" />,
        action: () => onSwitchTab('settings')
      },
      {
        title: "Buat Konten Pertama",
        desc: "Gunakan AI Studio untuk membuat postingan media sosial dalam hitungan detik.",
        icon: <Sparkles className="text-brand-500" />,
        action: () => onSwitchTab('ai')
      }
    ],
    pro: [
      {
        title: "Selamat Datang, Pro User!",
        desc: "Anda sekarang memiliki akses ke fitur penjadwalan dan automasi penuh.",
        icon: <ShieldCheck className="text-brand-500" />,
        action: () => onSwitchTab('dashboard')
      },
      {
        title: "Penjadwalan Konten (Planner)",
        desc: "Atur kalender konten Anda untuk satu bulan penuh di menu Planner.",
        icon: <Calendar className="text-brand-500" />,
        action: () => onSwitchTab('planner')
      },
      {
        title: "Automasi Email CRM",
        desc: "Gunakan AI untuk mengirim email personal ke ratusan leads secara otomatis.",
        icon: <Mail className="text-brand-500" />,
        action: () => onSwitchTab('crm')
      }
    ],
    enterprise: [
      {
        title: "Portal Enterprise SalesKu",
        desc: "Solusi skala besar untuk bisnis yang ingin mendominasi pasar.",
        icon: <ShieldAlert className="text-brand-500" />,
        action: () => onSwitchTab('dashboard')
      },
      {
        title: "Eksklusif: TikTok Marketing",
        desc: "Hubungkan akun TikTok Anda dan buat konten viral dengan skrip berbasis AI.",
        icon: <Music2 className="text-brand-500" />,
        action: () => onSwitchTab('settings')
      },
      {
        title: "Video Studio AI",
        desc: "Buat video promosi sinematik tanpa perlu software editing berat.",
        icon: <Film className="text-brand-500" />,
        action: () => onSwitchTab('video')
      }
    ],
    admin: [
      {
        title: "Admin Panel Overview",
        desc: "Kelola konfigurasi global aplikasi, harga, dan rahasia API.",
        icon: <ShieldCheck className="text-brand-500" />,
        action: () => onSwitchTab('admin')
      }
    ]
  };

  const steps = tourData[userStatus as keyof typeof tourData] || tourData.trial;
  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] p-6 md:p-10 max-w-sm w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
          <motion.div 
            className="h-full bg-brand-600"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={() => {
            localStorage.setItem('tour_completed', 'true');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-3xl">
            {currentStep.icon}
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{currentStep.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{currentStep.desc}</p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <button 
              onClick={() => {
                currentStep.action();
                if (step < steps.length - 1) {
                  setStep(step + 1);
                } else {
                  localStorage.setItem('tour_completed', 'true');
                  onClose();
                }
              }}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg"
            >
              {step < steps.length - 1 ? "Lanjut" : "Selesai"}
            </button>
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="w-full text-slate-400 text-sm font-bold hover:text-slate-600"
              >
                Kembali
              </button>
            )}
          </div>
          
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === step ? "bg-brand-600 w-4" : "bg-slate-200"
                )} 
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TrialExpiredView = ({ onUpgrade }: { onUpgrade: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200 border border-slate-100 text-center"
      >
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4 font-display">Masa Trial Habis</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Masa percobaan 30 hari Anda telah berakhir. Jangan khawatir, semua data CRM dan konten Anda tetap aman bersama kami.
        </p>
        <div className="space-y-4">
          <button 
            onClick={onUpgrade}
            className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
          >
            Upgrade ke Pro Sekarang <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => signOut(auth)}
            className="w-full py-4 text-slate-400 font-medium hover:text-slate-600 transition-colors"
          >
            Keluar Akun
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PrivacyPolicyView = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Kebijakan Privasi SalesKu</h1>
      <p className="text-slate-500 mb-8 text-sm">Terakhir diperbarui: 15 April 2026</p>
      
      <div className="space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Informasi yang Kami Kumpulkan</h2>
          <p className="text-sm">SalesKu mengumpulkan informasi dasar akun saat Anda masuk menggunakan Google, Facebook, atau Instagram untuk keperluan sinkronisasi konten pemasaran Anda.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. Penggunaan Data</h2>
          <p className="text-sm">Data Anda digunakan secara eksklusif untuk memfasilitasi penjadwalan konten, analisis performa media sosial, dan manajemen kontak CRM dalam aplikasi ini.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. Keamanan Data</h2>
          <p className="text-sm">Kami menggunakan enkripsi standar industri untuk melindungi token akses dan informasi sensitif Anda. Kami tidak pernah membagikan data Anda kepada pihak ketiga tanpa izin eksplisit.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Penghapusan Data</h2>
          <p className="text-sm">Pengguna dapat meminta penghapusan data kapan saja melalui menu pengaturan atau dengan menghubungi email kontak kami.</p>
        </section>
      </div>
      
      <div className="mt-10 pt-10 border-t border-slate-100">
        <p className="text-xs text-slate-400">SalesKu - Solusi Pemasaran Digital Terpadu</p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanding, setIsLanding] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ name: 'Pro', price: '75.000' });
  const [userStatus, setUserStatus] = useState<'guest' | 'trial' | 'pro' | 'enterprise' | 'admin'>('guest');
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const [showAIKeyPrompt, setShowAIKeyPrompt] = useState(false);
  const [settingsShowHelp, setSettingsShowHelp] = useState(false);
  const [appSettings, setAppSettings] = useState({
    proPrice: '75.000',
    enterprisePrice: '250.000',
    promoText: 'Diskon 20% untuk paket tahunan!',
    vvipEmails: ['vvip1@example.com', 'vvip2@example.com'],
    branding: {
      name: 'SalesKu',
      logoUrl: '',
      primaryColor: '#0066FF'
    },
    landingPage: {
      heroImage: 'https://picsum.photos/seed/dashboard/800/500',
      discountCode: 'SALESKU20',
      discountValue: 20
    }
  });

  const [secrets, setSecrets] = useState<Record<string, any>>({
    facebook: { clientId: '', clientSecret: '' },
    instagram: { clientId: '', clientSecret: '' },
    twitter: { clientId: '', clientSecret: '' },
    linkedin: { clientId: '', clientSecret: '' },
    tiktok: { clientId: '', clientSecret: '' },
  });

  // Sync settings from Firestore
  useEffect(() => {
    const globalRef = doc(db, 'settings', 'global');
    const unsubGlobal = onSnapshot(globalRef, (snap) => {
      if (snap.exists()) {
        setAppSettings(prev => ({ ...prev, ...snap.data() }));
      }
    });

    return () => unsubGlobal();
  }, []);

  // Sync secrets from Firestore (Admin only)
  useEffect(() => {
    if (userStatus !== 'admin') return;
    
    const secretsRef = doc(db, 'settings', 'secrets');
    const unsubSecrets = onSnapshot(secretsRef, (snap) => {
      if (snap.exists()) {
        setSecrets(snap.data());
      }
    });

    return () => unsubSecrets();
  }, [userStatus]);

  const updateGlobalSettings = async (newSettings: any) => {
    setAppSettings(newSettings);
    try {
      await setDoc(doc(db, 'settings', 'global'), newSettings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  };

  const updateSecrets = async (newSecrets: any) => {
    setSecrets(newSecrets);
    try {
      await setDoc(doc(db, 'settings', 'secrets'), newSecrets, { merge: true });
      
      // Update server's dynamic config for each platform
      for (const platform of Object.keys(newSecrets)) {
        const { clientId, clientSecret } = newSecrets[platform];
        if (clientId && clientSecret) {
          await fetch('/api/auth/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, clientId, clientSecret })
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/secrets');
    }
  };

  // Super Admin Email
  const SUPER_ADMIN_EMAIL = 'poedji103@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Force admin role if email matches
            if (user.email === SUPER_ADMIN_EMAIL && userData.role !== 'admin') {
              await setDoc(userRef, { role: 'admin' }, { merge: true });
              setUserStatus('admin');
            } else {
              setUserStatus(userData.role);
            }
            setTrialEndsAt(userData.trialEndsAt || null);
            setIsLanding(false);
          } else {
            // New User Logic
            const isAdmin = user.email === SUPER_ADMIN_EMAIL;
            const isVVIP = appSettings.vvipEmails.includes(user.email || '');
            const initialRole = isAdmin ? 'admin' : (isVVIP ? 'enterprise' : 'trial');
            const trialExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            
            const newUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: initialRole,
              createdAt: serverTimestamp(),
              trialEndsAt: trialExpiry
            };
            
            await setDoc(userRef, newUser);
            setUserStatus(initialRole);
            setTrialEndsAt(trialExpiry);
            setIsLanding(false);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setIsLanding(true);
        setUserStatus('guest');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [appSettings.vvipEmails]);

  useEffect(() => {
    if (currentUser && sessionStorage.getItem('pending_plan')) {
      const plan = JSON.parse(sessionStorage.getItem('pending_plan') || '{}');
      setSelectedPlan(plan);
      setIsPaymentOpen(true);
      sessionStorage.removeItem('pending_plan');
    }
  }, [currentUser]);

  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/privacy') {
        setActiveTab('privacy');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    if (currentUser && !isLanding && !localStorage.getItem('tour_completed')) {
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000); // Beri jeda 1 detik agar transisi landing selesai
      return () => clearTimeout(timer);
    }
  }, [currentUser, isLanding]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setLoginError('Jendela login ditutup sebelum selesai. Silakan coba lagi.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore duplicate requests
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError('Domain ini belum diizinkan di Firebase. Silakan tambahkan domain vercel.app Anda ke "Authorized Domains" di Firebase Console Anda.');
      } else {
        setLoginError('Gagal masuk. Pastikan koneksi internet Anda stabil atau domain sudah diizinkan di Firebase.');
        console.error("Login Error:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLanding(true);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const addNotification = (type: string, title: string, message: string) => {
    const newNotif = {
      id: Date.now(),
      type: type as any,
      title,
      message,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    if (!currentUser) {
      sessionStorage.setItem('pending_plan', JSON.stringify(plan));
      handleLogin();
    } else {
      setIsPaymentOpen(true);
    }
  };

  const handlePaymentComplete = async () => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        const role = selectedPlan.name.toLowerCase();
        await setDoc(userRef, { role: role }, { merge: true });
        setUserStatus(role as any);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
    setIsPaymentOpen(false);
    setIsLanding(false);
    addNotification('milestone', 'Pembayaran Berhasil!', `Selamat! Akun Anda kini aktif sebagai paket ${selectedPlan.name}.`);
  };

  const [userGeminiKey, setUserGeminiKey] = useState<string>(() => {
    return localStorage.getItem('user_gemini_key') || '';
  });

  useEffect(() => {
    localStorage.setItem('user_gemini_key', userGeminiKey);
  }, [userGeminiKey]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'post', title: 'Postingan Siap!', message: 'Postingan Instagram Anda dijadwalkan tayang dalam 1 jam.', time: '5m ago', read: false },
    { id: 2, type: 'milestone', title: 'Target Tercapai!', message: 'Kampanye "Promo Ramadhan" mencapai 10k reach.', time: '2h ago', read: false },
    { id: 3, type: 'lead', title: 'Prospek Baru', message: 'Budi Santoso baru saja mengisi formulir kontak.', time: '5h ago', read: true },
  ]);

  const [socialAccounts, setSocialAccounts] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('social_accounts');
    return saved ? JSON.parse(saved) : {
      instagram: false,
      facebook: false,
      twitter: false,
      linkedin: false,
      tiktok: false
    };
  });

  const [connectingStore, setConnectingStore] = useState<string | null>(null);

  const [onlineStores, setOnlineStores] = useState<Record<string, {
    connected: boolean;
    shopEmail?: string;
    shopId?: string;
    lastSync?: string;
  }>>(() => {
    const saved = localStorage.getItem('online_stores');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Handle legacy boolean format
      if (typeof Object.values(parsed)[0] === 'boolean') {
        const migrated: Record<string, any> = {};
        Object.keys(parsed).forEach(key => {
          migrated[key] = { connected: parsed[key] };
        });
        return migrated;
      }
      return parsed;
    }
    return {
      tokopedia: { connected: false },
      shopee: { connected: false }
    };
  });

  const [apiKeys, setApiKeys] = useState<Record<string, { clientId: string, clientSecret: string }>>(() => {
    const saved = localStorage.getItem('social_api_keys');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('social_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const [serverConfig, setServerConfig] = useState<Record<string, { ready: boolean, id: boolean, secret: boolean }>>({});

  useEffect(() => {
    const checkServerConfig = async (retries = 5) => {
      const endpoint = '/api/auth/status';
      try {
        console.log(`[SalesKu] Checking server config at ${endpoint}...`);
        
        // Wait a bit longer on first boot
        if (retries === 5) await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await fetch(endpoint, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[SalesKu] Server config loaded successfully');
          setServerConfig(data);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[SalesKu] Fetch attempt failed: ${message}`);
        
        if (retries > 0) {
          const delay = (6 - retries) * 1500; // Progressive backoff
          console.log(`[SalesKu] Retrying in ${delay}ms... (${retries} left)`);
          setTimeout(() => checkServerConfig(retries - 1), delay);
        } else {
          console.error('[SalesKu] Max retries reached. Server might be offline or unreachable.');
        }
      }
    };
    checkServerConfig();
  }, []);

  useEffect(() => {
    localStorage.setItem('social_accounts', JSON.stringify(socialAccounts));
  }, [socialAccounts]);

  useEffect(() => {
    localStorage.setItem('online_stores', JSON.stringify(onlineStores));
  }, [onlineStores]);

  useEffect(() => {
    localStorage.setItem('social_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { platform } = event.data;
        setSocialAccounts(prev => ({ ...prev, [platform]: true }));
        addNotification('milestone', 'Akun Terhubung', `Berhasil menghubungkan akun ${platform}.`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSaveApiKeys = async (platform: string, clientId: string, clientSecret: string) => {
    setApiKeys(prev => ({
      ...prev,
      [platform]: { clientId, clientSecret }
    }));

    try {
      await fetch('/api/auth/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, clientId, clientSecret })
      });
      addNotification('milestone', 'Konfigurasi Disimpan', `API Key untuk ${platform} berhasil diperbarui.`);
    } catch (error) {
      console.error('Save config error:', error);
    }
  };

  const handleConnectSocial = async (platform: string) => {
    if (socialAccounts[platform]) {
      setSocialAccounts(prev => ({ ...prev, [platform]: false }));
      addNotification('post', 'Akun Terputus', `Berhasil memutuskan akun ${platform}.`);
      return;
    }

    try {
      const response = await fetch(`/api/auth/${platform}/url`);
      if (!response.ok) {
        const errorData = await response.json();
        addNotification('alert', 'Konfigurasi Diperlukan', errorData.error || `Gagal mendapatkan URL autentikasi untuk ${platform}.`);
        return;
      }
      const { url } = await response.json();
      if (url) {
        window.open(url, 'oauth_popup', 'width=600,height=700');
      } else {
        throw new Error("URL tidak ditemukan dalam respon server");
      }
    } catch (error) {
      console.error('OAuth error:', error);
      addNotification('alert', 'Kesalahan Koneksi', `Gagal menghubungkan ke ${platform}. Silakan periksa koneksi internet atau konfigurasi API.`);
    }
  };

  const handleConnectStore = (store: string) => {
    const storeInfo = onlineStores[store] || { connected: false };
    
    if (storeInfo.connected) {
      // Logic for disconnecting
      setOnlineStores(prev => {
        const next = { ...prev, [store]: { connected: false } };
        localStorage.setItem('online_stores', JSON.stringify(next));
        return next;
      });
      addNotification('post', 'Toko Terputus', `Berhasil memutuskan toko ${store}.`);
    } else {
      // Logic for connecting - Open Modal
      setConnectingStore(store);
    }
  };

  const handleCompleteStoreConnection = (store: string, shopEmail: string, shopId: string) => {
    setOnlineStores(prev => {
      const next = { 
        ...prev, 
        [store]: { 
          connected: true, 
          shopEmail, 
          shopId, 
          lastSync: new Date().toISOString() 
        } 
      };
      localStorage.setItem('online_stores', JSON.stringify(next));
      return next;
    });
    setConnectingStore(null);
    addNotification('milestone', 'Toko Terhubung', `Berhasil menghubungkan toko ${store} (${shopEmail}).`);
  };

  const handlePostToSocial = async (content: string, platform: string, media?: string | null) => {
    try {
      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, content, media })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        addNotification('post', 'Postingan Berhasil', `Konten Anda telah dipublikasikan ke ${platform}.`);
      } else {
        throw new Error(data.error || 'Gagal mempublikasikan konten');
      }
    } catch (error) {
      console.error('Posting error:', error);
      addNotification('alert', 'Gagal Posting', `Terjadi kesalahan saat memposting ke ${platform}. Pastikan ukuran file tidak terlalu besar.`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const [scheduledPosts, setScheduledPosts] = useState([
    { id: 1, title: 'Peluncuran Produk Baru', date: '12 Apr 2026', platform: 'Instagram', status: 'Planned' },
    { id: 2, title: 'Promo Ramadhan', date: '15 Apr 2026', platform: 'Facebook', status: 'In Review' },
    { id: 3, title: 'Email Newsletter Mingguan', date: '18 Apr 2026', platform: 'Email', status: 'Draft' },
  ]);

  const handleAddSchedule = (content: string, type: string) => {
    const newPost = {
      id: Date.now(),
      title: content.split('\n')[0].substring(0, 30) + '...',
      date: new Date(Date.now() + 86400000 * 2).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      platform: 'Instagram', // Default
      status: 'Planned'
    };
    setScheduledPosts([newPost, ...scheduledPosts]);
    addNotification('post', 'Konten Dijadwalkan', `Konten ${type} Anda telah berhasil dijadwalkan.`);
    setActiveTab('planner');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai', label: 'AI Studio', icon: Sparkles },
    { id: 'video', label: 'Video Studio', icon: Film },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'seo', label: 'SEO Tools', icon: Search },
    { id: 'portfolio', label: 'Portfolio', icon: Box },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(userStatus === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
  ];

  if (isLanding) {
    return (
      <LandingPage onSelectPlan={handleSelectPlan} onLogin={handleLogin} error={loginError} settings={appSettings} />
    );
  }

  const isTrialExpired = userStatus === 'trial' && trialEndsAt && new Date() > new Date(trialEndsAt);

  if (isTrialExpired) {
    return (
      <TrialExpiredView onUpgrade={() => handleSelectPlan({ name: 'Pro', price: appSettings.proPrice })} />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AnimatePresence>
        {showAIKeyPrompt && (
          <AIKeyPromptModal 
            isOpen={showAIKeyPrompt} 
            onClose={() => setShowAIKeyPrompt(false)} 
            onGoToSettings={(help) => {
              setShowAIKeyPrompt(false);
              setSettingsShowHelp(help);
              setActiveTab('settings');
            }}
          />
        )}
        {connectingStore && (
          <StoreConnectModal 
            store={connectingStore} 
            onClose={() => setConnectingStore(null)}
            onComplete={(email, id) => handleCompleteStoreConnection(connectingStore, email, id)}
          />
        )}
        {showTour && (
          <UserTour 
            userStatus={userStatus} 
            onClose={() => setShowTour(false)} 
            onSwitchTab={setActiveTab}
          />
        )}
        <PaymentModal 
          isOpen={isPaymentOpen} 
          onClose={() => setIsPaymentOpen(false)} 
          plan={selectedPlan}
          onComplete={handlePaymentComplete}
        />
      </AnimatePresence>
      
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out hidden lg:flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shadow-sm border border-brand-100 overflow-hidden">
              {appSettings.branding.logoUrl ? (
                <img src={appSettings.branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Logo className="w-7 h-7" />
              )}
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold font-display tracking-tight text-slate-900">
                {appSettings.branding.name}
              </span>
            )}
          </div>

          <nav className="flex-1 space-y-2 pb-6 overflow-y-auto pr-1 overflow-x-hidden custom-scrollbar">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.id}
                icon={item.icon} 
                label={isSidebarOpen ? item.label : ""} 
                active={activeTab === item.id} 
                onClick={() => setActiveTab(item.id)} 
              />
            ))}
          </nav>
          
          <div className="pt-4 border-t border-slate-100 space-y-1">
            <SidebarItem 
               icon={HelpCircle}
               label={isSidebarOpen ? "Tour Panduan" : ""}
               active={showTour}
               onClick={() => setShowTour(true)}
            />
            <SidebarItem 
               icon={LogOut}
               label={isSidebarOpen ? "Keluar" : ""}
               active={false}
               onClick={handleLogout}
            />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] lg:hidden shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                    {appSettings.branding.logoUrl ? (
                      <img src={appSettings.branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Logo className="w-7 h-7" />
                    )}
                  </div>
                  <span className="text-xl font-bold font-display text-slate-900">{appSettings.branding.name}</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <ChevronRight className="rotate-180" />
                </button>
              </div>
              <nav className="flex-1 space-y-2 overflow-y-auto pr-2 mb-6 scroll-smooth">
                {navItems.map((item) => (
                  <SidebarItem 
                    key={item.id}
                    icon={item.icon} 
                    label={item.label} 
                    active={activeTab === item.id} 
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }} 
                  />
                ))}
                
                <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-1">
                   <SidebarItem 
                      icon={HelpCircle}
                      label="Panduan App"
                      active={showTour}
                      onClick={() => { setShowTour(true); setIsMobileMenuOpen(false); }}
                   />
                   <SidebarItem 
                      icon={LogOut}
                      label="Keluar"
                      active={false}
                      onClick={handleLogout}
                   />
                </div>
              </nav>

              <div className="mt-6 pt-6 border-t border-slate-100 opacity-60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Versi 2.4.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-h-screen pb-20 lg:pb-0",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {userStatus === 'trial' && (
          <div className="bg-amber-500 text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-4">
            <span>Masa Trial Anda akan berakhir dalam 29 hari.</span>
            <button 
              onClick={() => handleSelectPlan({ name: 'Pro', price: appSettings.proPrice })}
              className="bg-white text-amber-600 px-3 py-1 rounded-full hover:bg-amber-50 transition-colors"
            >
              Upgrade Sekarang
            </button>
          </div>
        )}
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors hidden lg:block"
            >
              <Menu size={20} />
            </button>
            <span className="lg:hidden font-bold font-display text-slate-900">{appSettings.branding.name}</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="font-bold text-slate-900">Notifikasi</h4>
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          Tandai semua dibaca
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={cn(
                                "p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3",
                                !n.read && "bg-brand-50/30"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                n.type === 'post' ? "bg-blue-100 text-blue-600" :
                                n.type === 'milestone' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                              )}>
                                {n.type === 'post' ? <Calendar size={18} /> :
                                 n.type === 'milestone' ? <TrendingUp size={18} /> : <Users size={18} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                              </div>
                              {!n.read && <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0" />}
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400">
                            <Bell size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Tidak ada notifikasi</p>
                          </div>
                        )}
                      </div>
                      <button className="w-full p-3 text-xs font-bold text-slate-500 hover:bg-slate-50 border-t border-slate-100 transition-colors">
                        Lihat Semua Notifikasi
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{currentUser?.displayName || 'Admin SalesKu'}</p>
                <div className="flex items-center gap-1.5 mt-1 justify-end">
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                    userStatus === 'trial' ? "bg-amber-100 text-amber-600" : 
                    userStatus === 'enterprise' ? "bg-purple-100 text-purple-600" : 
                    userStatus === 'admin' ? "bg-rose-100 text-rose-600" : "bg-brand-100 text-brand-600"
                  )}>
                    {userStatus === 'trial' ? 'Trial Mode' : 
                     userStatus === 'enterprise' ? 'Enterprise VVIP' : 
                     userStatus === 'admin' ? 'Super Admin' : 'Pro Plan'}
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 border-2 border-white shadow-sm overflow-hidden">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {currentUser?.displayName?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <Lock size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'admin' && (
                <AdminPanelView 
                  settings={appSettings} 
                  onUpdateSettings={updateGlobalSettings} 
                  secrets={secrets}
                  onUpdateSecrets={updateSecrets}
                  addNotification={addNotification}
                />
              )}
              {activeTab === 'dashboard' && (
                <DashboardView 
                  onAction={() => setActiveTab('ai')} 
                  socialAccounts={socialAccounts}
                  onlineStores={onlineStores}
                />
              )}
              {activeTab === 'ai' && (
                <AIStudioView 
                  onSchedule={handleAddSchedule} 
                  socialAccounts={socialAccounts}
                  onPost={handlePostToSocial}
                  onSwitchTab={setActiveTab}
                  userStatus={userStatus}
                  userGeminiKey={userGeminiKey}
                  onMissingKey={() => setShowAIKeyPrompt(true)}
                />
              )}
              {activeTab === 'video' && <VideoStudioView onSchedule={handleAddSchedule} />}
              {activeTab === 'gallery' && <GalleryView />}
              {activeTab === 'seo' && (
                <div className="relative">
                  {userStatus === 'trial' && (
                    <div className="absolute inset-0 z-10 bg-slate-50/40 backdrop-blur-[2px] flex items-center justify-center p-8">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-center max-w-sm">
                        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Fitur Terbatas</h3>
                        <p className="text-sm text-slate-500 mb-6">SEO Tools hanya tersedia untuk paket Pro dan Enterprise. Upgrade sekarang untuk akses penuh.</p>
                        <button 
                          onClick={() => handleSelectPlan({ name: 'Pro', price: appSettings.proPrice })}
                          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all"
                        >
                          Upgrade ke Pro
                        </button>
                      </div>
                    </div>
                  )}
                  <SEOView userGeminiKey={userGeminiKey} onMissingKey={() => setShowAIKeyPrompt(true)} />
                </div>
              )}
              {activeTab === 'planner' && (
                <PlannerView 
                  onPostNow={() => addNotification('post', 'Postingan Berhasil', 'Konten dalam antrean berhasil dipublikasikan secara instan.')} 
                />
              )}
              {activeTab === 'crm' && <CRMView addNotification={addNotification} userGeminiKey={userGeminiKey} />}
              {activeTab === 'portfolio' && <PortfolioView />}
              {activeTab === 'privacy' && <PrivacyPolicyView />}
              {activeTab === 'settings' && (
                <SettingsView 
                  accounts={socialAccounts} 
                  onConnect={handleConnectSocial} 
                  apiKeys={apiKeys}
                  onSaveKeys={handleSaveApiKeys}
                  serverConfig={serverConfig}
                  onlineStores={onlineStores}
                  onConnectStore={handleConnectStore}
                  userStatus={userStatus}
                  geminiKey={userGeminiKey}
                  onSaveGeminiKey={(key) => {
                    setUserGeminiKey(key);
                    addNotification('milestone', 'Konfigurasi AI Diperbarui', 'Gemini API Key Anda telah berhasil disimpan.');
                  }}
                  forceShowGeminiHelp={settingsShowHelp}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 lg:hidden flex items-center justify-around p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'ai', label: 'AI', icon: Sparkles },
          { id: 'video', label: 'Studio', icon: Film },
          { id: 'crm', label: 'CRM', icon: Users },
          { id: 'gallery', label: 'Galeri', icon: ImageIcon },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all active:scale-90",
              activeTab === item.id 
                ? "text-brand-600" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id && "animate-pulse")} />
            <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
