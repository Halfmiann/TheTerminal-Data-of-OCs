import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_WORLD_OVERVIEW } from '@/data/overview';
import { Database, BookOpen, Globe, Layers, Info, ArrowRight } from 'lucide-react';

const sectionIcons = [Globe, Layers, BookOpen, Info];

export default function OverviewPage() {
  const navigate = useNavigate();
  const { title, subtitle, sections } = MOCK_WORLD_OVERVIEW;

  return (
    <div className="relative min-h-screen bg-background pt-24 pb-32">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0_0_0_0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0_0_0_0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full border border-foreground/[0.025]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full border border-foreground/[0.04]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Database className="size-4 text-foreground/40" />
            <span className="text-[10px] tracking-[0.4em] text-foreground/40 uppercase font-mono">
              World Archive
            </span>
          </div>
          <p className="text-xs tracking-[0.3em] text-foreground/35 font-mono mb-3">
            {subtitle}
          </p>
          <h1 className="text-4xl md:text-5xl font-extralight tracking-[0.2em] text-foreground mb-6">
            {title}
          </h1>
          <div className="w-16 h-px bg-foreground/20 mx-auto" />
          <p className="mt-6 text-sm text-foreground/40 tracking-wider font-light">
            宇宙26号模拟世界 · 基础设定档案
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section, index) => {
            const Icon = sectionIcons[index % sectionIcons.length];
            return (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Section card */}
                <div className="relative bg-card/50 backdrop-blur-sm border border-foreground/[0.08] shadow-[0_4px_30px_rgba(0_0_0_0.04),0_1px_2px_rgba(0_0_0_0.02)] p-7 md:p-8">
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 size-3 border-t border-l border-foreground/15" />
                  <div className="absolute top-0 right-0 size-3 border-t border-r border-foreground/15" />
                  <div className="absolute bottom-0 left-0 size-3 border-b border-l border-foreground/15" />
                  <div className="absolute bottom-0 right-0 size-3 border-b border-r border-foreground/15" />

                  {/* Section number + icon */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center justify-center size-10 border border-foreground/15 bg-background/50">
                      <Icon className="size-4 text-foreground/50" />
                    </div>
                    <div>
                      <div className="text-[10px] tracking-[0.3em] text-foreground/30 font-mono mb-0.5">
                        SECTION {String(index + 1).padStart(2, '0')}
                      </div>
                      <h2 className="text-lg font-light tracking-[0.15em] text-foreground">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-foreground/15 via-foreground/5 to-transparent mb-5" />

                  {/* Content */}
                  <div className="text-foreground/65 font-light leading-[2] text-sm md:text-base whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Timeline CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 text-center"
        >
          <div className="relative inline-block">
            <button
              onClick={() => navigate('/timeline')}
              className="group relative px-10 py-4 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-[0_4px_24px_rgba(0_0_0_0.15)] hover:shadow-[0_8px_40px_rgba(0_0_0_0.25)] hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase">
                探索时间轴档案
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
            <div className="absolute -inset-x-3 -bottom-3 h-6 bg-foreground/[0.05] blur-lg -z-10" />
          </div>
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-t border-foreground/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-wider text-foreground/30 font-mono">
              U26' / TERMINAL v0.8
            </span>
            <div className="h-3 w-px bg-foreground/10" />
            <span className="text-[10px] tracking-wider text-foreground/25 font-mono">
              SECTIONS: {sections.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-wider text-foreground/25 font-mono">
              WORLD ARCHIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
