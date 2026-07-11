import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_TIMELINE_NODES } from '@/data/timeline';

const TIMELINE_NODES = MOCK_TIMELINE_NODES.filter((n) => !n.hiddenFromTimeline);
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Database, Lock, AlertTriangle, MousePointer2 } from 'lucide-react';

// 节点水平位置配置（px），紧凑间距
const NODE_POSITIONS: Record<string, number> = {
  'AD-2050': 160,
  'AD-2280': 380,
  'OE-0001': 640,
  'OE-1603': 880,
  'OE-1842': 1120,
  'OE-2127': 1360,
  'OE-2306': 1600,
  'NE-0001': 1900, // NEXUS 中心点
  'NE-0334': 2200,
  'NE-0524': 2460,
  'NE-1706': 2760,
  'NE-2755': 3080,
  'NE-2756': 3360,
};

const TRACK_WIDTH = 3600;

// 纪元范围（用于中景视差标识显示判断）
const ERA_RANGES = [
  { code: 'AD', label: 'OLD WORLD', labelCn: '舊世界', start: 0, end: 520 },
  { code: 'OE', label: 'ORIGIN ERA', labelCn: '次紀元', start: 520, end: 1780 },
  { code: 'NE', label: 'NEO ERA', labelCn: '新紀元', start: 1780, end: TRACK_WIDTH },
];

