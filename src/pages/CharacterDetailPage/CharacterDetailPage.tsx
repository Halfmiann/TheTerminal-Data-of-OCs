import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Lock, User } from 'lucide-react';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';
import { useState, useEffect, useMemo } from 'react';

// 人物档案栏目映射（与档案库页面保持一致）
const CHARACTER_CATEGORY_MAP: Record<string, { label: string; type: 'main' | 'chat' }> = {
  'char-eric': { label: 'CARNIVAL', type: 'main' },
  'char-berus': { label: 'CARNIVAL', type: 'main' },
  'char-hiro': { label: 'CARNIVAL', type: 'main' },
  'char-nora': { label: 'CARNIVAL', type: 'main' },
  'char-marcus': { label: 'CARNIVAL', type: 'main' },
  'char-karl': { label: 'CARNIVAL', type: 'main' },
  'char-rami': { label: 'CARNIVAL', type: 'main' },
};

const CHARACTER_NAME_MAP: Record<string, string> = {
  'char-eric': 'Eric',
  'char-berus': 'BERUS',
  'char-hiro': 'Hiro',
  'char-nora': 'Nora',
  'char-marcus': 'Marcus',
  'char-karl': 'Karl',
  'char-rami': 'Rami',
};

const VALID_CHAR_IDS = Object.keys(CHARACTER_NAME_MAP);

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const isValid = id && VALID_CHAR_IDS.includes(id);
  const name = id ? CHARACTER_NAME_MAP[id] ?? '' : '';
  const category = id ? CHARACTER_CATEGORY_MAP[id] ?? { label: 'CARNIVAL', type: 'main' as const } : { label: 'CARNIVAL', type: 'main' as const };

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [id]);

  if (!isValid) {
    return <NotFoundPage />;
  }

  return (
    <div className="relative min-h-screen bg-background pt-24 pb-32">
      {/* Background - 镜头瞄准线风格 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '5px 5px',
          }}
        />
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
        {/* 返回按钮 */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-foreground/40 hover:text-foreground/70 transition-colors mb-8"
        >
          <ChevronLeft className="size-3.5" />
          返回
        </motion.button>

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
                Loading Character Archive...
              </span>
            </motion.div>
          ) : (
            <motion.article
              key={id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Header card */}
              <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] shadow-[0_4px_40px_rgba(0_0_0_0.05),0_1px_3px_rgba(0_0_0_0.03)] p-8 md:p-10 rounded-2xl">
                {/* Meta */}
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
                  <div className="flex-1 h-px bg-foreground/10" />
                  <span className="text-[10px] tracking-wider text-foreground/30 font-mono">
                    CHAR-{id?.toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.12em] text-foreground mb-2">
                  {name}
                </h1>
                <p className="text-sm text-foreground/40 tracking-[0.2em] font-light italic mb-6">
                  Character Profile
                </p>

                {/* 头像占位 */}
                <div className="flex items-center gap-5 border-l-2 border-foreground/20 pl-5">
                  <div className="size-16 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center">
                    <User className="size-7 text-foreground/25" strokeWidth={1.2} />
                  </div>
                  <div>
                    <p className="text-foreground/65 font-light leading-relaxed text-base italic">
                      该人物档案暂未开放
                    </p>
                    <p className="text-[11px] text-foreground/30 mt-1 font-mono tracking-wider">
                      NO ACCESS TO CHARACTER DATA
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info - NO ACCESS */}
              <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] shadow-[0_4px_40px_rgba(0_0_0_0.05),0_1px_3px_rgba(0_0_0_0.03)] p-8 md:p-10 rounded-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-1.5 border border-foreground/40 rotate-45" />
                  <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
                    Basic Information
                  </span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="size-16 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center mb-5">
                    <Lock className="size-6 text-foreground/30" strokeWidth={1.2} />
                  </div>
                  <h3 className="text-lg font-light tracking-[0.2em] text-foreground/40 mb-2">
                    NO ACCESS
                  </h3>
                  <p className="text-xs text-foreground/25 tracking-wider max-w-xs">
                    该人物详细档案暂无访问权限
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="size-1 rounded-full bg-foreground/12" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Related Events - NO ACCESS */}
              <div className="bg-background/60 backdrop-blur-xl border border-foreground/[0.08] shadow-[0_4px_40px_rgba(0_0_0_0.05),0_1px_3px_rgba(0_0_0_0.03)] p-8 md:p-10 rounded-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <User className="size-3.5 text-foreground/40" />
                  <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
                    Related Events
                  </span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>

                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-12 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center mb-4">
                    <Lock className="size-4 text-foreground/25" strokeWidth={1.2} />
                  </div>
                  <h3 className="text-sm font-light tracking-[0.2em] text-foreground/35 mb-1">
                    关联事件暂无权限
                  </h3>
                  <p className="text-[11px] text-foreground/20 tracking-wider">
                    NO ACCESS TO RELATED EVENTS
                  </p>
                </div>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
