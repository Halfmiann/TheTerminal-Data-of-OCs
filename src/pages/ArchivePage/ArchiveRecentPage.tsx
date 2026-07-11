import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Clock, FileText, Sparkles, MapPin, BookOpen, Users, User } from 'lucide-react';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { toast } from 'sonner';
import { MOCK_TIMELINE_NODES } from '@/data/timeline';

const RECENT_KEY = 'archive_recent_ids';

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

const EVENT_ITEMS = MOCK_TIMELINE_NODES.filter((n) => n.category !== 'empty').map((n) => ({
  id: n.id,
  title: n.title,
  time: n.time,
  era: n.era,
  summary: n.summary,
  section: 'events',
}));

// 计算每个板块的条目数（事件集锦按最近记录数，其他板块占位）
function getSectionCount(sectionId: string, recentIds: string[]): number {
  if (sectionId === 'events') {
    return EVENT_ITEMS.filter((item) => recentIds.includes(item.id)).length;
  }
  if (sectionId === 'characters') {
    return CHARACTER_ITEMS.filter((item) => recentIds.includes(item.id)).length;
  }
  return 0;
}

// 获取最近查阅记录
function getRecentIds(): string[] {
  try {
    const raw = scopedStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function ArchiveRecentPage() {
  const navigate = useNavigate();
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('events');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    setRecentIds(getRecentIds());
  }, []);

  // 当前板块下的栏目列表
  const currentCategories = useMemo(() => {
    if (activeSection === 'events') {
      return [{ id: 'all', title: '全部', tag: '' }, ...EVENT_CATEGORIES.map((c) => ({ id: c.id, title: c.title, tag: c.tag }))];
    }
    if (activeSection === 'characters') {
      return [{ id: 'all', title: '全部', tag: '' }, ...CHARACTER_CATEGORIES.map((c) => ({ id: c.id, title: c.title, tag: c.tag }))];
    }
    return [];
  }, [activeSection]);

  const recentItems = EVENT_ITEMS.filter((item) => recentIds.includes(item.id)).sort(
    (a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id)
  );

  // 按栏目筛选
  const filteredItems = useMemo(() => {
    if (activeSection === 'events') {
      if (activeCategory === 'all') return recentItems;
      const cat = EVENT_CATEGORIES.find((c) => c.id === activeCategory);
      if (!cat) return recentItems;
      return recentItems.filter((item) => cat.eventIds.includes(item.id));
    }
    if (activeSection === 'characters') {
      const charRecent = CHARACTER_ITEMS.filter((item) => recentIds.includes(item.id)).sort(
        (a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id)
      );
      if (activeCategory === 'all') return charRecent;
      const cat = CHARACTER_CATEGORIES.find((c) => c.id === activeCategory);
      if (!cat) return charRecent;
      return charRecent.filter((item) => cat.items.some((i) => i.id === item.id));
    }
    return [];
  }, [recentItems, activeSection, activeCategory, recentIds]);

  // 如果没有记录，展示一些示例（事件前3个 / 人物前3个）
  const displayItems = filteredItems.length > 0
    ? filteredItems
    : (activeSection === 'events' && activeCategory === 'all'
      ? EVENT_ITEMS.slice(0, 3)
      : activeSection === 'characters' && activeCategory === 'all'
        ? CHARACTER_ITEMS.slice(0, 3)
        : []);

  const handleClear = () => {
    scopedStorage.removeItem(RECENT_KEY);
    setRecentIds([]);
  };

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
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Clock className="size-4 text-foreground/40" />
            <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
              Recent Viewed
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em] text-foreground/85">
            最近查阅
          </h1>
          <p className="text-sm text-foreground/35 mt-2 tracking-wider">
            最近查阅过的档案条目
          </p>
        </motion.div>

        {/* 板块切换 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-1 mb-5"
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
                  {getSectionCount(sec.id, recentIds)}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* 栏目分类筛选 */}
        {currentCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-2 mb-6"
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
                  <span className="mr-1.5 text-[9px] tracking-[0.2em] font-mono text-foreground/30">
                    {cat.tag}
                  </span>
                )}
                {cat.title}
              </button>
            ))}
          </motion.div>
        )}

        {/* 列表 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {(activeSection === 'events' || activeSection === 'characters') ? (
            displayItems.length > 0 ? (
              <div className="space-y-2">
                {displayItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
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
                <div className="text-foreground/20 text-sm tracking-wider mb-2">— 暂无记录 —</div>
                <p className="text-xs text-foreground/30">还没有查阅过该栏目的档案</p>
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="text-foreground/20 text-sm tracking-wider mb-2">— 内容整理中 —</div>
              <p className="text-xs text-foreground/30">该板块档案将在后续版本中开放</p>
            </div>
          )}
        </motion.div>

        {/* 清空按钮 */}
        {recentIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <button
              onClick={handleClear}
              className="text-xs text-foreground/30 hover:text-foreground/50 tracking-wider transition-colors"
            >
              清空查阅记录
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
