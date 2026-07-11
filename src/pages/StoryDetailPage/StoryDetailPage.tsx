import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Lock } from 'lucide-react';
import { MOCK_TIMELINE_NODES } from '@/data/timeline';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';
import { useState, useEffect, useMemo } from 'react';

// 事件栏目分类映射（与档案库页面保持一致）
const EVENT_CATEGORY_MAP: Record<string, { label: string; type: 'chat' | 'main' }> = {
  // 未归档 CHAT
  'AD-2050': { label: 'CHAT', type: 'chat' },
  'AD-2280': { label: 'CHAT', type: 'chat' },
  'OE-0001': { label: 'CHAT', type: 'chat' },
  'OE-1603': { label: 'CHAT', type: 'chat' },
  'OE-1842': { label: 'CHAT', type: 'chat' },
  'OE-2127': { label: 'CHAT', type: 'chat' },
  'OE-2306': { label: 'CHAT', type: 'chat' },
  'NE-0001': { label: 'CHAT', type: 'chat' },
  'NE-0334': { label: 'CHAT', type: 'chat' },
  'NE-0524': { label: 'CHAT', type: 'chat' },
  // MAIN STORY
  'NE-1706': { label: 'MAIN STORY', type: 'main' },
  'NE-2755': { label: 'MAIN STORY', type: 'main' },
  'NE-2756': { label: 'MAIN STORY', type: 'main' },
  // SIDE STORY - 不明影像集
  'SS-1998-LISHUI': { label: 'SIDE STORY', type: 'chat' },
  'SS-2007-YINYAN': { label: 'SIDE STORY', type: 'chat' },
};

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const node = MOCK_TIMELINE_NODES.find((n) => n.id === id);

  // 当前事件所属栏目
  const category = useMemo(() => {
    if (!node) return { label: 'CHAT', type: 'chat' as const };
    return EVENT_CATEGORY_MAP[node.id] ?? { label: 'CHAT', type: 'chat' as const };
  }, [node]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [id]);

  if (!node) {
    return <NotFoundPage />;
  }

  const currentIndex = MOCK_TIMELINE_NODES.findIndex((n) => n.id === id);
  const prevNode = currentIndex > 0 ? MOCK_TIMELINE_NODES[currentIndex - 1] : null;
  const nextNode =
    currentIndex < MOCK_TIMELINE_NODES.length - 1
      ? MOCK_TIMELINE_NODES[currentIndex + 1]
      : null;

  return (
    <div className="relative min-h-screen bg-background pt-24 pb-32">
      {/* Background - 镜头瞄准线风格 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* 半色调网点纹理 */}
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '5px 5px',
          }}
        />
        {/* 同心圆 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: '80vmin', height: '80vmin' }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: `${35 + i * 18}%`,
                height: `${35 + i * 18}%`,
                border: `1px solid rgba(0,0,0,${0.025 + i * 0.008})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-20"
            >
              <div className="w-48 h-px bg-foreground/10 relative overflow-hidden mb-4">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-y-0 w-1/3 bg-foreground/30"
                />
              </div>
              <span className="text-[10px] tracking-[0.3em] text-foreground/30 uppercase font-mono">
                Loading Archive...
              </span>
            </motion.div>
          ) : (
            <motion.article
              key={node.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Header card - 磨砂玻璃圆角 */}
              <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] shadow-[0_4px_40px_rgba(0_0_0_0.05),0_1px_3px_rgba(0_0_0_0.03)] p-8 md:p-10 rounded-2xl">
                {/* Meta - 栏目标签 + 时间 */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <span
                    className={`px-3 py-1 text-[10px] tracking-[0.25em] uppercase font-mono rounded-full ${
                      category.type === 'main'
                        ? 'bg-foreground/[0.08] text-foreground/70 border border-foreground/[0.1]'
                        : 'bg-foreground/[0.04] text-foreground/50 border border-foreground/[0.06]'
                    }`}
                  >
                    {category.label}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] text-foreground/40 font-mono">
                    {node.time}
                  </span>
                  <div className="flex-1 h-px bg-foreground/10" />
                  <span className="text-[10px] tracking-wider text-foreground/30 font-mono">
                    NODE-{node.id}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.12em] text-foreground mb-2">
                  {node.title}
                </h1>
                {node.subtitle && (
                  <p className="text-sm text-foreground/40 tracking-[0.2em] font-light italic mb-6">
                    {node.subtitle}
                  </p>
                )}

                {/* Summary */}
                <div className="border-l-2 border-foreground/20 pl-5">
                  <p className="text-foreground/65 font-light leading-relaxed text-base italic">
                    {node.summary}
                  </p>
                </div>
              </div>

              {/* Full Record - 暂无权限占位 */}
              <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] shadow-[0_4px_40px_rgba(0_0_0_0.05),0_1px_3px_rgba(0_0_0_0.03)] p-8 md:p-10 rounded-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-1.5 border border-foreground/40 rotate-45" />
                  <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
                    Full Record
                  </span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-16 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center mb-5">
                    <Lock className="size-6 text-foreground/30" strokeWidth={1.2} />
                  </div>
                  <h3 className="text-lg font-light tracking-[0.2em] text-foreground/40 mb-2">
                    NO ACCESS
                  </h3>
                  <p className="text-xs text-foreground/25 tracking-wider max-w-xs">
                    该档案详细记录暂无访问权限
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="size-1 rounded-full bg-foreground/12" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Related Entities - 暂无权限占位 */}
              <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] shadow-[0_4px_40px_rgba(0_0_0_0.05),0_1px_3px_rgba(0_0_0_0.03)] p-8 md:p-10 rounded-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <User className="size-3.5 text-foreground/40" />
                  <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
                    Related Entities
                  </span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-12 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center mb-4">
                    <Lock className="size-4 text-foreground/25" strokeWidth={1.2} />
                  </div>
                  <h3 className="text-sm font-light tracking-[0.2em] text-foreground/35 mb-1">
                    关系主体暂无权限
                  </h3>
                  <p className="text-[11px] text-foreground/20 tracking-wider">
                    NO ACCESS TO ENTITY DATA
                  </p>
                </div>
              </div>

              {/* Navigation between stories - 磨砂玻璃圆角 */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {prevNode ? (
                  <button
                    onClick={() => navigate(`/story/${prevNode.id}`)}
                    className="group text-left p-5 bg-background/50 backdrop-blur-xl border border-foreground/[0.08] hover:border-foreground/20 hover:bg-background/70 transition-all duration-500 rounded-xl shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] text-foreground/30 uppercase mb-2">
                      <ChevronLeft className="size-3" />
                      上一节点
                    </div>
                    <div className="text-sm text-foreground/70 font-light tracking-wider group-hover:text-foreground transition-colors">
                      {prevNode.title}
                    </div>
                    <div className="text-[10px] text-foreground/30 font-mono mt-1">
                      {prevNode.time}
                    </div>
                  </button>
                ) : (
                  <div />
                )}
                {nextNode ? (
                  <button
                    onClick={() => navigate(`/story/${nextNode.id}`)}
                    className="group text-right p-5 bg-background/50 backdrop-blur-xl border border-foreground/[0.08] hover:border-foreground/20 hover:bg-background/70 transition-all duration-500 rounded-xl shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-end gap-1.5 text-[10px] tracking-[0.3em] text-foreground/30 uppercase mb-2">
                      下一节点
                      <ChevronRight className="size-3" />
                    </div>
                    <div className="text-sm text-foreground/70 font-light tracking-wider group-hover:text-foreground transition-colors">
                      {nextNode.title}
                    </div>
                    <div className="text-[10px] text-foreground/30 font-mono mt-1">
                      {nextNode.time}
                    </div>
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/60 backdrop-blur-xl border-t border-foreground/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-wider text-foreground/30 font-mono">
              U26' / TERMINAL v0.8
            </span>
            <div className="h-3 w-px bg-foreground/10" />
            <span className="text-[10px] tracking-wider text-foreground/25 font-mono">
              VIEWING: NODE-{node.id}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-wider text-foreground/25 font-mono">
              READ ONLY MODE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