export default function TimelinePage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const midgroundRef = useRef<HTMLDivElement>(null);
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string>('NE-0001');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const dragMoved = useRef(false);
  const wheelCooldown = useRef(false);

  const selectedNode = TIMELINE_NODES.find((n) => n.id === selectedId);

  // 模拟系统加载
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  // 监听滚动，更新视差中景位置
  const onScroll = useCallback(() => {
    const sl = containerRef.current?.scrollLeft ?? 0;
    setScrollLeft(sl);
    // 中景视差：0.35 倍速度
    if (midgroundRef.current) {
      midgroundRef.current.style.transform = `translateX(${-sl * 0.35}px)`;
    }
  }, []);

  // 居中选中节点
  const scrollToNode = useCallback((id: string) => {
    const nodeEl = trackRef.current?.querySelector(`[data-node-id="${id}"]`);
    const container = containerRef.current;
    if (!nodeEl || !container) return;

    const nodeRect = (nodeEl as HTMLElement).getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const offset =
      nodeRect.left - containerRect.left - containerRect.width / 2 + nodeRect.width / 2;

    container.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => scrollToNode(selectedId), 150);
      return () => clearTimeout(t);
    }
  }, [selectedId, loading, scrollToNode]);

  // 拖动
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragMoved.current = false;
    dragStartX.current = e.clientX;
    dragStartScroll.current = containerRef.current?.scrollLeft ?? 0;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = Math.abs(e.clientX - dragStartX.current);
    if (dx > 3) dragMoved.current = true;
    if (containerRef.current) {
      containerRef.current.scrollLeft = dragStartScroll.current - (e.clientX - dragStartX.current);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const handleNodeClick = (id: string) => {
    if (dragMoved.current) return;
    setSelectedId(id);
  };

  const goPrev = () => {
    const idx = TIMELINE_NODES.findIndex((n) => n.id === selectedId);
    if (idx > 0) {
      setSelectedId(TIMELINE_NODES[idx - 1].id);
    }
  };

  const goNext = () => {
    const idx = TIMELINE_NODES.findIndex((n) => n.id === selectedId);
    if (idx < TIMELINE_NODES.length - 1) {
      setSelectedId(TIMELINE_NODES[idx + 1].id);
    }
  };

  // 顶部时间显示滚轮切换
  useEffect(() => {
    const el = timeDisplayRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelCooldown.current) return;

      wheelCooldown.current = true;
      if (e.deltaY > 0) {
        goNext();
      } else {
        goPrev();
      }

      setTimeout(() => {
        wheelCooldown.current = false;
      }, 300);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [selectedId]);

  // 计算三个纪元标识的可见度（基于滚动进度的视口锚定方式）
  // AD: 最左端可见度最高，向右滚动逐渐降低
  // OE: 中间区域可见度最高
  // NE: 最右端可见度最高，向左滚动逐渐降低
  const eraVisibilities = useMemo(() => {
    const el = containerRef.current;
    if (!el) return { AD: 1, OE: 0, NE: 0 };

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return { AD: 0.5, OE: 0.5, NE: 0.5 };

    const progress = scrollLeft / maxScroll; // 0 ~ 1

    // 三段式：0-0.33 AD主导，0.33-0.66 OE主导，0.66-1 NE主导
    const adVis = Math.max(0, 1 - progress * 3); // 1 → 0 (0~0.33)
    const oeVis = Math.max(0, 1 - Math.abs(progress - 0.5) * 4); // 0 → 1 → 0 (0.25~0.75)
    const neVis = Math.max(0, (progress - 0.66) * 3); // 0 → 1 (0.66~1)

    // 平滑过渡：保证每段之间有自然重叠
    return {
      AD: Math.min(1, adVis + oeVis * 0.3),
      OE: Math.min(1, oeVis),
      NE: Math.min(1, neVis + oeVis * 0.3),
    };
  }, [scrollLeft]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-6"
          >
            <Database className="size-5 text-foreground/40 animate-pulse" />
            <span className="text-xs tracking-[0.3em] text-foreground/40 uppercase font-mono">
              Loading Archive
            </span>
          </motion.div>
          <div className="w-64 h-px bg-foreground/10 relative overflow-hidden rounded-full">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-y-0 w-1/3 bg-foreground/30 rounded-full"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-[10px] tracking-[0.2em] text-foreground/25 font-mono"
          >
            SYNCING TIMELINE DATA...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* ===== 后景层：固定不动 ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* 网点效果 */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '6px 6px',
          }}
        />
        {/* 细网格 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0_0_0_0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0_0_0_0.012)_1px,transparent_1px)] bg-[size:80px_80px]" />

        {/* 几何碎片 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <polygon points="80,60 200,60 200,140 140,140 140,200 80,200" fill="currentColor" className="text-foreground" />
          <polygon points="220,80 300,80 300,160 220,160" fill="currentColor" className="text-foreground" />
          <polygon points="600,120 720,120 720,220 640,220 640,300 600,300" fill="currentColor" className="text-foreground" />
          <polygon points="750,170 850,170 850,240 750,240" fill="currentColor" className="text-foreground" />
          <polygon points="100,650 220,650 220,750 160,750 160,830 100,830" fill="currentColor" className="text-foreground" />
          <polygon points="1200,550 1320,550 1320,630 1260,630 1260,700 1200,700" fill="currentColor" className="text-foreground" />
          <polygon points="1350,600 1450,600 1450,670 1350,670" fill="currentColor" className="text-foreground" />
          {/* 散落小方块 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x={80 + (i * 127) % 1400}
              y={60 + ((i * 83) % 780)}
              width={10 + (i % 3) * 6}
              height={10 + (i % 3) * 6}
              fill="currentColor"
              className="text-foreground"
              opacity={0.4 + (i % 3) * 0.2}
            />
          ))}
        </svg>

        {/* 边缘渐隐 */}
        <div className="absolute top-0 left-0 w-full h-[25vh] bg-gradient-to-b from-background via-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-background via-background/90 to-transparent" />
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-background to-transparent z-10" />
      </div>

      {/* ===== 顶部信息栏（仅大时间数字 + 纪元标识） ===== */}
      <div className="relative z-20 pt-28 pb-2 px-6 lg:px-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-end">
            <div
              ref={timeDisplayRef}
              className="text-right cursor-ns-resize select-none group"
              title="滚轮上下切换时间节点"
            >
              <div className="flex items-center gap-2 justify-end mb-2">
                <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-foreground/40">
                  {selectedNode?.era}
                </span>
              </div>
              <div className="flex items-baseline gap-2 justify-end">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectedNode?.time}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl md:text-6xl font-extralight tracking-wider text-foreground font-mono tabular-nums leading-none"
                  >
                    {selectedNode?.timeNumeric}
                  </motion.span>
                </AnimatePresence>
                <span className="text-xs tracking-[0.2em] text-foreground/40 font-mono">
                  {selectedNode?.eraCode}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <MousePointer2 className="size-2.5 text-foreground/25" />
                <span className="text-[9px] tracking-[0.2em] text-foreground/25 font-mono">
                  SCROLL TO SWITCH
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 时间轴主区域 ===== */}
      <div className="relative z-10 py-6 md:py-10">
        {/* 视差中景层：纪元大标识（视口锚定式） */}
        <div className="absolute top-0 left-0 w-full pointer-events-none z-[5] overflow-hidden" style={{ height: '320px' }}>
          {/* AD 旧世界 - 锚定视口左侧 */}
          <motion.div
            className="absolute top-20 text-center whitespace-nowrap"
            style={{ left: '8%' }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: eraVisibilities.AD * 0.9,
              x: 0,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85], y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="text-[10px] tracking-[0.5em] text-foreground/35 uppercase font-mono mb-2">
                OLD WORLD
              </div>
              <div
                className="text-5xl md:text-7xl font-bold tracking-[0.15em] text-foreground/[0.12]"
                style={{ fontFamily: "'Helvetica Neue', 'Arial Narrow', sans-serif", fontWeight: 700 }}
              >
                舊世界
              </div>
              <div className="text-xs tracking-[0.4em] text-foreground/25 font-mono mt-3">
                — A.D. —
              </div>
            </motion.div>
          </motion.div>

          {/* OE 次纪元 - 锚定视口中间 */}
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{
              opacity: eraVisibilities.OE * 0.9,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85], y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="text-[10px] tracking-[0.5em] text-foreground/35 uppercase font-mono mb-2">
                ORIGIN ERA
              </div>
              <div
                className="text-6xl md:text-8xl font-bold tracking-[0.15em] text-foreground/[0.12]"
                style={{ fontFamily: "'Helvetica Neue', 'Arial Narrow', sans-serif", fontWeight: 700 }}
              >
                次紀元
              </div>
              <div className="text-xs tracking-[0.4em] text-foreground/25 font-mono mt-3">
                — O.E. —
              </div>
            </motion.div>
          </motion.div>

          {/* NE 新纪元 - 锚定视口右侧 */}
          <motion.div
            className="absolute top-20 text-center whitespace-nowrap"
            style={{ right: '8%' }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: eraVisibilities.NE * 0.9,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85], y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="text-[10px] tracking-[0.5em] text-foreground/35 uppercase font-mono mb-2">
                NEO ERA
              </div>
              <div
                className="text-5xl md:text-7xl font-bold tracking-[0.15em] text-foreground/[0.12]"
                style={{ fontFamily: "'Helvetica Neue', 'Arial Narrow', sans-serif", fontWeight: 700 }}
              >
                新紀元
              </div>
              <div className="text-xs tracking-[0.4em] text-foreground/25 font-mono mt-3">
                — N.E. —
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 前景层：时间轴主线 + 节点 */}
        <div
          ref={containerRef}
          onScroll={onScroll}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className={`relative w-full overflow-x-auto scrollbar-hide cursor-grab select-none ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          style={{ scrollbarWidth: 'none' }}
        >
          <div
            ref={trackRef}
            className="relative px-[50vw] py-8 min-w-max"
            style={{ height: '360px' }}
          >
            {/* ===== 背景波动曲线 ===== */}
            <div
              className="absolute left-0 pointer-events-none overflow-visible"
              style={{ top: '12px', width: TRACK_WIDTH, height: '200px' }}
            >
              <svg className="w-full h-full" viewBox={`0 0 ${TRACK_WIDTH} 200`} preserveAspectRatio="none">
                {/* 曲线 1 - 最淡最宽幅 */}
                <motion.path
                  d={`M 0 100 Q ${TRACK_WIDTH * 0.1} 60 ${TRACK_WIDTH * 0.2} 100 T ${TRACK_WIDTH * 0.4} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.8} 100 T ${TRACK_WIDTH} 100`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  className="text-foreground/[0.10]"
                  animate={{
                    d: [
                      `M 0 100 Q ${TRACK_WIDTH * 0.1} 60 ${TRACK_WIDTH * 0.2} 100 T ${TRACK_WIDTH * 0.4} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.8} 100 T ${TRACK_WIDTH} 100`,
                      `M 0 100 Q ${TRACK_WIDTH * 0.1} 140 ${TRACK_WIDTH * 0.2} 100 T ${TRACK_WIDTH * 0.4} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.8} 100 T ${TRACK_WIDTH} 100`,
                      `M 0 100 Q ${TRACK_WIDTH * 0.1} 60 ${TRACK_WIDTH * 0.2} 100 T ${TRACK_WIDTH * 0.4} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.8} 100 T ${TRACK_WIDTH} 100`,
                    ],
                  }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* 曲线 2 - 中等频率 */}
                <motion.path
                  d={`M 0 100 Q ${TRACK_WIDTH * 0.06} 70 ${TRACK_WIDTH * 0.12} 100 T ${TRACK_WIDTH * 0.24} 100 T ${TRACK_WIDTH * 0.36} 100 T ${TRACK_WIDTH * 0.48} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.72} 100 T ${TRACK_WIDTH * 0.84} 100 T ${TRACK_WIDTH} 100`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-foreground/[0.12]"
                  animate={{
                    d: [
                      `M 0 100 Q ${TRACK_WIDTH * 0.06} 70 ${TRACK_WIDTH * 0.12} 100 T ${TRACK_WIDTH * 0.24} 100 T ${TRACK_WIDTH * 0.36} 100 T ${TRACK_WIDTH * 0.48} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.72} 100 T ${TRACK_WIDTH * 0.84} 100 T ${TRACK_WIDTH} 100`,
                      `M 0 100 Q ${TRACK_WIDTH * 0.06} 130 ${TRACK_WIDTH * 0.12} 100 T ${TRACK_WIDTH * 0.24} 100 T ${TRACK_WIDTH * 0.36} 100 T ${TRACK_WIDTH * 0.48} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.72} 100 T ${TRACK_WIDTH * 0.84} 100 T ${TRACK_WIDTH} 100`,
                      `M 0 100 Q ${TRACK_WIDTH * 0.06} 70 ${TRACK_WIDTH * 0.12} 100 T ${TRACK_WIDTH * 0.24} 100 T ${TRACK_WIDTH * 0.36} 100 T ${TRACK_WIDTH * 0.48} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.72} 100 T ${TRACK_WIDTH * 0.84} 100 T ${TRACK_WIDTH} 100`,
                    ],
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
                {/* 曲线 3 - 高频细密 */}
                <motion.path
                  d={`M 0 100 Q ${TRACK_WIDTH * 0.03} 80 ${TRACK_WIDTH * 0.06} 100 T ${TRACK_WIDTH * 0.12} 100 T ${TRACK_WIDTH * 0.18} 100 T ${TRACK_WIDTH * 0.24} 100 T ${TRACK_WIDTH * 0.3} 100 T ${TRACK_WIDTH * 0.36} 100 T ${TRACK_WIDTH * 0.42} 100 T ${TRACK_WIDTH * 0.48} 100 T ${TRACK_WIDTH * 0.54} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.66} 100 T ${TRACK_WIDTH * 0.72} 100 T ${TRACK_WIDTH * 0.78} 100 T ${TRACK_WIDTH * 0.84} 100 T ${TRACK_WIDTH * 0.9} 100 T ${TRACK_WIDTH * 0.96} 100 T ${TRACK_WIDTH} 100`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  className="text-foreground/[0.15]"
                  animate={{
                    d: [
                      `M 0 100 Q ${TRACK_WIDTH * 0.03} 80 ${TRACK_WIDTH * 0.06} 100 T ${TRACK_WIDTH * 0.12} 100 T ${TRACK_WIDTH * 0.18} 100 T ${TRACK_WIDTH * 0.24} 100 T ${TRACK_WIDTH * 0.3} 100 T ${TRACK_WIDTH * 0.36} 100 T ${TRACK_WIDTH * 0.42} 100 T ${TRACK_WIDTH * 0.48} 100 T ${TRACK_WIDTH * 0.54} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.66} 100 T ${TRACK_WIDTH * 0.72} 100 T ${TRACK_WIDTH * 0.78} 100 T ${TRACK_WIDTH * 0.84} 100 T ${TRACK_WIDTH * 0.9} 100 T ${TRACK_WIDTH * 0.96} 100 T ${TRACK_WIDTH} 100`,
                      `M 0 100 Q ${TRACK_WIDTH * 0.03} 120 ${TRACK_WIDTH * 0.06} 100 T ${TRACK_WIDTH * 0.12} 100 T ${TRACK_WIDTH * 0.18} 100 T ${TRACK_WIDTH * 0.24} 100 T ${TRACK_WIDTH * 0.3} 100 T ${TRACK_WIDTH * 0.36} 100 T ${TRACK_WIDTH * 0.42} 100 T ${TRACK_WIDTH * 0.48} 100 T ${TRACK_WIDTH * 0.54} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.66} 100 T ${TRACK_WIDTH * 0.72} 100 T ${TRACK_WIDTH * 0.78} 100 T ${TRACK_WIDTH * 0.84} 100 T ${TRACK_WIDTH * 0.9} 100 T ${TRACK_WIDTH * 0.96} 100 T ${TRACK_WIDTH} 100`,
                      `M 0 100 Q ${TRACK_WIDTH * 0.03} 80 ${TRACK_WIDTH * 0.06} 100 T ${TRACK_WIDTH * 0.12} 100 T ${TRACK_WIDTH * 0.18} 100 T ${TRACK_WIDTH * 0.24} 100 T ${TRACK_WIDTH * 0.3} 100 T ${TRACK_WIDTH * 0.36} 100 T ${TRACK_WIDTH * 0.42} 100 T ${TRACK_WIDTH * 0.48} 100 T ${TRACK_WIDTH * 0.54} 100 T ${TRACK_WIDTH * 0.6} 100 T ${TRACK_WIDTH * 0.66} 100 T ${TRACK_WIDTH * 0.72} 100 T ${TRACK_WIDTH * 0.78} 100 T ${TRACK_WIDTH * 0.84} 100 T ${TRACK_WIDTH * 0.9} 100 T ${TRACK_WIDTH * 0.96} 100 T ${TRACK_WIDTH} 100`,
                    ],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
              </svg>
            </div>

            {/* 主线 */}
            <div
              className="absolute left-0 h-px bg-foreground/[0.12] pointer-events-none"
              style={{ top: '112px', width: TRACK_WIDTH }}
            />

            {/* 纪元分隔线 */}
            <div className="absolute w-px bg-foreground/[0.15] pointer-events-none" style={{ left: 520, top: '112px', height: '60px', transform: 'translateY(-50%)' }} />
            <div className="absolute w-px bg-foreground/[0.15] pointer-events-none" style={{ left: 1780, top: '112px', height: '80px', transform: 'translateY(-50%)' }} />

            {/* 所有节点：统一向下指示 */}
            {TIMELINE_NODES.map((node) => {
              const left = NODE_POSITIONS[node.id] ?? 0;
              const isNexus = node.id === 'NE-0001';
              const isKey = node.category === 'key';
              const isEmpty = node.category === 'empty';
              const isLocked = node.accessLevel === 'no-access';
              const isSelected = selectedId === node.id;

              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className="absolute"
                  style={{ left, top: '112px' }}
                >
                  {/* NEXUS 特殊节点 */}
                  {isNexus ? (
                    <div className="relative flex flex-col items-center" style={{ width: '200px' }}>
                      {/* 节点圆点（菱形 NEXUS）— 中心与主轴对齐 */}
                      <div className="relative -translate-y-1/2">
                        <button
                          onClick={() => handleNodeClick(node.id)}
                          className="relative z-10 group focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                          aria-label={node.title}
                        >
                        <motion.div
                          initial={false}
                          animate={{ scale: isSelected ? 1.3 : 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="relative"
                        >
                          {/* 外圈脉冲 */}
                          {isSelected && !isEmpty && !isLocked && (
                            <motion.div
                              animate={{ scale: [1, 2, 1], opacity: [0.25, 0, 0.25] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                              className="absolute inset-0 size-5 border border-foreground/25 rotate-45 -translate-x-0.5 -translate-y-0.5"
                            />
                          )}
                          {/* 主菱形 */}
                          <div
                            className={`size-5 rotate-45 border-2 transition-all duration-300 ${
                              isEmpty || isLocked
                                ? 'bg-foreground/10 border-foreground/20'
                                : isSelected
                                  ? 'bg-foreground border-foreground shadow-[0_0_20px_rgba(0_0_0_0.25)]'
                                  : 'bg-background border-foreground/40 group-hover:border-foreground/70'
                            }`}
                          />
                        </motion.div>
                        </button>
                      </div>

                      {/* 向下指示线 */}
                      <div
                        className={`w-px transition-all duration-300 ${
                          isSelected ? 'bg-foreground/35 h-6' : 'bg-foreground/12 h-4'
                        }`}
                      />

                      {/* 时间数字 + 事件名称 + MAIN STORY 标签 */}
                      <div className="text-center mt-1 w-full">
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: isSelected ? 1 : 0.55,
                            y: isSelected ? 0 : 2,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <div
                            className={`text-2xl md:text-3xl font-extralight tracking-wider font-mono tabular-nums mb-1 transition-colors duration-300 ${
                              isSelected ? 'text-foreground' : 'text-foreground/50'
                            } ${isEmpty || isLocked ? 'text-foreground/25' : ''}`}
                          >
                            {node.timeNumeric}
                          </div>
                          {isEmpty || isLocked ? (
                            <div className="inline-block px-2.5 py-0.5 bg-foreground/80 text-background text-[10px] tracking-wider font-mono rounded-sm">
                              {isEmpty ? 'NO DATA' : 'NO ACCESS'}
                            </div>
                          ) : (
                            <>
                              <div
                                className={`text-sm tracking-wider font-light transition-colors duration-300 ${
                                  isSelected ? 'text-foreground/80' : 'text-foreground/50'
                                }`}
                              >
                                {node.title}
                              </div>
                              {/* MAIN STORY 标签 — 仅 NE-1706 / NE-2755 / NE-2756 */}
                              {(node.id === 'NE-1706' || node.id === 'NE-2755' || node.id === 'NE-2756') && (
                                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 border border-foreground/20 text-[9px] tracking-[0.25em] text-foreground/50 font-mono uppercase rounded-full">
                                  Main Story
                                </div>
                              )}
                            </>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    /* 普通节点 */
                    <div className="relative flex flex-col items-center" style={{ width: '180px' }}>
                      {/* 节点圆点 — 中心与主轴对齐 */}
                      <div className="relative -translate-y-1/2">
                        <button
                          onClick={() => handleNodeClick(node.id)}
                          className="relative z-10 group focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                          aria-label={node.title}
                        >
                        <motion.div
                          initial={false}
                          animate={{ scale: isSelected ? (isKey ? 1.25 : 1.15) : isKey ? 0.9 : 0.75 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="relative"
                        >
                          {/* 选中脉冲 */}
                          {isSelected && !isEmpty && !isLocked && (
                            <motion.div
                              animate={{ scale: [1, 1.8, 1], opacity: [0.25, 0, 0.25] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                              className={`absolute inset-0 border border-foreground/25 ${
                                node.branch === 'vorwelt' ? 'rounded-full' : 'rotate-45'
                              }`}
                            />
                          )}
                          {/* 主圆点 */}
                          <div
                            className={`${isKey ? 'size-4' : 'size-3.5'} border transition-all duration-300 ${
                              isEmpty || isLocked
                                ? 'bg-foreground/10 border-foreground/20'
                                : isSelected
                                  ? 'bg-foreground border-foreground shadow-[0_0_14px_rgba(0_0_0_0.2)]'
                                  : 'bg-background border-foreground/30 group-hover:border-foreground/60'
                            } ${node.branch === 'vorwelt' ? 'rounded-full' : 'rotate-45'}`}
                          />
                          {/* 关键节点内点 */}
                          {isKey && !isEmpty && !isLocked && (
                            <div
                              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                                isSelected ? 'size-1.5 bg-background' : 'size-1 bg-foreground/40'
                              } ${node.branch === 'vorwelt' ? 'rounded-full' : ''}`}
                            />
                          )}
                          </motion.div>
                        </button>
                      </div>

                      {/* 向下指示线 */}
                      <div
                        className={`w-px transition-all duration-300 ${
                          isSelected ? 'bg-foreground/30 h-5' : 'bg-foreground/10 h-3.5'
                        }`}
                      />

                      {/* 时间数字 + 事件名称 + MAIN STORY 标签 */}
                      <div className="text-center mt-1 w-full">
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: isSelected ? 1 : 0.5,
                            y: isSelected ? 0 : 2,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <div
                            className={`text-xl md:text-2xl font-extralight tracking-wider font-mono tabular-nums mb-1 transition-colors duration-300 ${
                              isSelected ? 'text-foreground' : 'text-foreground/50'
                            } ${isEmpty || isLocked ? 'text-foreground/25' : ''}`}
                          >
                            {node.timeNumeric}
                          </div>
                          {isEmpty || isLocked ? (
                            <div className="inline-block px-2 py-0.5 bg-foreground/70 text-background text-[9px] tracking-wider font-mono rounded-sm">
                              {isEmpty ? 'NO DATA' : 'NO ACCESS'}
                            </div>
                          ) : (
                            <>
                              <div
                                className={`text-sm tracking-wider font-light transition-colors duration-300 ${
                                  isSelected ? 'text-foreground/75' : 'text-foreground/45'
                                }`}
                              >
                                {node.title}
                              </div>
                              {/* MAIN STORY 标签 — 仅 NE-1706 / NE-2755 / NE-2756 */}
                              {(node.id === 'NE-1706' || node.id === 'NE-2755' || node.id === 'NE-2756') && (
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 border border-foreground/15 text-[8px] tracking-[0.25em] text-foreground/45 font-mono uppercase rounded-full">
                                  Main Story
                                </div>
                              )}
                            </>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 导航箭头 + 节点指示器 */}
        <div className="flex justify-center gap-3 mt-2">
          <button
            onClick={goPrev}
            className="size-9 border border-foreground/15 hover:border-foreground/40 hover:bg-foreground/[0.03] transition-all duration-300 flex items-center justify-center text-foreground/60 hover:text-foreground rounded-lg shadow-[0_1px_4px_rgba(0_0_0_0.03)]"
            aria-label="上一节点"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1.5 px-4">
            {TIMELINE_NODES.map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedId(n.id)}
                className={`size-1.5 transition-all duration-300 rounded-full ${
                  n.id === selectedId
                    ? 'bg-foreground scale-150'
                    : 'bg-foreground/20 hover:bg-foreground/40'
                }`}
                aria-label={`跳转到 ${n.title}`}
              />
            ))}
          </div>
          <button
            onClick={goNext}
            className="size-9 border border-foreground/15 hover:border-foreground/40 hover:bg-foreground/[0.03] transition-all duration-300 flex items-center justify-center text-foreground/60 hover:text-foreground rounded-lg shadow-[0_1px_4px_rgba(0_0_0_0.03)]"
            aria-label="下一节点"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* ===== 简介卡片：圆角阴影卡片式 ===== */}
      <div className="relative z-10 px-6 lg:px-10 pb-28">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative bg-card/85 backdrop-blur-sm border border-foreground/[0.07] rounded-2xl shadow-[0_8px_32px_rgba(0_0_0_0.06),0_2px_8px_rgba(0_0_0_0.03)] p-7 md:p-9">
                  {/* 顶部信息 */}
                  <div className="flex items-start justify-between gap-6 mb-5 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-[10px] tracking-[0.3em] text-foreground/40 uppercase font-mono">
                          {selectedNode.eraCode} · {selectedNode.branch === 'mitwelt' ? 'MITWELT' : selectedNode.branch === 'vorwelt' ? 'VORWELT' : 'MAIN'}
                        </span>
                        <div className="h-px w-5 bg-foreground/12" />
                        <span className="text-[10px] tracking-wider text-foreground/25 font-mono">
                          NODE-{selectedNode.id}
                        </span>
                        {selectedNode.accessLevel === 'restricted' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-foreground/15 text-[9px] tracking-wider text-foreground/45 font-mono rounded-full">
                            <Lock className="size-2.5" />
                            RESTRICTED
                          </span>
                        )}
                        {selectedNode.accessLevel === 'no-access' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-foreground/90 text-background text-[9px] tracking-wider font-mono rounded-full">
                            <AlertTriangle className="size-2.5" />
                            NO ACCESS
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-light tracking-[0.1em] text-foreground mb-1">
                        {selectedNode.title}
                      </h2>
                      {selectedNode.subtitle && selectedNode.category !== 'empty' && (
                        <p className="text-sm text-foreground/40 tracking-[0.15em] font-light italic">
                          {selectedNode.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] tracking-[0.2em] text-foreground/35 font-mono mb-1">
                        TIME
                      </div>
                      <div className="text-base text-foreground/65 font-light tracking-wider font-mono">
                        {selectedNode.time}
                      </div>
                    </div>
                  </div>

                  {/* 分隔线 */}
                  <div className="h-px bg-gradient-to-r from-foreground/15 via-foreground/5 to-transparent mb-5" />

                  {/* 正文 */}
                  {selectedNode.category !== 'empty' && selectedNode.accessLevel !== 'no-access' ? (
                    <>
                      <p className="text-foreground/65 font-light leading-[2] mb-7 text-sm md:text-base">
                        {selectedNode.summary}
                      </p>
                    </>
                  ) : (
                    <div className="py-4 text-center mb-7">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/90 text-background text-xs tracking-[0.2em] font-mono mb-4 rounded-lg">
                        <AlertTriangle className="size-3.5" />
                        {selectedNode.category === 'empty' ? 'NO EVENT DATA' : 'NO ACCESS'}
                      </div>
                      <p className="text-foreground/40 text-sm font-light tracking-wider">
                        {selectedNode.summary}
                      </p>
                      <p className="text-foreground/20 text-xs font-mono mt-2">
                        ERROR_CODE: 0x2F4A · {selectedNode.category === 'empty' ? 'DATA_CORRUPTED' : 'INSUFFICIENT_PERMISSION'}
                      </p>
                    </div>
                  )}

                  {/* 相关角色 */}
                  <div className="mb-7">
                    <div className="text-[10px] tracking-[0.3em] text-foreground/30 uppercase font-mono mb-3">
                      Related Entities
                    </div>
                    {selectedNode.characters && selectedNode.characters.length > 0 ? (
                       <div className="py-3 px-4 border border-dashed border-foreground/[0.08] rounded-lg bg-foreground/[0.015]">
                         <div className="flex items-center justify-center gap-2 mb-1.5">
                           <AlertTriangle className="size-3 text-foreground/20" />
                           <span className="text-[9px] tracking-[0.25em] font-mono text-foreground/25 uppercase">
                             Entity Data Hidden
                           </span>
                         </div>
                         <div className="text-center text-[9px] font-mono text-foreground/15 tracking-wider">
                           查看完整档案以解锁关系网络
                         </div>
                       </div>
                    ) : (
                       <div className="py-3 px-4 border border-dashed border-foreground/[0.08] rounded-lg bg-foreground/[0.015]">
                         <div className="flex items-center justify-center gap-2 mb-1.5">
                           <AlertTriangle className="size-3 text-foreground/20" />
                           <span className="text-[9px] tracking-[0.25em] font-mono text-foreground/25 uppercase">
                             No Entity Data
                           </span>
                         </div>
                         <div className="text-center text-[9px] font-mono text-foreground/15 tracking-wider">
                           ERROR_CODE: 0x1E3B · DATA_UNAVAILABLE
                         </div>
                       </div>
                    )}
                  </div>

                  {/* CTA 按钮 */}
                  {selectedNode.category !== 'empty' && selectedNode.accessLevel !== 'no-access' && (
                    <div className="flex items-center justify-between pt-4 border-t border-foreground/[0.05]">
                      <span className="text-[10px] tracking-[0.2em] text-foreground/25 font-mono">
                        点击查看完整档案
                      </span>
                      <button
                        onClick={() => navigate(`/story/${selectedNode.id}`)}
                        className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 rounded-xl shadow-[0_2px_12px_rgba(0_0_0_0.12)] hover:shadow-[0_4px_20px_rgba(0_0_0_0.18)] hover:-translate-y-0.5"
                      >
                        <span className="text-xs tracking-[0.2em] uppercase font-mono">查看详情</span>
                        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 底部柔和阴影 */}
                <div className="absolute -inset-x-6 -bottom-3 h-6 bg-foreground/[0.03] blur-xl -z-10 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== 底部状态栏 ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/85 backdrop-blur-md border-t border-foreground/[0.06]">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10 h-9 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-wider text-foreground/30 font-mono">
              U26&apos; / TERMINAL v0.85
            </span>
            <div className="h-3 w-px bg-foreground/10" />
            <span className="text-[10px] tracking-wider text-foreground/25 font-mono">
              NODES: {TIMELINE_NODES.length}
            </span>
            <div className="h-3 w-px bg-foreground/10" />
            <span className="text-[10px] tracking-wider text-foreground/25 font-mono">
              ERAS: 3
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-wider text-foreground/25 font-mono">
              DRAG · SCROLL · CLICK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
