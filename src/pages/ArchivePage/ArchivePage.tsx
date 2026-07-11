import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Users, MapPin, BookOpen, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { MOCK_TIMELINE_NODES } from '@/data/timeline';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { toast } from 'sonner';

// 5 个板块定义
const SECTIONS = [
  { id: 'culture', title: '人文风俗', subtitle: 'Culture & Customs', icon: Sparkles, tone: '#c9b896' },
  { id: 'geography', title: '地域环境', subtitle: 'Geography & Environment', icon: MapPin, tone: '#a8b5a0' },
  { id: 'terminology', title: '术语解释', subtitle: 'Terminology', icon: BookOpen, tone: '#b0a89a' },
  { id: 'characters', title: '人物档案', subtitle: 'Characters', icon: Users, tone: '#c4b8a8' },
  { id: 'events', title: '事件集锦', subtitle: 'Events Collection', icon: FileText, tone: '#9a9080' },
];

// ========== 事件集锦栏目分类 ==========
const EVENT_CATEGORIES = [
  {
    id: 'unfiled',
    title: '未归档',
    tag: 'CHAT',
    tagType: 'chat' as const,
    eventIds: [
      'AD-2050',    // 初始时间点
      'AD-2280',    // 文明存续危机
      'OE-0001',    // 新世界
      'OE-1603',    // NO EVENT DATA
      'OE-1842',    // 神启者
      'OE-2127',    // 结构性沉沦
      'OE-2306',    // 二界背驰
      'NE-0001',    // 散射危机
      'NE-0334',    // 聚居地事件
      'NE-0524',    // 门扉出现
    ],
  },
  {
    id: 'last-carnival',
    title: 'The LAST CARNIVAL',
    tag: 'MAIN STORY',
    tagType: 'main' as const,
    eventIds: [
      'NE-1706',    // 狂欢节危机
    ],
  },
  {
    id: 'illness-era',
    title: 'Illness Era',
    tag: 'MAIN STORY',
    tagType: 'main' as const,
    eventIds: [
      'NE-2755',    // 钙质化瘟疫
      'NE-2756',    // 大隔离时代的开启
    ],
  },
  {
    id: 'meaningless-records',
    title: 'the Meanningless Records',
    tag: 'SIDE STORY',
    tagType: 'chat' as const,
    eventIds: [
      'SS-1998-LISHUI',   // 1998年漓水特大洪灾
      'SS-2007-YINYAN',   // 隐岩西路失踪事件
    ],
  },
];

// ========== 人物档案栏目 ==========
const CHARACTER_CATEGORIES = [
  {
    id: 'neo-delta-team',
    title: 'The Neo Delta Team',
    subtitle: '新德尔塔小队',
    tag: 'CARNIVAL',
    tagType: 'main' as const,
    items: [
      { id: 'char-eric', title: 'Eric', subtitle: '' },
      { id: 'char-berus', title: 'BERUS', subtitle: '', tag: '同构体 · Isomorphism' },
      { id: 'char-hiro', title: 'Hiro', subtitle: '' },
      { id: 'char-nora', title: 'Nora', subtitle: '' },
      { id: 'char-marcus', title: 'Marcus', subtitle: '' },
      { id: 'char-karl', title: 'Karl', subtitle: '' },
    ],
  },
  {
    id: 'gospel-foundation',
    title: 'Gospel Foundation',
    subtitle: '福音基金会',
    tag: 'CARNIVAL',
    tagType: 'main' as const,
    items: [
      { id: 'char-rami', title: 'Rami', subtitle: '' },
    ],
  },
  {
    id: 'fci',
    title: 'The Future Civilization Institute',
    subtitle: '未来文明研究所',
    tag: 'CARNIVAL',
    tagType: 'main' as const,
    items: [],
  },
];

