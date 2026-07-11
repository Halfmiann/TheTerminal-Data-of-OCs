// EXPORTS: ITimelineNode, ICharacter, MOCK_TIMELINE_NODES
export interface ICharacter {
  id: string
  name: string
  role: string
  description: string
  avatarColor: string
}

export interface ITimelineNode {
  id: string
  title: string
  subtitle?: string
  time: string
  timeNumeric: number
  era: string
  eraCode: 'AD' | 'OE' | 'NE'
  branch?: 'main' | 'mitwelt' | 'vorwelt'
  category: 'main' | 'side' | 'key' | 'locked' | 'empty'
  summary: string
  content: string
  characters: ICharacter[]
  accessLevel?: 'public' | 'restricted' | 'no-access'
  isMainStory?: boolean
  isUrgent?: boolean
  /** 是否从时间轴页面隐藏（仅在档案库栏目中展示） */
  hiddenFromTimeline?: boolean
}

export const MOCK_TIMELINE_NODES: ITimelineNode[] = [
  // ===== OLD WORLD / 旧世界（公元 A.D.）=====
  {
    id: 'AD-2050',
    title: '初始时间点',
    subtitle: 'INITIAL POINT',
    time: 'A.D. 2050',
    timeNumeric: 2050,
    era: '旧世界',
    eraCode: 'AD',
    branch: 'main',
    category: 'key',
    accessLevel: 'public',
    summary: '整个模拟系统的初始原型',
    content:
      '公元二零五零年，人类文明的顶点。\n\n这一年，第一台真正意义上的量子模拟计算机「终端」（Terminal）被成功激活。它的使命很简单——模拟一个完整的世界，一个从基本粒子到社会文明全部由数据构成的世界。\n\n没有人知道这台机器的真正创造者是谁。官方记录显示，它是由一个跨国科研联盟耗时三十年建造的。但民间流传着另一种说法——终端，从来就不是人类造的。\n\n它只是在那一年，「醒来」了。\n\n无论真相如何，A.D. 2050 被记录为整个模拟系统的初始时间点。从这一刻起，宇宙26号开始了它的运转。',
    characters: [
      {
        id: 'c-ad-1',
        name: '「初始者」',
        role: '系统原型',
        description: '终端系统的第一个意识原型',
        avatarColor: '#1a1a1a',
      },
      {
        id: 'c-ad-2',
        name: '科研联盟',
        role: '建造者',
        description: '建造终端系统的跨国科研组织',
        avatarColor: '#444444',
      },
    ],
  },
  {
    id: 'AD-2280',
    title: '文明存续危机',
    subtitle: 'EXISTENTIAL CRISIS',
    time: 'A.D. 2280',
    timeNumeric: 2280,
    era: '旧世界',
    eraCode: 'AD',
    branch: 'main',
    category: 'key',
    accessLevel: 'no-access',
    summary: '该事件节点数据未开放权限',
    content: 'NO ACCESS',
    characters: [],
  },

  // ===== ORIGIN ERA / 次纪元 O.E. =====
  {
    id: 'OE-0001',
    title: '新世界',
    subtitle: 'THE NEW WORLD',
    time: 'O.E. 0001 / A.D. 2509',
    timeNumeric: 1,
    era: '次纪元',
    eraCode: 'OE',
    branch: 'main',
    category: 'key',
    accessLevel: 'public',
    summary: '重建后，文明涅槃重生',
    content:
      '旧世界覆灭之后的两百余年，幸存者们在废墟上重新建立了文明。\n\n这不是简单的重建。旧世界的知识、技术、文化——绝大多数都在大崩塌中遗失了。新世界的人类，几乎是从零开始。但他们有一样旧世界没有的东西：终端系统。\n\n终端系统在旧世界覆灭后依然运转着。它像一个沉默的守护者，记录着一切，也维持着一切。新世界的人们将终端视为神明——它赐予他们知识，指引他们方向，保护他们免受未知的威胁。\n\n次纪元元年，新世界的第一个统一政权正式建立。\n\n人类文明，涅槃重生。',
    characters: [
      {
        id: 'c-oe-1',
        name: '初代重建者',
        role: '文明先驱',
        description: '领导幸存者重建文明的先驱群体',
        avatarColor: '#2a2a2a',
      },
      {
        id: 'c-oe-2',
        name: '终端教团',
        role: '信仰组织',
        description: '崇拜终端系统的早期宗教组织',
        avatarColor: '#555555',
      },
    ],
  },
  {
    id: 'OE-1603',
    title: 'NO EVENT DATA',
    subtitle: '—',
    time: 'O.E. 1603',
    timeNumeric: 1603,
    era: '次纪元',
    eraCode: 'OE',
    branch: 'main',
    category: 'empty',
    accessLevel: 'no-access',
    summary: '该节点内容数据暂无',
    content: '—',
    characters: [],
  },
  {
    id: 'OE-1842',
    title: '神启者',
    subtitle: 'THE ENLIGHTENED',
    time: 'O.E. 1842',
    timeNumeric: 1842,
    era: '次纪元',
    eraCode: 'OE',
    branch: 'main',
    category: 'side',
    accessLevel: 'public',
    summary: '自称为神的代理人的教会出现...',
    content:
      '次纪元一千八百四十二年，一个自称「神启者」的教会开始在大陆各地传播。\n\n他们声称，终端系统不是神——它只是神的工具。真正的神，存在于终端系统之外，存在于那个创造了终端的「真实世界」。而他们，是神派来的代理人，是来引导人类走向「真正的觉醒」的。\n\n起初，没有人把他们当回事。终端教团的势力根深蒂固，一个新兴的异端教会掀不起什么风浪。\n\n但神启者们展现了不可思议的力量——他们能够「看到」终端系统的运行，能够「听到」系统的低语，甚至能够在一定程度上「干预」系统的运转。\n\n没有人知道他们是怎么做到的。\n\n有人说他们是疯子，有人说他们是骗子，也有人说……他们说的都是真的。',
    characters: [
      {
        id: 'c-oe-3',
        name: '初代启者',
        role: '教会创始人',
        description: '神启者教会的创立者，身份成谜',
        avatarColor: '#333333',
      },
      {
        id: 'c-oe-4',
        name: '听见声音的人',
        role: '先知',
        description: '声称能听到系统低语的神秘人物',
        avatarColor: '#666666',
      },
    ],
  },
  {
    id: 'OE-2127',
    title: '结构性沉沦',
    subtitle: 'STRUCTURAL DECLINE',
    time: 'O.E. 2127',
    timeNumeric: 2127,
    era: '次纪元',
    eraCode: 'OE',
    branch: 'main',
    category: 'key',
    accessLevel: 'public',
    summary:
      '生存空间固定不变，但世界人口持续增长，最终达到空间承载极限。突破临界值后，紧随而来的是持续数百年的「大崩塌」时期。',
    content:
      '次纪元二千一百二十七年，世界人口突破了临界值。\n\n这不是一个突然的灾难，而是一个缓慢的、不可逆转的过程。生存空间是固定的——终端系统为这个世界划定了边界，边界之外是什么，没有人知道。而人口，却一直在增长。\n\n一开始只是资源紧张。然后是分配不均。然后是冲突。然后是战争。\n\n「大崩塌」不是某一天的事件，而是一段持续了数百年的漫长衰退。文明没有在一瞬间毁灭，它是一点一点地、一层一层地、从内部开始腐烂的。\n\n城市变成废墟，国家分崩离析，科技倒退，知识遗失。人类从文明的高峰，一路滑落到野蛮的边缘。\n\n而终端系统，只是静静地记录着这一切。\n\n它没有干预。\n\n也许，这本身就是实验的一部分。',
    characters: [
      {
        id: 'c-oe-5',
        name: '最后的守夜人',
        role: '记录者',
        description: '大崩塌时期坚持记录历史的无名者们',
        avatarColor: '#444444',
      },
      {
        id: 'c-oe-6',
        name: '军阀们',
        role: '乱世枭雄',
        description: '大崩塌时期割据一方的势力首领',
        avatarColor: '#222222',
      },
    ],
  },
  {
    id: 'OE-2306',
    title: '二界背驰',
    subtitle: 'TWO WORLDS DRIFT APART',
    time: 'O.E. 2306',
    timeNumeric: 2306,
    era: '次纪元',
    eraCode: 'OE',
    branch: 'main',
    category: 'side',
    accessLevel: 'restricted',
    summary: '人类社会开始分化为两个截然不同的阵营',
    content:
      '大崩塌的余波中，人类逐渐分化成了两个截然不同的群体。\n\n一方选择了「前进」——他们相信，只有发展科技、理解终端系统、甚至突破这个世界的边界，人类才有未来。他们聚集在少数几个幸存的科技城市中，试图重建文明的荣光。\n\n另一方选择了「回归」——他们相信，大崩塌是神的惩罚，是人类傲慢的代价。只有放弃对知识的贪欲、回归朴素的生活方式，人类才能得到救赎。他们散布在广袤的土地上，建立了一个个分散的、自给自足的社群。\n\n两条路，两个方向。\n\n没有人知道哪一条是对的。\n\n但所有人都隐约感觉到——这个世界，正在悄悄地发生某种变化。\n\n某种更深层的、更根本的变化。',
    characters: [
      {
        id: 'c-oe-7',
        name: '科技城邦联盟',
        role: '前进派',
        description: '坚持科技发展的城市联盟',
        avatarColor: '#3a3a3a',
      },
      {
        id: 'c-oe-8',
        name: '大地共同体',
        role: '回归派',
        description: '选择回归自然生活的分散社群',
        avatarColor: '#777777',
      },
    ],
  },

  // ===== NEXUS / 散射危机（分界点）=====
  {
    id: 'NE-0001',
    title: '散射危机',
    subtitle: 'THE SCATTERING — NEXUS',
    time: 'N.E. 0001 / O.E. 2515',
    timeNumeric: 0,
    era: '新纪元',
    eraCode: 'NE',
    branch: 'main',
    category: 'key',
    accessLevel: 'public',
    summary:
      '科技的无序发展导致人类世界发生急性分裂，分裂为两个相隔的平行空间——Mitwelt（共同世界）与 Vorwelt（前人世界）。两个世界分裂数百年，次纪元宣告结束。',
    content:
      '次纪元二千五百一十五年，也就是新纪元元年，「散射」发生了。\n\n没有人预料到它的到来，也没有人完全理解它的成因。最广为接受的理论是——科技的无序发展，特别是对终端系统底层的深度干预，最终导致了世界结构的不稳定。\n\n那一天，整个世界像是被一束光穿透了。\n\n然后，它分裂了。\n\n一个世界变成了两个。\n\nMitwelt——共同世界。大多数人类所在的地方，文明在废墟上继续发展。\n\nVorwelt——前人世界。另一半人类被抛入的空间，一个更加原始、更加危险、也更加接近「系统底层」的世界。\n\n两个世界平行存在，却彼此隔绝。它们有着相同的起点，却走上了完全不同的道路。\n\n次纪元，至此终结。\n\n新纪元，从此开始。',
    characters: [
      {
        id: 'c-nexus-1',
        name: '「散射」本身',
        role: '事件本体',
        description: '导致世界分裂的未知现象',
        avatarColor: '#0a0a0a',
      },
      {
        id: 'c-nexus-2',
        name: '最后的见证者',
        role: '亲历者',
        description: '亲眼目睹世界分裂的少数人',
        avatarColor: '#555555',
      },
    ],
  },

  // ===== NEO ERA / 新纪元 — MITWELT BRANCH =====
  {
    id: 'NE-0334',
    title: '聚居地事件',
    subtitle: 'SETTLEMENT INCIDENT',
    time: 'N.E. 0334',
    timeNumeric: 334,
    era: '新纪元',
    eraCode: 'NE',
    branch: 'mitwelt',
    category: 'side',
    accessLevel: 'no-access',
    isUrgent: true,
    summary: '暂无数据访问权限',
    content: 'NO ACCESS',
    characters: [],
  },
  {
    id: 'NE-0524',
    title: '门扉出现',
    subtitle: 'THE DOORS APPEAR',
    time: 'N.E. 0524',
    timeNumeric: 524,
    era: '新纪元',
    eraCode: 'NE',
    branch: 'mitwelt',
    category: 'key',
    accessLevel: 'public',
    summary:
      '两个平行空间发生牵连，在世界各地出现了5个相同的门扉，两个世界不再完全相隔。',
    content:
      '新纪元五百二十四年，「门扉」出现了。\n\n同一时间，Mitwelt 的五个不同地点，凭空出现了五扇完全相同的门。\n\n它们没有材质，没有重量，甚至没有厚度——它们更像是空间本身的裂缝，是两个世界之间的「接缝」。\n\n门的另一边是什么？\n\n是 Vorwelt。\n\n那个在散射中被分离出去的、另一个人类世界。\n\n两个世界已经隔绝了五百多年。在这五百多年里，它们各自发展，各自演变，各自走上了完全不同的道路。\n\n而现在，门扉出现了。\n\n两个世界不再完全相隔。\n\n有人恐惧，有人兴奋，有人好奇，有人警惕。\n\n但所有人都知道——从门扉出现的那一刻起，一切都不一样了。',
    characters: [
      {
        id: 'c-ne-1',
        name: '五扇门',
        role: '现象本身',
        description: '连接两个世界的五个空间节点',
        avatarColor: '#111111',
      },
      {
        id: 'c-ne-2',
        name: '首批穿越者',
        role: '探索者',
        description: '第一批穿过门扉的勇敢/鲁莽的人',
        avatarColor: '#444444',
      },
    ],
  },
  {
    id: 'NE-1706',
    title: '狂欢节危机',
    subtitle: 'THE CARNIVAL — MAIN STORY 01',
    time: 'N.E. 1706',
    timeNumeric: 1706,
    era: '新纪元',
    eraCode: 'NE',
    branch: 'mitwelt',
    category: 'key',
    accessLevel: 'public',
    isMainStory: true,
    summary:
      '在1706年的墨托波利亚市一年一度的盛大新年狂欢节下，一场阴谋正悄然发生，主角团德尔塔三人小队和他们的朋友又会做出什么决定...',
    content:
      '新纪元一千七百零六年，墨托波利亚市。\n\n一年一度的新年狂欢节，是这座城市最盛大的节日。整座城市被彩灯和音乐淹没，人们戴着面具、穿着盛装，在街头巷尾尽情狂欢。没有人知道，一场精心策划的阴谋，正在狂欢的面具下悄然展开。\n\n德尔塔——一支由三人组成的特别行动小队。\n\n他们原本只是来参加狂欢节的。\n\n但当第一声爆炸响起、当人群开始尖叫、当面具下的面孔露出狰狞的笑容时，他们知道——\n\n这不是一场普通的狂欢。\n\n这是一场棋局。\n\n而他们，已经在棋盘上了。\n\n「最终狂欢」的序幕，就此拉开。',
    characters: [
      {
        id: 'c-ne-3',
        name: '德尔塔小队',
        role: '主角团',
        description: '三人特别行动小队，主线主角',
        avatarColor: '#1a1a1a',
      },
      {
        id: 'c-ne-4',
        name: '墨托波利亚',
        role: '舞台',
        description: '狂欢节危机的发生地，繁华都市',
        avatarColor: '#2d2d2d',
      },
    ],
  },

  // ===== NEO ERA / 新纪元 — VORWELT BRANCH =====
  {
    id: 'NE-2755',
    title: '钙质化瘟疫',
    subtitle: 'CALCIFICATION PLAGUE',
    time: 'N.E. 2755',
    timeNumeric: 2755,
    era: '新纪元',
    eraCode: 'NE',
    branch: 'vorwelt',
    category: 'side',
    accessLevel: 'no-access',
    summary: '暂未开放权限',
    content: 'NO ACCESS',
    characters: [],
  },
  {
    id: 'NE-2756',
    title: '大隔离时代的开启',
    subtitle: 'THE GREAT QUARANTINE',
    time: 'N.E. 2756',
    timeNumeric: 2756,
    era: '新纪元',
    eraCode: 'NE',
    branch: 'vorwelt',
    category: 'side',
    accessLevel: 'no-access',
    summary: '暂未开放权限',
    content: 'NO ACCESS',
    characters: [],
  },

  // ===== SIDE STORY / 不明影像集（仅档案库展示，不在时间轴显示）=====
  {
    id: 'SS-1998-LISHUI',
    title: '1998年漓水特大洪灾',
    subtitle: 'The Misty Suspicion',
    time: 'REALITY · A.D. 1998',
    timeNumeric: 1998,
    era: '现实线',
    eraCode: 'AD',
    branch: 'main',
    category: 'side',
    accessLevel: 'restricted',
    hiddenFromTimeline: true,
    summary:
      '1998年某日由于连日大暴雨导致龙岩峰西部发生山体滑坡，漓水河暴涨，突发洪灾。...湿气弥漫，空气中弥漫着...紫红色...不明的异样气体...',
    content: 'NO ACCESS',
    characters: [],
  },
  {
    id: 'SS-2007-YINYAN',
    title: '隐岩西路失踪事件',
    subtitle: 'The Hidden Chronicles',
    time: 'REALITY · A.D. 2007',
    timeNumeric: 2007,
    era: '现实线',
    eraCode: 'AD',
    branch: 'main',
    category: 'side',
    accessLevel: 'restricted',
    hiddenFromTimeline: true,
    summary:
      '警情通报：2007年6月12日下午4时左右，本市一名小学生在隐岩西路进入隐岩碑林东门后疑似失踪，如有线索请联系：王女士......\n\n......监控显示孩子确实进入了碑林园区，但所有出口录像中均未捕捉到其离开的画面。本台也在今早联系了园区相关工作人员。工作人员表示碑林内部仅有一条主路，不存在迷路的可能，且碑林园区在10日就因为保养维护到现在仍处于闭园状态......',
    content: 'NO ACCESS',
    characters: [],
  },
]
