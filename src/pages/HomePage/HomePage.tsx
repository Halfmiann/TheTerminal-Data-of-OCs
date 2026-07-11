import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { showHeaderNav } from '@/components/Header';

// 开场动画阶段
const PHASE = {
  HIDDEN: 0,
  ICON_APPEAR: 1,    // 关键帧1: icon弹性展开
  TITLE_SLIDE: 2,    // 关键帧2: icon左移+标题滑入
  SYSTEM_INIT: 3,    // 关键帧3: 系统初始化文字
  WELCOME: 4,        // 关键帧4: Welcome+时间轴
  MAIN: 5,           // 主界面
};

const INIT_LINES = [
  '/VERIFYING SECURITY SYSTEM... PASSED',
  '/SYSTEM PERMISSION CHECK COMPLETE',
  '/INITIALIZING SYSTEM... DONE',
  '/LOADING INTERFACE...',
];

export default function HomePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(PHASE.HIDDEN);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  // 启动序列
  useEffect(() => {
    const timers: number[] = [];

    // Phase 1: icon弹性展开
    timers.push(window.setTimeout(() => setPhase(PHASE.ICON_APPEAR), 300));

    // Phase 2: icon左移 + 标题滑入
    timers.push(window.setTimeout(() => setPhase(PHASE.TITLE_SLIDE), 1400));

    // Phase 3: 系统初始化文字逐行出现
    timers.push(
      window.setTimeout(() => {
        setPhase(PHASE.SYSTEM_INIT);
        INIT_LINES.forEach((line, i) => {
          timers.push(
            window.setTimeout(() => {
              setVisibleLines((prev) => [...prev, line]);
            }, 250 + i * 320)
          );
        });
      }, 2200)
    );

    // Phase 4: Welcome + 时间轴（替换加载文字位置）
    timers.push(
      window.setTimeout(() => {
        setPhase(PHASE.WELCOME);
      }, 3800)
    );

    // Phase 5: 主界面
    timers.push(
      window.setTimeout(() => {
        setPhase(PHASE.MAIN);
        // 首次进入首页，开场动画完成后显示导航栏
        showHeaderNav();
      }, 6000)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const skipIntro = () => {
    setPhase(PHASE.MAIN);
    // 跳过开场也显示导航
    showHeaderNav();
  };

  return (
    <div
      className="relative min-h-screen bg-background overflow-hidden"
      onClick={phase < PHASE.MAIN ? skipIntro : undefined}
    >
      {/* ===== Background ===== */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base - 浅米白 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fafaf8] via-background to-[#f7f7f4]" />

        {/* Halftone dot pattern - 半色调网点 */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
            backgroundSize: '6px 6px',
          }}
        />

        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0_0_0_0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0_0_0_0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* ===== Boot sequence overlay ===== */}
      <AnimatePresence>
        {phase < PHASE.MAIN && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex items-center justify-center px-6"
          >
            <div className="relative w-full max-w-4xl">
              {/* Main content row: icon + title + terminal text */}
              <div className="flex items-center justify-center">
                {/* Logo Icon */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: phase >= PHASE.ICON_APPEAR ? 1 : 0,
                    opacity: phase >= PHASE.ICON_APPEAR ? 1 : 0,
                    x: phase >= PHASE.TITLE_SLIDE ? 0 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 16,
                    mass: 0.9,
                  }}
                  className="relative shrink-0"
                >
                  <LogoIcon size={120} />
                </motion.div>

                {/* Title - SIMULATED DATA TERMINAL */}
                <AnimatePresence>
                  {phase >= PHASE.TITLE_SLIDE && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        type: 'spring',
                        stiffness: 180,
                        damping: 20,
                        delay: 0.1,
                      }}
                      className="ml-8"
                    >
                      <div className="flex flex-col leading-[0.92]">
                        <span
                          className="text-5xl md:text-7xl font-black tracking-tight text-foreground uppercase"
                          style={{ fontFamily: "'Helvetica Neue Condensed Bold', 'Arial Narrow', sans-serif", letterSpacing: '-0.02em' }}
                        >
                          SIMULATED
                        </span>
                        <span
                          className="text-5xl md:text-7xl font-black tracking-tight text-foreground uppercase"
                          style={{ fontFamily: "'Helvetica Neue Condensed Bold', 'Arial Narrow', sans-serif", letterSpacing: '-0.02em' }}
                        >
                          DATA
                        </span>
                        <span
                          className="text-5xl md:text-7xl font-black tracking-tight text-foreground uppercase"
                          style={{ fontFamily: "'Helvetica Neue Condensed Bold', 'Arial Narrow', sans-serif", letterSpacing: '-0.02em' }}
                        >
                          TERMINAL
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Right side: terminal text / Welcome (替换关系) */}
                <div className="ml-12 w-80 shrink-0 relative" style={{ height: 120 }}>
                  {/* Terminal init lines - Phase 3 */}
                  <AnimatePresence mode="wait">
                    {phase >= PHASE.SYSTEM_INIT && phase < PHASE.WELCOME && (
                      <motion.div
                        key="terminal"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="absolute top-1/2 -translate-y-1/2 right-0 text-right space-y-1.5"
                      >
                        {visibleLines.map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="text-xs md:text-sm text-foreground/40 italic tracking-wide whitespace-nowrap"
                            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}
                          >
                            {line}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Welcome! - Phase 4 (替换终端文字位置) */}
                    {phase >= PHASE.WELCOME && (
                      <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 18,
                          delay: 0.15,
                        }}
                        className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-3"
                      >
                        {/* Circular check icon */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 16,
                            delay: 0.1,
                          }}
                          className="size-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0"
                        >
                          <Check className="size-4 text-foreground/60" strokeWidth={2.5} />
                        </motion.div>
                        {/* Welcome text - italic serif */}
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
                          className="text-xl md:text-2xl text-foreground/55"
                          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}
                        >
                          Welcome!
                        </motion.span>
                        {/* Glow ellipse */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-14 rounded-full bg-foreground/[0.06] blur-xl pointer-events-none"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom: timeline bar + wave curves - 从关键帧4开始 */}
              <AnimatePresence>
                {phase >= PHASE.WELCOME && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-16 relative h-16"
                  >
                    {/* Wave curves - background */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 64" preserveAspectRatio="none">
                      <motion.path
                        d="M 0 32 Q 200 16 400 32 T 800 32"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-foreground/[0.08]"
                        animate={{
                          d: [
                            'M 0 32 Q 200 16 400 32 T 800 32',
                            'M 0 32 Q 200 48 400 32 T 800 32',
                            'M 0 32 Q 200 16 400 32 T 800 32',
                          ],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <motion.path
                        d="M 0 40 Q 260 22 520 40 T 800 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-foreground/[0.05]"
                        animate={{
                          d: [
                            'M 0 40 Q 260 22 520 40 T 800 40',
                            'M 0 40 Q 260 58 520 40 T 800 40',
                            'M 0 40 Q 260 22 520 40 T 800 40',
                          ],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      />
                      <motion.path
                        d="M 0 24 Q 140 40 280 24 T 560 24 T 800 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-foreground/[0.04]"
                        animate={{
                          d: [
                            'M 0 24 Q 140 40 280 24 T 560 24 T 800 24',
                            'M 0 24 Q 140 8 280 24 T 560 24 T 800 24',
                            'M 0 24 Q 140 40 280 24 T 560 24 T 800 24',
                          ],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                      />
                    </svg>

                    {/* Timeline line - 从右向左生长 */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: phase >= PHASE.MAIN ? 1 : 0.65 }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                      style={{ originX: 1 }}
                      className="absolute top-1/2 right-0 -translate-y-1/2 w-[55%] h-px bg-gradient-to-l from-foreground/25 via-foreground/15 to-transparent"
                    />
                    {/* Left endpoint dot */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: phase >= PHASE.MAIN ? '-100%' : '0%',
                      }}
                      transition={{
                        opacity: { duration: 0.3, delay: 1.5 },
                        scale: { duration: 0.3, delay: 1.5 },
                        x: { duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
                      }}
                      className="absolute top-1/2 left-[45%] -translate-y-1/2"
                    >
                      <div className="size-2.5 rounded-full bg-foreground/40" />
                      <div className="absolute inset-0 size-2.5 rounded-full bg-foreground/30 animate-ping" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Skip hint */}
              {phase < PHASE.MAIN && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-foreground/20 uppercase font-mono"
                >
                  Click anywhere to skip
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Main Interface ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase >= PHASE.MAIN ? 1 : 0,
          y: phase >= PHASE.MAIN ? 0 : 20,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 min-h-screen flex flex-col justify-center px-6 lg:px-16 pt-24 pb-16"
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between flex-wrap gap-12">
            {/* Left: Logo + Title */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center -ml-4"
            >
              <LogoIcon size={180} />
              <div className="ml-7">
                <div className="flex flex-col leading-[0.92]">
                  <span
                    className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase"
                    style={{ fontFamily: "'Helvetica Neue Condensed Bold', 'Arial Narrow', sans-serif", letterSpacing: '-0.02em' }}
                  >
                    SIMULATED
                  </span>
                  <span
                    className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase"
                    style={{ fontFamily: "'Helvetica Neue Condensed Bold', 'Arial Narrow', sans-serif", letterSpacing: '-0.02em' }}
                  >
                    DATA
                  </span>
                  <span
                    className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase"
                    style={{ fontFamily: "'Helvetica Neue Condensed Bold', 'Arial Narrow', sans-serif", letterSpacing: '-0.02em' }}
                  >
                    TERMINAL
                  </span>
                </div>
                <div className="mt-4 text-xs text-foreground/30 tracking-[0.2em] font-mono">
                  v0.85 · SYSTEM READY
                </div>
              </div>
            </motion.div>

            {/* Right: Action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/timeline'); }}
                className="group relative w-60 h-14 px-6 bg-card/80 backdrop-blur-sm border border-foreground/[0.08] rounded-xl shadow-[0_4px_20px_rgba(0_0_0_0.06),0_1px_4px_rgba(0_0_0_0.03)] hover:shadow-[0_8px_30px_rgba(0_0_0_0.08),0_2px_8px_rgba(0_0_0_0.04)] hover:-translate-y-0.5 hover:border-foreground/[0.15] transition-all duration-300 flex items-center justify-between"
              >
                <span className="text-sm font-medium tracking-[0.15em] text-foreground/80">
                  模拟时间轴
                </span>
                <ArrowRight className="size-4 text-foreground/40 group-hover:text-foreground/70 group-hover:translate-x-1 transition-all duration-300" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); navigate('/archive'); }}
                className="group relative w-60 h-14 px-6 bg-card/60 backdrop-blur-sm border border-foreground/[0.06] rounded-xl shadow-[0_2px_12px_rgba(0_0_0_0.04),0_1px_3px_rgba(0_0_0_0.02)] hover:shadow-[0_6px_24px_rgba(0_0_0_0.06),0_2px_6px_rgba(0_0_0_0.03)] hover:-translate-y-0.5 hover:border-foreground/[0.12] transition-all duration-300 flex items-center justify-between"
              >
                <span className="text-sm font-medium tracking-[0.15em] text-foreground/60">
                  事件档案馆
                </span>
                <ArrowRight className="size-4 text-foreground/30 group-hover:text-foreground/60 group-hover:translate-x-1 transition-all duration-300" />
              </button>
            </motion.div>
          </div>

          {/* Bottom: Timeline + wave curves */}
          <motion.div
            ref={timelineRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 relative"
          >
            {/* Wave curves */}
            <div className="absolute inset-x-0 -top-10 -bottom-10 overflow-hidden pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1200 80" preserveAspectRatio="none">
                <motion.path
                  d="M 0 40 Q 300 20 600 40 T 1200 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-foreground/[0.07]"
                  animate={{
                    d: [
                      'M 0 40 Q 300 20 600 40 T 1200 40',
                      'M 0 40 Q 300 60 600 40 T 1200 40',
                      'M 0 40 Q 300 20 600 40 T 1200 40',
                    ],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M 0 50 Q 400 28 800 50 T 1200 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-foreground/[0.04]"
                  animate={{
                    d: [
                      'M 0 50 Q 400 28 800 50 T 1200 50',
                      'M 0 50 Q 400 72 800 50 T 1200 50',
                      'M 0 50 Q 400 28 800 50 T 1200 50',
                    ],
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
                <motion.path
                  d="M 0 30 Q 200 50 400 30 T 800 30 T 1200 30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-foreground/[0.03]"
                  animate={{
                    d: [
                      'M 0 30 Q 200 50 400 30 T 800 30 T 1200 30',
                      'M 0 30 Q 200 10 400 30 T 800 30 T 1200 30',
                      'M 0 30 Q 200 50 400 30 T 800 30 T 1200 30',
                    ],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
              </svg>
            </div>

            {/* Timeline bar */}
            <div className="relative h-px">
              <div className="absolute right-0 top-0 h-px w-[55%] bg-gradient-to-l from-foreground/25 via-foreground/15 to-transparent" />
              {/* Left endpoint */}
              <div className="absolute top-1/2 left-[45%] -translate-y-1/2 -translate-x-1/2">
                <div className="size-3 rounded-full bg-foreground/40" />
                <div className="absolute inset-0 size-3 rounded-full bg-foreground/30 animate-ping" style={{ animationDuration: '2s' }} />
              </div>
              {/* Tick marks */}
              {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((p, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-px bg-foreground/[0.15]"
                  style={{
                    left: `${45 + p * 55 * 0.9}%`,
                    height: i % 2 === 0 ? '12px' : '6px',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[10px] tracking-[0.2em] text-foreground/20 font-mono uppercase"
        >
          <span>System Status: Online</span>
          <span>U26&apos; Archive Terminal</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ===== Logo Icon Component =====
// 黑色圆角方块 + 左上角白色星号 + 右下角白色波形曲线
function LogoIcon({ size = 64 }: { size?: number }) {
  return (
    <div
      className="relative bg-foreground shadow-[0_8px_30px_rgba(0_0_0_0.15),0_2px_8px_rgba(0_0_0_0.08)]"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.16, // ~16% 圆角
      }}
    >
      {/* White asterisk/starburst top-left - 八角星号 */}
      <svg
        className="absolute"
        style={{
          top: size * 0.12,
          left: size * 0.12,
          width: size * 0.5,
          height: size * 0.5,
        }}
        viewBox="0 0 32 32"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {/* 8-pointed asterisk */}
        <line x1="16" y1="2" x2="16" y2="30" />
        <line x1="2" y1="16" x2="30" y2="16" />
        <line x1="6" y1="6" x2="26" y2="26" />
        <line x1="26" y1="6" x2="6" y2="26" />
      </svg>

      {/* White waveform/bar chart bottom-right - 从底部升起的柱状/波形 */}
      <svg
        className="absolute"
        style={{
          bottom: size * 0.1,
          right: size * 0.08,
          width: size * 0.667,
          height: size * 0.489,
        }}
        viewBox="0 0 36 22"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 类似心电图/声波的上升波形，从底部升起 */}
        <path d="M 2 18 L 7 18 L 10 8 L 14 18 L 18 4 L 22 14 L 26 10 L 34 10" />
      </svg>
    </div>
  );
}