// ========== 人文风俗栏目 ==========
const CULTURE_CATEGORIES = [
  { id: 'city', title: '繁华都市', tag: '' },
  { id: 'system', title: '管理制度', tag: '' },
  { id: 'culture', title: '文化风采', tag: '' },
  { id: 'org', title: '社会组织', tag: '' },
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

// 大都会地区城市列表
const METROPOLIA_CITIES = [
  { id: 'great-metropolia', name: '大墨托波利亚', nameEn: 'Great Metropolia', type: '首府' },
  { id: 'wooden-city', name: '沃顿城', nameEn: 'Wooden City', type: '中心城市' },
  { id: 'robert-city', name: '洛伯特市', nameEn: 'Robert City', type: '中心城市' },
  { id: 'monica', name: '莫妮卡', nameEn: 'Monica', type: '主要城市' },
  { id: 'marry-bay', name: '玛丽港', nameEn: 'Marry Bay', type: '主要城市' },
  { id: 'no-access', name: '/NO ACCESS/', nameEn: '—', type: '中心城市', locked: true },
];

// 事件数据映射
const EVENT_MAP = buildEventMap();

function buildEventMap() {
  const map: Record<string, typeof MOCK_TIMELINE_NODES[0]> = {};
  for (const n of MOCK_TIMELINE_NODES) {
    map[n.id] = n;
  }
  return map;
}

export default function ArchivePage() {
  const navigate = useNavigate();
  // 从 scopedStorage 读取上次选中的板块
  const savedIndex = scopedStorage.getItem('archive_active_index');
  const initialIndex = savedIndex !== null ? Math.min(Math.max(parseInt(savedIndex, 10) || 4, 0), SECTIONS.length - 1) : 4;
  const [activeIndex, setActiveIndex] = useState(initialIndex); // 默认事件集锦
  const [isDragging, setIsDragging] = useState(false);
  const [prevShake, setPrevShake] = useState(false);
  const [nextShake, setNextShake] = useState(false);
  const [focusPulse, setFocusPulse] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(4);
  const dragMoved = useRef(false);

  // 板块切换
  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
    if (clamped === activeIndex) return;
    setActiveIndex(clamped);
    setFocusPulse((v) => v + 1);
    // 保存到 scopedStorage
    scopedStorage.setItem('archive_active_index', String(clamped));
  }, [activeIndex]);

  const handlePrev = useCallback(() => {
    if (activeIndex === 0) {
      setPrevShake(true);
      setTimeout(() => setPrevShake(false), 400);
      return;
    }
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const handleNext = useCallback(() => {
    if (activeIndex === SECTIONS.length - 1) {
      setNextShake(true);
      setTimeout(() => setNextShake(false), 400);
      return;
    }
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  // 键盘左右切换
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePrev, handleNext]);

  // 滚轮切换板块
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let wheelAccum = 0;
    let lastWheelTime = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (now - lastWheelTime > 300) {
        wheelAccum = 0;
      }
      lastWheelTime = now;
      wheelAccum += delta;

      if (wheelAccum > 80) {
        if (activeIndex < SECTIONS.length - 1) {
          goTo(activeIndex + 1);
          wheelAccum = 0;
        }
      } else if (wheelAccum < -80) {
        if (activeIndex > 0) {
          goTo(activeIndex - 1);
          wheelAccum = 0;
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeIndex, goTo]);

  // 鼠标 / 触摸拖动切换
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    dragMoved.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragStartIndex.current = activeIndex;
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - dragStartX.current;

    if (Math.abs(delta) > 3) dragMoved.current = true;

    const threshold = 100;
    if (delta > threshold && dragStartIndex.current > 0) {
      goTo(dragStartIndex.current - 1);
      dragStartIndex.current = dragStartIndex.current - 1;
      dragStartX.current = clientX;
    } else if (delta < -threshold && dragStartIndex.current < SECTIONS.length - 1) {
      goTo(dragStartIndex.current + 1);
      dragStartIndex.current = dragStartIndex.current + 1;
      dragStartX.current = clientX;
    }
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  // 计算每张卡片的位置和样式
  const getCardStyle = (index: number) => {
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);

    if (absOffset > 2) {
      return {
        opacity: 0,
        x: offset * 340,
        scale: 0.6,
        rotateY: offset > 0 ? 45 : -45,
        zIndex: 0,
        blur: 4,
      };
    }

    const scale = 1 - absOffset * 0.22;
    const x = offset * 260;
    const rotateY = offset * -35;
    const zIndex = 10 - absOffset;
    const opacity = 1 - absOffset * 0.35;
    const blur = absOffset * 1.5;

    return { opacity, x, scale, rotateY, zIndex, blur };
  };

  const activeSection = SECTIONS[activeIndex];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* ===== 动态背景 ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* 浅米白底色 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fafaf7] via-background to-[#f5f3ee]" />

        {/* 半色调网点纹理（底层） */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
            backgroundSize: '5px 5px',
          }}
        />

        {/* 镜头瞄准线：同心圆 + X形交叉对角线 */}
        <motion.div
          key={focusPulse}
          initial={false}
          animate={{
            scale: [1, 0.92, 1],
            filter: ['blur(0px)', 'blur(3px)', 'blur(0px)'],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '95vmin', height: '95vmin' }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 200, ease: 'linear', repeat: Infinity }}
          >
            {[0, 1, 2, 3, 4].map((i) => {
              const size = 30 + i * 16;
              const opacity = 0.04 + (4 - i) * 0.008;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: `${size}%`,
                    height: `${size}%`,
                    border: `1px solid rgba(0,0,0,${opacity})`,
                    WebkitMaskImage:
                      'conic-gradient(from 0deg, black 0%, transparent 8%, black 18%, transparent 26%, black 36%, transparent 44%, black 54%, transparent 62%, black 72%, transparent 80%, black 90%, transparent 98%)',
                    maskImage:
                      'conic-gradient(from 0deg, black 0%, transparent 8%, black 18%, transparent 26%, black 36%, transparent 44%, black 54%, transparent 62%, black 72%, transparent 80%, black 90%, transparent 98%)',
                  }}
                />
              );
            })}
          </motion.div>

          {/* X 形交叉对角线 + 十字中线 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute w-[140%] h-px"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.05) 80%, transparent)',
                transform: 'rotate(45deg)',
              }}
            />
            <div
              className="absolute w-[140%] h-px"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.05) 80%, transparent)',
                transform: 'rotate(-45deg)',
              }}
            />
            <div
              className="absolute w-full h-px"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.03) 30%, rgba(0,0,0,0.03) 70%, transparent)',
              }}
            />
            <div
              className="absolute h-full w-px"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.03) 30%, rgba(0,0,0,0.03) 70%, transparent)',
              }}
            />
          </div>

          {/* 中心小圆 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="size-16 rounded-full border" style={{ borderColor: 'rgba(0,0,0,0.06)' }} />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 rounded-full border"
              style={{ borderColor: 'rgba(0,0,0,0.08)' }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.15)' }}
            />
          </div>
        </motion.div>

        {/* 呼吸光晕 */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] rounded-full"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
          style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0.02) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* ===== 主体内容 ===== */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 md:px-6 lg:px-10 pt-28 pb-20">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-center"
        >
          <p className="text-[10px] tracking-[0.5em] text-foreground/25 uppercase font-mono">
            Archive Database
          </p>
        </motion.div>

        {/* ===== Cover Flow 卡片区域 ===== */}
        <div
          ref={containerRef}
          className="relative w-full max-w-5xl h-[320px] md:h-[380px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          style={{ perspective: '1400px' }}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
        >
          {SECTIONS.map((section, index) => {
            const style = getCardStyle(index);
            const Icon = section.icon;
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={section.id}
                initial={false}
                animate={{
                  x: style.x,
                  scale: style.scale,
                  rotateY: style.rotateY,
                  opacity: style.opacity,
                  zIndex: style.zIndex,
                  filter: `blur(${style.blur}px)`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 22,
                  mass: 1,
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className="absolute"
                onClick={() => {
                  if (!dragMoved.current && !isActive) {
                    goTo(index);
                  }
                }}
              >
                <div
                  className={`relative w-[220px] md:w-[260px] h-[300px] md:h-[360px] overflow-hidden transition-shadow duration-500 ${
                    isActive
                      ? 'shadow-[0_30px_80px_rgba(0_0_0_0.15),0_10px_30px_rgba(0_0_0_0.08)]'
                      : 'shadow-[0_10px_40px_rgba(0_0_0_0.08),0_2px_10px_rgba(0_0_0_0.04)]'
                  }`}
                  style={{
                    background: `linear-gradient(160deg, ${section.tone}18 0%, ${section.tone}05 50%, ${section.tone}10 100%)`,
                    border: `1px solid ${section.tone}35`,
                    borderRadius: '4px',
                  }}
                >
                  {/* 卡片网点纹理 */}
                  <div
                    className="absolute inset-0 opacity-[0.25]"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
                      backgroundSize: '4px 4px',
                    }}
                  />

                  {/* 卡片内同心圆装饰 */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <div
                      className="rounded-full border"
                      style={{ width: '70%', height: '70%', borderColor: `${section.tone}25` }}
                    />
                    <div
                      className="absolute rounded-full border"
                      style={{ width: '50%', height: '50%', borderColor: `${section.tone}20` }}
                    />
                    <div
                      className="absolute rounded-full border border-dashed"
                      style={{ width: '35%', height: '35%', borderColor: `${section.tone}18` }}
                    />
                  </div>

                  {/* 卡片内容 */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                    <div
                      className="size-16 md:size-20 flex items-center justify-center mb-5"
                      style={{ color: section.tone }}
                    >
                      <Icon className="size-10 md:size-12" strokeWidth={1} />
                    </div>
                    <h2
                      className={`text-base md:text-lg font-light tracking-[0.25em] mb-2 transition-colors duration-300 ${
                        isActive ? 'text-foreground/80' : 'text-foreground/45'
                      }`}
                    >
                      {section.title}
                    </h2>
                    <p className="text-[9px] tracking-[0.3em] text-foreground/25 font-mono uppercase">
                      {section.subtitle}
                    </p>
                    <div
                      className="mt-4 w-10 h-px"
                      style={{ background: `linear-gradient(to right, transparent, ${section.tone}50, transparent)` }}
                    />
                    <div className="mt-4 text-[9px] tracking-[0.3em] text-foreground/20 font-mono uppercase">
                      {section.id === 'events'
                        ? `${MOCK_TIMELINE_NODES.filter((n) => n.category !== 'empty').length} ENTRIES`
                        : '— COMING SOON —'}
                    </div>
                  </div>

                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(to right, transparent, ${section.tone}40, transparent)` }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(to right, transparent, ${section.tone}25, transparent)` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ===== 底部控制栏 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-col items-center gap-2.5"
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handlePrev}
              animate={prevShake ? { x: [-3, 3, -2, 2, 0] } : { x: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`size-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                activeIndex === 0
                  ? 'border-foreground/[0.06] text-foreground/20 cursor-not-allowed'
                  : 'border-foreground/[0.1] text-foreground/40 hover:text-foreground/70 hover:border-foreground/20 hover:bg-foreground/[0.03]'
              }`}
              aria-label="上一个板块"
            >
              <ChevronLeft className="size-4" />
            </motion.button>

            <div className="relative">
              <div className="px-8 py-1.5 bg-card/80 border border-foreground/[0.12] shadow-[0_1px_3px_rgba(0_0_0_0.04),inset_0_1px_0_rgba(255_255_255_0.8)]">
                <span className="text-sm font-medium tracking-[0.2em] text-foreground/70">
                  {activeSection.title}
                </span>
              </div>
              <div className="absolute -bottom-0.5 left-1 right-1 h-px bg-foreground/[0.06]" />
            </div>

            <motion.button
              onClick={handleNext}
              animate={nextShake ? { x: [3, -3, 2, -2, 0] } : { x: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`size-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                activeIndex === SECTIONS.length - 1
                  ? 'border-foreground/[0.06] text-foreground/20 cursor-not-allowed'
                  : 'border-foreground/[0.1] text-foreground/40 hover:text-foreground/70 hover:border-foreground/20 hover:bg-foreground/[0.03]'
              }`}
              aria-label="下一个板块"
            >
              <ChevronRight className="size-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            {SECTIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-5 h-1.5 bg-foreground/40'
                    : 'size-1.5 bg-foreground/15 hover:bg-foreground/30'
                }`}
                aria-label={`切换到${SECTIONS[i].title}`}
              />
            ))}
          </div>

          <p className="text-[9px] tracking-[0.35em] text-foreground/18 font-mono uppercase mt-0.5">
            DRAG · SCROLL · CLICK
          </p>
        </motion.div>

        {/* ===== 板块内容区（栏目分类） ===== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 w-full max-w-2xl mx-auto"
          >
            {/* 板块标题分隔 */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-foreground/[0.08]" />
              <span className="text-[9px] tracking-[0.4em] text-foreground/25 uppercase font-mono">
                {activeSection.subtitle}
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-foreground/[0.08]" />
            </div>

            {/* 事件集锦：栏目分类 */}
            {activeSection.id === 'events' && (
              <div className="space-y-3">
                {EVENT_CATEGORIES.map((cat) => (
                  <CategoryBlock
                    key={cat.id}
                    title={cat.title}
                    tag={cat.tag}
                    tagType={cat.tagType}
                    items={cat.eventIds
                      .map((id) => EVENT_MAP[id])
                      .filter(Boolean)
                      .map((ev) => ({
                        id: ev.id,
                        title: ev.title,
                        subtitle: `${ev.time} · ${ev.era}`,
                      }))}
                    onItemClick={(id) => navigate(`/story/${id}`)}
                  />
                ))}
              </div>
            )}

            {/* 人文风俗：4个栏目占位 */}
            {activeSection.id === 'culture' && (
              <div className="space-y-3">
                {CULTURE_CATEGORIES.map((cat) => (
                  <CategoryBlock
                    key={cat.id}
                    title={cat.title}
                    tag={cat.tag}
                    tagType="placeholder"
                    items={[]}
                    placeholderText="内容整理中"
                  />
                ))}
              </div>
            )}

            {/* 地域环境：9个栏目 */}
            {activeSection.id === 'geography' && (
              <div className="space-y-3">
                {GEOGRAPHY_CATEGORIES.map((cat) => {
                  // METROPOLIA 栏目填充6个城市条目
                  const cityItems =
                    cat.id === 'metropolia'
                      ? METROPOLIA_CITIES.map((c) => ({
                          id: c.id,
                          title: c.name,
                          subtitle: `${c.nameEn} · ${c.type}`,
                        }))
                      : [];
                  return (
                    <CategoryBlock
                      key={cat.id}
                      title={cat.title}
                      tag={cat.tag}
                      tagType={cat.tag === 'MITWELT' ? 'mitwelt' : 'vorwelt'}
                      items={cityItems}
                      placeholderText="内容整理中"
                      onItemClick={
                        cat.id === 'metropolia'
                          ? (cityId) => navigate(`/archive/region/metropolia?city=${cityId}`)
                          : undefined
                      }
                      onHeaderClick={cat.id === 'metropolia' ? () => navigate('/archive/region/metropolia') : undefined}
                    />
                  );
                })}
              </div>
            )}

            {/* 术语解释：整体占位 */}
            {activeSection.id === 'terminology' && (
              <div className="text-center py-16">
                <div
                  className="inline-flex items-center justify-center size-14 mb-5 border border-foreground/[0.08] bg-card/20"
                  style={{ borderRadius: '2px' }}
                >
                  <BookOpen className="size-6 text-foreground/25" strokeWidth={1.2} />
                </div>
                <h3 className="text-sm font-light tracking-[0.25em] text-foreground/40 mb-2">
                  内容整理中
                </h3>
                <p className="text-xs text-foreground/25 tracking-wider max-w-xs mx-auto">
                  该板块档案将在后续版本中陆续开放
                </p>
                <div className="mt-5 flex items-center justify-center gap-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="size-1 rounded-full bg-foreground/12" />
                  ))}
                </div>
              </div>
            )}

            {/* 人物档案：栏目分类 */}
            {activeSection.id === 'characters' && (
              <div className="space-y-3">
                {CHARACTER_CATEGORIES.map((cat) => (
                  <CategoryBlock
                    key={cat.id}
                    title={cat.title}
                    tag={cat.tag}
                    tagType={cat.tagType}
                    items={cat.items}
                    placeholderText="暂无条目"
                    onItemClick={(id) => navigate(`/character/${id}`)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ========== 栏目块组件 ==========
interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  tag?: string;
}

interface CategoryBlockProps {
  title: string;
  tag: string;
  tagType: 'main' | 'chat' | 'mitwelt' | 'vorwelt' | 'placeholder';
  items: CategoryItem[];
  onItemClick?: (id: string) => void;
  placeholderText?: string;
  onHeaderClick?: () => void;
}

function CategoryBlock({ title, tag, tagType, items, onItemClick, placeholderText, onHeaderClick }: CategoryBlockProps) {
  const [open, setOpen] = useState(true);

  const tagColorClass = {
    main: 'bg-white/15 text-white/80',
    chat: 'bg-white/10 text-white/60',
    mitwelt: 'bg-white/12 text-white/70',
    vorwelt: 'bg-white/12 text-white/70',
    placeholder: 'bg-white/10 text-white/50',
  }[tagType];

  return (
    <div className="overflow-hidden">
      {/* 栏目标题栏 */}
      <div className="w-full flex items-center justify-between px-5 py-3 bg-foreground/60 group" style={{ borderRadius: '2px' }}>
        <button
          onClick={() => onHeaderClick?.()}
          className="flex-1 text-left min-w-0"
        >
          <span className="text-base font-medium tracking-[0.15em] text-white">
            {title}
          </span>
        </button>
        <div className="flex items-center gap-3">
          {tag && (
            <span className={`text-[9px] tracking-[0.3em] font-mono uppercase px-2 py-0.5 ${tagColorClass}`}>
              {tag}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="text-white/50 hover:text-white/80 transition-colors"
            aria-label={open ? '收起' : '展开'}
          >
            <motion.div
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChevronRight className="size-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* 栏目内容 */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {items.length > 0 ? (
              <div className="border border-t-0 border-foreground/[0.08] bg-card/20">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => onItemClick?.(item.id)}
                    className={`w-full text-left flex items-center gap-4 px-5 py-3 hover:bg-foreground/[0.03] transition-colors duration-200 group ${
                      i !== items.length - 1 ? 'border-b border-foreground/[0.05]' : ''
                    }`}
                  >
                    <div className="size-1.5 rounded-full bg-foreground/15 group-hover:bg-foreground/40 transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm text-foreground/65 group-hover:text-foreground/85 transition-colors">
                          {item.title}
                        </div>
                        {item.tag && (
                          <span className="text-[9px] tracking-[0.2em] font-mono text-foreground/35 border border-foreground/15 px-1.5 py-0.5 rounded-sm">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-foreground/30 mt-0.5 font-mono tracking-wider">
                        {item.subtitle}
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-foreground/15 group-hover:text-foreground/45 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="border border-t-0 border-foreground/[0.08] bg-card/10 px-5 py-6 text-center">
                <p className="text-xs text-foreground/30 tracking-wider">
                  {placeholderText || '暂无内容'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
