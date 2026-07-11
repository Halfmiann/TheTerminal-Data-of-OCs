import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Search, X, FileText, Clock, Sparkles, MapPin, BookOpen, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_TIMELINE_NODES } from '@/data/timeline';

// ========== 板块定义（与档案库主页一致） ==========
const SECTIONS = [
  { id: 'events', title: '事件集锦', subtitle: 'Events Collection', icon: FileText },
  { id: 'characters', title: '人物档案', subtitle: 'Characters', icon: Users },
  { id: 'culture', title: '人文风俗', subtitle: 'Culture & Customs', icon: Sparkles },
  { id: 'geography', title: '地域环境', subtitle: 'Geography & Environment', icon: MapPin },
  { id: 'terminology', title: '术语解释', subtitle: 'Terminology', icon: BookOpen },
];

// ========== 事件集锦栏目分类 ==========
const EVENT_CATEGORIES = [
  {
    id: 'unfiled',
    title: '未归档',
    tag: 'CHAT',
    eventIds: ['AD-2050', 'AD-2280', 'OE-0001', 'OE-1603', 'OE-1842', 'OE-2127', 'OE-2306', 'NE-0001', 'NE-0334', 'NE-0524'],
  },
  {
    id: 'last-carnival',
    title: 'The LAST CARNIVAL',
    tag: 'MAIN STORY',
    eventIds: ['NE-1706'],
  },
  {
    id: 'illness-era',
    title: 'Illness Era',
    tag: 'MAIN STORY',
    eventIds: ['NE-2755', 'NE-2756'],
  },
  {
    id: 'meaningless-records',
    title: 'the Meanningless Records',
    tag: 'SIDE STORY',
    eventIds: ['SS-1998-LISHUI', 'SS-2007-YINYAN'],
  },
];

// ========== 人物档案栏目 ==========
const CHARACTER_CATEGORIES = [
  {
    id: 'neo-delta-team',
    title: 'The Neo Delta Team',
    tag: 'CARNIVAL',
    items: [
      { id: 'char-eric', title: 'Eric', subtitle: '' },
      { id: 'char-berus', title: 'BERUS', subtitle: '' },
      { id: 'char-hiro', title: 'Hiro', subtitle: '' },
      { id: 'char-nora', title: 'Nora', subtitle: '' },
      { id: 'char-marcus', title: 'Marcus', subtitle: '' },
      { id: 'char-karl', title: 'Karl', subtitle: '' },
    ],
  },
  {
    id: 'gospel-foundation',
    title: 'Gospel Foundation',
    tag: 'CARNIVAL',
    items: [
      { id: 'char-rami', title: 'Rami', subtitle: '' },
    ],
  },
  {
    id: 'fci',
    title: 'The Future Civilization Institute',
    tag: 'CARNIVAL',
    items: [],
  },
];

const CHARACTER_ITEMS = CHARACTER_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => ({
    id: item.id,
    title: item.title,
    category: cat.title,
    section: 'characters',
  }))
);

// ========== 人文风俗栏目 ==========
const CULTURE_CATEGORIES = [
  { id: 'city', title: '繁华都市' },
  { id: 'system', title: '管理制度' },
  { id: 'culture', title: '文化风采' },
  { id: 'org', title: '社会组织' },
];

// ========== 地域环境栏目 ==========
const GEOGRAPHY_CATEGORIES = [
  { id: 'center-ocean', title: 'Center Ocean', tag: 'MITWELT' },
  { id: 'metropolia', title: 'METROPOLIA', tag: 'MITWELT' },
  { id: 'moonlight', title: 'MOONLIGHT & LISHUI BAY', tag: 'MITWELT' },
  { id: 'liberation', title: 'LIBERATION MOUNT', tag: 'MITWELT' },
  { id: 'pilotlia', title: 'PILOTLIA', tag: 'MITWELT' },
  { id: 'clotho', title: 'CLOTHO', tag: 'VORWELT' },
  { id: 'lachesis', title: 'LACHESIS', tag: 'VORWELT' },
  { id: 'ultrachaos', title: 'ULTRACHAOS', tag: 'VORWELT' },
  { id: 'atropos', title: 'ATROPOS', tag: 'VORWELT' },
];

const EVENT_MAP: Record<string, typeof MOCK_TIMELINE_NODES[0]> = {};
for (const n of MOCK_TIMELINE_NODES) {
  EVENT_MAP[n.id] = n;
}

const EVENT_ITEMS = MOCK_TIMELINE_NODES.filter((n) => n.category !== 'empty').map((n) => ({
  id: n.id,
  title: n.title,
  time: n.time,
  era: n.era,
  summary: n.summary,
  section: 'events',
}));

// 计算每个板块的条目数
const SECTION_COUNTS: Record<string, number> = {
  events: EVENT_ITEMS.length,
  characters: CHARACTER_ITEMS.length,
  culture: CULTURE_CATEGORIES.length,
  geography: GEOGRAPHY_CATEGORIES.length,
  terminology: 0,
};

