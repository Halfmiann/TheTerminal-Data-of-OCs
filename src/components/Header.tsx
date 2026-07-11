import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Clock, Search, History, ChevronDown, Check, Lock, ChevronLeft } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { path: '/', label: '开始' },
  { path: '/timeline', label: '时间轴' },
  { path: '/archive', label: '档案库' },
];

// 时间轴选项
const TIMELINE_OPTIONS = [
  { id: 'simulated', title: '模拟事件时间轴', subtitle: 'SIMULATED', disabled: false },
  { id: 'reality', title: '现实事件时间轴', subtitle: 'REALITY', disabled: true },
];

const ARCHIVE_RELATED_PATHS = [
  '/archive',
  '/archive/search',
  '/archive/recent',
  '/archive/region',
];

// 档案库子页面（需要显示返回按钮）
const ARCHIVE_SUB_PATHS = [
  '/archive/search',
  '/archive/recent',
  '/archive/region',
];

const NAV_VISIBLE_KEY = 'header_nav_visible';

export default function Header() {
  const [expanded, setExpanded] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [time, setTime] = useState('');
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState('simulated');
  const location = useLocation();
  const navigate = useNavigate();
  const timelineRef = useRef<HTMLDivElement>(null);

  // 读取导航可见性
  useEffect(() => {
    const visible = scopedStorage.getItem(NAV_VISIBLE_KEY);
    if (visible === 'true') {
      setNavVisible(true);
    }

    const onShow = () => {
      scopedStorage.setItem(NAV_VISIBLE_KEY, 'true');
      setNavVisible(true);
    };
    window.addEventListener('header-nav-show', onShow);
    return () => window.removeEventListener('header-nav-show', onShow);
  }, []);

  // 实时时钟
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  // 点击外部关闭时间轴下拉
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (timelineRef.current && !timelineRef.current.contains(e.target as Node)) {
        setTimelineOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // 主栏收起时关闭时间轴下拉
  useEffect(() => {
    if (!expanded) {
      setTimelineOpen(false);
    }
  }, [expanded]);

  // 是否为时间轴页面
  const isTimelinePage = useMemo(() => {
    const path = location.pathname;
    return path === '/timeline' || path.startsWith('/timeline/');
  }, [location.pathname]);

  // 是否为档案库相关页面
  const isArchivePage = useMemo(() => {
    const path = location.pathname;
    return ARCHIVE_RELATED_PATHS.some((p) => path === p || path.startsWith(p + '/'));
  }, [location.pathname]);

  // 是否为档案库子页面（需要显示返回按钮）
  const isArchiveSubPage = useMemo(() => {
    const path = location.pathname;
    return ARCHIVE_SUB_PATHS.some((p) => path === p || path.startsWith(p + '/'));
  }, [location.pathname]);

  // 是否为故事详情页（时间轴子页，需要显示返回时间轴按钮）
  const isStoryDetailPage = useMemo(() => {
    const path = location.pathname;
    return path.startsWith('/story/');
  }, [location.pathname]);

  const handleBackToArchive = () => {
    navigate('/archive');
  };

  const handleBackToTimeline = () => {
    navigate('/timeline');
  };

  const handleToggle = () => {
    setExpanded((v) => !v);
  };

  const handleSearchClick = () => {
    navigate('/archive/search');
  };

  const handleRecentClick = () => {
    navigate('/archive/recent');
  };

  const handleTimelineClick = () => {
    setTimelineOpen((v) => !v);
  };

  const handleTimelineSelect = (id: string, disabled: boolean) => {
    if (disabled) {
      toast.info('该时间轴暂未开放');
      return;
    }
    setActiveTimeline(id);
    setTimelineOpen(false);
  };

  const currentTimeline = TIMELINE_OPTIONS.find((t) => t.id === activeTimeline) ?? TIMELINE_OPTIONS[0];

  const isMobile = useIsMobile();

  // 主栏展开宽度：根据视口宽度自适应，避免与左右副栏重叠
  // - 移动端: 主栏占 92vw，副栏隐藏
  // - 平板: 主栏占 min(560px, 60vw)，副栏仅图标
  // - 桌面: 主栏占 min(680px, 50vw)，副栏完整显示
  const mainBarExpandedWidth = useMemo(() => {
    if (typeof window === 'undefined') return 'min(680px, 50vw)';
    const w = window.innerWidth;
    if (w < 768) return 'min(520px, 92vw)';
    if (w < 1024) return 'min(560px, 60vw)';
    return 'min(680px, 50vw)';
  }, [isMobile]);

  // 监听窗口尺寸变化，触发主栏宽度重算
  useEffect(() => {
    const onResize = () => {
      // 触发重渲染以更新 mainBarExpandedWidth
      setTime((t) => t);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-5 px-6 lg:px-10 pointer-events-none">
      <div className="max-w-[1600px] mx-auto relative h-12 pointer-events-auto">
        {/* ===== 时间轴页：左侧副栏（时间轴选择器）—— 仅主栏展开时显示 ===== */}
        <AnimatePresence>
          {navVisible && expanded && isTimelinePage && (
            <motion.div
              key="timeline-island"
              initial={{ opacity: 0, x: -20, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.85 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 28,
                mass: 0.8,
              }}
               className="absolute left-0 top-0 hidden md:block"
               ref={timelineRef}
             >
               <div className="relative">
                 <button
                   onClick={handleTimelineClick}
                   className="h-12 px-3 md:px-4 lg:px-5 bg-background/60 backdrop-blur-2xl border border-foreground/[0.08] rounded-full shadow-[0_4px_24px_rgba(0_0_0_0.06),0_1px_4px_rgba(0_0_0_0.03)] flex items-center gap-2 lg:gap-3 hover:bg-background/80 hover:border-foreground/[0.12] transition-all duration-300 group"
                 >
                   <div className="size-2 rounded-full bg-foreground/60 shrink-0" />
                   <div className="hidden lg:flex flex-col leading-tight text-left min-w-0">
                     <span className="text-sm font-medium tracking-wide text-foreground/80 truncate">
                       {currentTimeline.title}
                     </span>
                     <span className="text-[9px] tracking-[0.25em] text-foreground/35 font-mono uppercase truncate">
                       {currentTimeline.subtitle}
                     </span>
                   </div>
                   <motion.div
                     animate={{ rotate: timelineOpen ? 180 : 0 }}
                     transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                     className="hidden md:block"
                   >
                     <ChevronDown className="size-3.5 text-foreground/35 group-hover:text-foreground/55 transition-colors" />
                   </motion.div>
                 </button>

                {/* 下拉选项 */}
                <AnimatePresence>
                  {timelineOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-14 left-0 w-64 bg-background/80 backdrop-blur-xl border border-foreground/[0.08] rounded-xl shadow-[0_8px_30px_rgba(0_0_0_0.06),0_2px_8px_rgba(0_0_0_0.03)] overflow-hidden"
                    >
                      <div className="py-1.5">
                        {TIMELINE_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleTimelineSelect(opt.id, opt.disabled)}
                            className={cn(
                              'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200',
                              opt.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-foreground/[0.03]'
                            )}
                            disabled={opt.disabled}
                          >
                            <div className="size-3 shrink-0">
                              {activeTimeline === opt.id && !opt.disabled && (
                                <Check className="size-3 text-foreground/60" />
                              )}
                              {opt.disabled && <Lock className="size-3 text-foreground/30" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={cn(
                                  'text-sm tracking-wide',
                                  activeTimeline === opt.id && !opt.disabled
                                    ? 'text-foreground/80 font-medium'
                                    : 'text-foreground/55'
                                )}
                              >
                                {opt.title}
                              </div>
                              <div className="text-[9px] tracking-[0.3em] text-foreground/25 font-mono uppercase mt-0.5">
                                {opt.subtitle}
                                {opt.disabled && ' · 暂未开放'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== 中间：主栏导航胶囊 — 绝对居中 ===== */}
        <AnimatePresence initial={false}>
          {navVisible && (
            <motion.div
              key="nav-main"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-1/2 top-0 -translate-x-1/2"
            >
              <motion.div
                initial={false}
                animate={{
                   width: expanded ? mainBarExpandedWidth : '48px',
                  borderRadius: '9999px',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 28,
                  mass: 0.8,
                }}
                className="relative h-12 bg-background/60 backdrop-blur-2xl border border-foreground/[0.08] shadow-[0_4px_24px_rgba(0_0_0_0.06),0_1px_4px_rgba(0_0_0_0.03)] overflow-hidden"
              >
                {/* 收起状态：居中汉堡按钮 */}
                <AnimatePresence mode="wait">
                  {!expanded && (
                    <motion.button
                      key="menu-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleToggle}
                      className="absolute inset-0 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors z-10"
                      aria-label="展开导航"
                    >
                      <Menu className="size-4.5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* 展开状态：导航内容 */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, delay: 0.1 }}
                      className="absolute inset-0 flex items-center px-5"
                    >
                      {/* 左侧 version */}
                      <div className="shrink-0 text-[9px] tracking-[0.25em] text-foreground/30 font-mono uppercase">
                        v0.85
                      </div>

                      {/* 导航项 - 居中 */}
                      <nav className="flex-1 flex items-center justify-center gap-1">
                         {/* 档案库子页：返回档案库按钮 */}
                         {isArchiveSubPage && (
                           <button
                             onClick={handleBackToArchive}
                             className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] tracking-[0.15em] text-foreground/50 hover:text-foreground transition-colors duration-300 group whitespace-nowrap"
                           >
                             <ChevronLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 shrink-0" />
                             <span>返回档案库</span>
                           </button>
                         )}
                         {/* 故事详情页：返回时间轴按钮 */}
                         {isStoryDetailPage && (
                           <button
                             onClick={handleBackToTimeline}
                             className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] tracking-[0.15em] text-foreground/50 hover:text-foreground transition-colors duration-300 group whitespace-nowrap"
                           >
                             <ChevronLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 shrink-0" />
                             <span>返回时间轴</span>
                           </button>
                         )}
                        {NAV_ITEMS.map((item) => (
                           <NavLink
                             key={item.path}
                             to={item.path}
                             end={item.path === '/'}
                             className={({ isActive }) =>
                               cn(
                                 'relative px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 whitespace-nowrap',
                                 isActive
                                   ? 'text-foreground'
                                   : 'text-foreground/40 hover:text-foreground/70'
                               )
                             }
                          >
                            {({ isActive }) => (
                              <span className="relative inline-block">
                                {item.label}
                                {isActive && (
                                  <motion.span
                                    layoutId="nav-underline"
                                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-foreground"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                  />
                                )}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </nav>

                      {/* 右侧：关闭按钮 + 时钟 */}
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-foreground/40">
                          <Clock className="size-3" />
                          <span className="text-xs tracking-wider font-mono tabular-nums">
                            {time}
                          </span>
                        </div>
                        <button
                          onClick={handleToggle}
                          className="size-6 flex items-center justify-center text-foreground/40 hover:text-foreground/70 transition-colors"
                          aria-label="收起导航"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== 档案库页：右侧副栏（最近查阅）—— 仅主栏展开时显示 ===== */}
        <AnimatePresence>
          {navVisible && expanded && isArchivePage && (
            <motion.div
              key="right-island"
              initial={{ opacity: 0, x: 20, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.85 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 28,
                mass: 0.8,
              }}
               className="absolute right-0 top-0 hidden md:block"
             >
               <button
                 onClick={handleRecentClick}
                 className="h-12 px-3 md:px-4 bg-background/60 backdrop-blur-2xl border border-foreground/[0.08] rounded-full shadow-[0_4px_24px_rgba(0_0_0_0.06),0_1px_4px_rgba(0_0_0_0.03)] flex items-center gap-2 hover:bg-background/80 hover:border-foreground/[0.12] transition-all duration-300 group"
               >
                 <History className="size-4 text-foreground/50 group-hover:text-foreground/70 transition-colors shrink-0" />
                 <span className="hidden lg:inline text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors tracking-wide whitespace-nowrap">
                   最近查阅
                 </span>
               </button>
             </motion.div>
          )}
        </AnimatePresence>

        {/* ===== 档案库页：左侧副栏（搜索）—— 仅主栏展开时显示 ===== */}
        <AnimatePresence>
          {navVisible && expanded && isArchivePage && (
            <motion.div
              key="left-island"
              initial={{ opacity: 0, x: -20, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.85 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 28,
                mass: 0.8,
              }}
               className="absolute left-0 top-0 hidden md:block"
             >
               <button
                 onClick={handleSearchClick}
                 className="h-12 px-3 md:px-4 bg-background/60 backdrop-blur-2xl border border-foreground/[0.08] rounded-full shadow-[0_4px_24px_rgba(0_0_0_0.06),0_1px_4px_rgba(0_0_0_0.03)] flex items-center gap-2 hover:bg-background/80 hover:border-foreground/[0.12] transition-all duration-300 group"
               >
                 <Search className="size-4 text-foreground/50 group-hover:text-foreground/70 transition-colors shrink-0" />
                 <span className="hidden lg:inline text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors tracking-wide whitespace-nowrap">
                   搜索
                 </span>
               </button>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export function showHeaderNav() {
  scopedStorage.setItem(NAV_VISIBLE_KEY, 'true');
  window.dispatchEvent(new CustomEvent('header-nav-show'));
}
