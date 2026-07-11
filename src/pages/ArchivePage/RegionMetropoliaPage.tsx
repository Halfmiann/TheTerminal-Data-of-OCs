import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ChevronUp, ChevronDown, Users, Building2, Lock } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';

// 城市数据
const CITIES = [
  { id: 'great-metropolia', name: '大墨托波利亚', nameEn: 'Great Metropolia', type: '首府', typeEn: 'CAPITAL' },
  { id: 'wooden-city', name: '沃顿城', nameEn: 'Wooden City', type: '中心城市', typeEn: 'CENTRAL' },
  { id: 'robert-city', name: '洛伯特市', nameEn: 'Robert City', type: '中心城市', typeEn: 'CENTRAL' },
  { id: 'monica', name: '莫妮卡', nameEn: 'Monica', type: '主要城市', typeEn: 'MAJOR' },
  { id: 'marry-bay', name: '玛丽港', nameEn: 'Marry Bay', type: '主要城市', typeEn: 'MAJOR' },
  { id: 'no-access', name: '/NO ACCESS/', nameEn: '—', type: '中心城市', typeEn: 'CENTRAL', locked: true },
];

export default function RegionMetropoliaPage() {
  const [searchParams] = useSearchParams();
  const cityFromUrl = searchParams.get('city');

  const initialIndex = useMemo(() => {
    if (cityFromUrl) {
      const idx = CITIES.findIndex((c) => c.id === cityFromUrl);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [cityFromUrl]);

  const [activeCityIndex, setActiveCityIndex] = useState(initialIndex);
  const citySelectorRef = useRef<HTMLDivElement>(null);

  // URL 参数变化时同步选中城市
  useEffect(() => {
    if (cityFromUrl) {
      const idx = CITIES.findIndex((c) => c.id === cityFromUrl);
      if (idx >= 0) setActiveCityIndex(idx);
    }
  }, [cityFromUrl]);

  const activeCity = CITIES[activeCityIndex];

  // 城市选择器滚轮切换
  useEffect(() => {
    const el = citySelectorRef.current;
    if (!el) return;

    let wheelAccum = 0;
    let lastTime = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastTime > 300) wheelAccum = 0;
      lastTime = now;
      wheelAccum += e.deltaY;

      if (wheelAccum > 50) {
        goNextCity();
        wheelAccum = 0;
      } else if (wheelAccum < -50) {
        goPrevCity();
        wheelAccum = 0;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeCityIndex]);

  const goPrevCity = () => {
    let prev = activeCityIndex - 1;
    while (prev >= 0 && CITIES[prev].locked) prev--;
    if (prev >= 0) setActiveCityIndex(prev);
  };

  const goNextCity = () => {
    let next = activeCityIndex + 1;
    while (next < CITIES.length && CITIES[next].locked) next++;
    if (next < CITIES.length) setActiveCityIndex(next);
  };

  return (
    <div className="relative min-h-screen bg-background pt-24 pb-32 overflow-hidden">
      {/* Background - 半色调网点 + 瞄准线（后景） */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.6]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
            backgroundSize: '5px 5px',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '90vmin', height: '90vmin' }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: `${25 + i * 16}%`,
                height: `${25 + i * 16}%`,
                border: `1px solid rgba(0,0,0,${0.015 + i * 0.005})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* 顶部标题栏 - 深灰色，中英文标题加粗在同一栏位 */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-foreground/70 backdrop-blur-xl border border-foreground/[0.08] rounded-2xl p-5 md:p-6 mb-6 flex items-center justify-between"
        >
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-[0.25em] text-white">
              大都会
            </h1>
            <span className="text-sm tracking-[0.3em] text-white/60 font-mono uppercase font-medium">
              METROPOLIA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/10 text-white/80 text-[10px] tracking-[0.3em] font-mono uppercase rounded-full border border-white/15">
              MITWELT
            </span>
            <ChevronDown className="size-4 text-white/50" />
          </div>
        </motion.div>

        {/* 地图区域 - 留空待补充 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-background/60 backdrop-blur-xl border border-foreground/[0.08] rounded-2xl overflow-hidden mb-6 shadow-[0_8px_40px_rgba(0_0_0_0.06)]"
        >
          <div className="relative aspect-[16/10] w-full flex flex-col items-center justify-center">
            {/* 背景网格 */}
            <div
              className="absolute inset-0 opacity-[0.3]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* 占位内容 */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="size-16 rounded-full border border-foreground/10 flex items-center justify-center mb-4 bg-foreground/[0.02]">
                <Building2 className="size-6 text-foreground/20" strokeWidth={1} />
              </div>
              <h3 className="text-base font-light tracking-[0.25em] text-foreground/35 mb-2">
                地图待补充
              </h3>
              <p className="text-xs text-foreground/20 tracking-wider max-w-xs">
                区域地图将在后续版本中开放
              </p>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="size-1 rounded-full bg-foreground/10" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 地区概况 - 左右双栏 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
        >
          {/* 左侧数据卡片 */}
          <div className="lg:col-span-1">
            <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] rounded-2xl p-6 h-full">
              <div className="space-y-6">
                {/* 人口 */}
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-foreground/35 font-mono uppercase mb-2">
                    POPULATION
                  </div>
                  <div className="text-3xl font-extralight tracking-wider text-foreground/70 tabular-nums">
                    9<span className="text-lg">亿</span>
                  </div>
                  <div className="text-xs text-foreground/40 mt-1">人口总量</div>
                </div>

                <div className="h-px bg-foreground/[0.08]" />

                {/* 城市数 */}
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-foreground/35 font-mono uppercase mb-2">
                    CITIES
                  </div>
                  <div className="text-3xl font-extralight tracking-wider text-foreground/70 tabular-nums">
                    6
                  </div>
                  <div className="text-xs text-foreground/40 mt-1">城市 · 6 座</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧简介卡片 */}
          <div className="lg:col-span-2">
            <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] rounded-2xl p-6 md:p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-1.5 bg-foreground/40 rotate-45" />
                <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
                  REGION PROFILE
                </span>
                <div className="flex-1 h-px bg-foreground/10" />
              </div>

              <div className="space-y-4 text-sm text-foreground/65 font-light leading-[2]">
                <p>
                  大都会地区是第一个建立的聚居地，也是四块大陆里最繁荣的地区。
                </p>
                <p>
                  大都会地区有着6座都市，主要分布在大陆东岸。大都会的中央市为<span className="text-foreground/80 font-normal">大墨托波利亚（Great Metropolia）</span>，座落于四神峰北侧，在大陆的中央地区。既是该地区的经济文化中心，也是共同世界中的第二大超级都市。
                </p>
                <p>
                  大墨托波利亚的西北部与<span className="text-foreground/80 font-normal">沃顿市（Wooden City）</span>相连。沃顿市在 N.E.1002 年之后成为了副中心城市，目前主要以娱乐服务业等第三产业为支柱产业。
                </p>
                <p>
                  两河入海口为该地区重要的军工业城市<span className="text-foreground/80 font-normal">洛伯特（Robert City）</span>，也是重要的对外贸易口岸。
                </p>
                <p>
                  东南部为旅游产业极度发达的城市——<span className="text-foreground/80 font-normal">莫妮卡（Monica）</span>。该市以其独特的民风和异常宁静的光环海（Aura Sea）闻名于世。
                </p>
                <p className="text-foreground/45 italic border-l-2 border-foreground/15 pl-4">
                  该地区也是 The Last Carnival 主线系列的主舞台。
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 城市切换控制栏 - 左右两侧分布，在地区概况下方、城市简介上方 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          {/* 左侧：城市切换按钮 */}
          <div
            ref={citySelectorRef}
            className="relative bg-background/60 backdrop-blur-xl border border-foreground/[0.08] rounded-xl px-6 py-3 min-w-[240px] cursor-ns-resize group shadow-[0_4px_20px_rgba(0_0_0_0.04)]"
          >
            {/* 上下箭头 */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 text-foreground/30">
              <ChevronUp className="size-3" />
              <ChevronDown className="size-3" />
            </div>

            {/* 城市名 */}
            <div className="text-center pl-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCity.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="text-base font-medium tracking-[0.15em] text-foreground/75">
                    {activeCity.name}
                  </div>
                  <div className="text-[10px] tracking-[0.3em] text-foreground/35 font-mono uppercase mt-0.5">
                    {activeCity.nameEn}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 序号 */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider text-foreground/30 font-mono tabular-nums">
              {String(activeCityIndex + 1).padStart(2, '0')} / {String(CITIES.length).padStart(2, '0')}
            </div>
          </div>

          {/* 右侧：城市类型标签按钮 - 等大 */}
          <div
            className={`px-6 py-3 rounded-xl border text-center min-w-[180px] transition-all duration-300 ${
              activeCity.type === '首府'
                ? 'bg-foreground/[0.08] border-foreground/[0.12] text-foreground/70'
                : 'bg-background/60 backdrop-blur-xl border-foreground/[0.08] text-foreground/50'
            }`}
          >
            <div className="text-sm tracking-[0.2em] font-medium">{activeCity.type}</div>
            <div className="text-[9px] tracking-[0.3em] text-foreground/35 font-mono uppercase mt-0.5">
              {activeCity.typeEn}
            </div>
          </div>
        </motion.div>

        {/* 底部区域 - 城市介绍 + 人物组织 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* 城市介绍 - NO ACCESS */}
          <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="size-3.5 text-foreground/40" />
              <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
                CITY INTRODUCTION
              </span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>

            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="size-14 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center mb-4">
                <Lock className="size-5 text-foreground/25" strokeWidth={1.2} />
              </div>
              <h3 className="text-lg font-light tracking-[0.2em] text-foreground/40 mb-2">
                NO ACCESS
              </h3>
              <p className="text-xs text-foreground/25 tracking-wider">
                该城市详细档案暂无访问权限
              </p>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="size-1 rounded-full bg-foreground/12" />
                ))}
              </div>
            </div>
          </div>

          {/* 人物组织关系 - NO ACCESS */}
          <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="size-3.5 text-foreground/40" />
              <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
                CHARACTERS & ORGANIZATIONS
              </span>
              <div className="flex-1 h-px bg-foreground/10" />
            </div>

            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="size-14 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center mb-4">
                <Lock className="size-5 text-foreground/25" strokeWidth={1.2} />
              </div>
              <h3 className="text-lg font-light tracking-[0.2em] text-foreground/40 mb-2">
                NO ACCESS
              </h3>
              <p className="text-xs text-foreground/25 tracking-wider">
                人物与组织关系档案暂无访问权限
              </p>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="size-1 rounded-full bg-foreground/12" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