export default function ArchiveSearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [activeSection, setActiveSection] = useState('events');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // 当前板块下的栏目列表
  const currentCategories = useMemo(() => {
    if (activeSection === 'events') {
      return [{ id: 'all', title: '全部', tag: '' }, ...EVENT_CATEGORIES.map((c) => ({ id: c.id, title: c.title, tag: c.tag }))];
    }
    if (activeSection === 'characters') {
      return [{ id: 'all', title: '全部', tag: '' }, ...CHARACTER_CATEGORIES.map((c) => ({ id: c.id, title: c.title, tag: c.tag }))];
    }
    if (activeSection === 'culture') {
      return [{ id: 'all', title: '全部', tag: '' }, ...CULTURE_CATEGORIES.map((c) => ({ id: c.id, title: c.title, tag: '' }))];
    }
    if (activeSection === 'geography') {
      return [{ id: 'all', title: '全部', tag: '' }, ...GEOGRAPHY_CATEGORIES.map((c) => ({ id: c.id, title: c.title, tag: c.tag || '' }))];
    }
    return [];
  }, [activeSection]);

  const filteredItems = useMemo(() => {
    if (activeSection === 'events') {
      let items = EVENT_ITEMS;
      // 栏目筛选
      if (activeCategory !== 'all') {
        const cat = EVENT_CATEGORIES.find((c) => c.id === activeCategory);
        if (cat) {
          items = items.filter((item) => cat.eventIds.includes(item.id));
        }
      }
      // 关键词搜索
      if (!keyword.trim()) return items;
      const kw = keyword.toLowerCase();
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(kw) ||
          item.era.toLowerCase().includes(kw) ||
          item.summary.toLowerCase().includes(kw)
      );
    }
    if (activeSection === 'characters') {
      let items = CHARACTER_ITEMS;
      // 栏目筛选
      if (activeCategory !== 'all') {
        const cat = CHARACTER_CATEGORIES.find((c) => c.id === activeCategory);
        if (cat) {
          items = items.filter((item) => cat.items.some((i) => i.id === item.id));
        }
      }
      // 关键词搜索
      if (!keyword.trim()) return items;
      const kw = keyword.toLowerCase();
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(kw) ||
          item.category.toLowerCase().includes(kw)
      );
    }
    return [];
  }, [keyword, activeSection, activeCategory]);

  return (
    <div className="relative min-h-screen bg-background pt-24 pb-20 px-6 lg:px-10">
      {/* 背景网点 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.3]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '6px 6px',
        }}
      />

      <div className="max-w-3xl mx-auto relative">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Search className="size-4 text-foreground/40" />
            <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
              Search Archive
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em] text-foreground/85">
            档案搜索
          </h1>
        </motion.div>

        {/* 板块切换 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-1 mb-6"
        >
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  setActiveCategory('all');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-[0.15em] border rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-foreground/[0.08] border-foreground/20 text-foreground/70'
                    : 'bg-transparent border-foreground/[0.08] text-foreground/40 hover:border-foreground/15 hover:text-foreground/60'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{sec.title}</span>
                <span className="text-[10px] text-foreground/25 font-mono">
                  {SECTION_COUNTS[sec.id] ?? 0}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* 搜索框 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-foreground/30" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="输入关键词搜索档案..."
              autoFocus
              className="w-full h-12 pl-12 pr-10 bg-card/60 backdrop-blur-sm border border-foreground/[0.08] rounded-full text-sm text-foreground/70 placeholder:text-foreground/25 focus:outline-none focus:border-foreground/20 focus:shadow-[0_4px_20px_rgba(0_0_0_0.06)] transition-all duration-300"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
                aria-label="清除搜索"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* 栏目分类筛选 */}
        {currentCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {currentCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs tracking-wider rounded-full border transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-foreground/[0.08] border-foreground/20 text-foreground/70'
                    : 'bg-transparent border-foreground/[0.08] text-foreground/40 hover:border-foreground/15 hover:text-foreground/60'
                }`}
              >
                {cat.tag && (
                  <span
                    className={`mr-1.5 text-[9px] tracking-[0.2em] font-mono ${
                      cat.tag === 'MITWELT' ? 'text-foreground/35' : cat.tag === 'VORWELT' ? 'text-foreground/35' : 'text-foreground/30'
                    }`}
                  >
                    {cat.tag}
                  </span>
                )}
                {cat.title}
              </button>
            ))}
          </motion.div>
        )}

        {/* 搜索结果 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {(activeSection === 'events' || activeSection === 'characters') ? (
            filteredItems.length > 0 ? (
              <div className="space-y-2">
                {filteredItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      if (activeSection === 'events') {
                        navigate(`/story/${item.id}`);
                      } else {
                        navigate(`/character/${item.id}`);
                      }
                    }}
                    className="group w-full text-left flex items-center gap-4 px-5 py-4 bg-card/40 border border-foreground/[0.05] rounded-xl hover:bg-card/70 hover:border-foreground/[0.1] hover:shadow-[0_2px_12px_rgba(0_0_0_0.04)] transition-all duration-300"
                  >
                    {activeSection === 'events' ? (
                      <FileText className="size-4 text-foreground/25 shrink-0" />
                    ) : (
                      <User className="size-4 text-foreground/25 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-foreground/35 mt-0.5 font-mono">
                        {activeSection === 'events'
                          ? `${(item as typeof EVENT_ITEMS[0]).time} · ${(item as typeof EVENT_ITEMS[0]).era}`
                          : (item as typeof CHARACTER_ITEMS[0]).category}
                      </div>
                    </div>
                    <Clock className="size-3 text-foreground/20 shrink-0" />
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-foreground/20 text-sm tracking-wider mb-2">— 无结果 —</div>
                <p className="text-xs text-foreground/30">没有找到匹配的档案条目</p>
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="text-foreground/20 text-sm tracking-wider mb-2">— 内容整理中 —</div>
              <p className="text-xs text-foreground/30">该板块档案将在后续版本中开放</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
