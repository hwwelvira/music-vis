import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

const englishToChineseMap = {
  // 核心音乐、情感与高频常用实词对照
  "Love": "爱", "Life": "生活", "Heart": "心", "Night": "夜晚", "Day": "白昼", "Time": "时间",
  "Girl": "女孩", "Boy": "男孩", "Way": "路途", "World": "世界", "Man": "男人", "Woman": "女人",
  "Dance": "起舞", "Song": "歌谣", "Music": "音乐", "Blue": "忧郁蓝色", "Red": "炽热红色", "Star": "星辰",
  "Moon": "月亮", "Sun": "太阳", "Fire": "烈火", "Water": "流水", "Dream": "梦想", "Home": "故乡",
  "Road": "道路", "Street": "街区", "Summer": "盛夏", "Winter": "寒冬", "Spring": "阳春", "Fall": "金秋",
  "Rain": "落雨", "Baby": "宝贝", "Heaven": "天堂", "Hell": "地狱", "Happy": "快乐", "Sad": "悲伤",
  "Good": "美好", "Bad": "糟糕", "Never": "永不", "Always": "总是", "Forever": "永远", "Together": "在一起",
  "Alone": "孤独", "Tonight": "今晚", "Yesterday": "昨日", "Tomorrow": "明日", "Crazy": "疯狂", "Sweet": "甜蜜",
  "Little": "小小", "Big": "大大", "High": "高昂", "Low": "低沉", "Black": "黑色", "White": "白色",
  "Light": "光芒", "Dark": "黑暗", "Gold": "黄金", "Rock": "摇滚", "Shake": "摇摆", "Beat": "节拍",
  "Rhythm": "旋律", "Mind": "心智", "Soul": "灵魂", "Body": "躯体", "Friend": "朋友", "People": "人们",
  "Eyes": "双眸", "Smile": "微笑", "Tears": "泪水", "Cry": "哭泣", "Fly": "飞翔", "Run": "奔跑",
  "Stay": "留下", "Go": "离去", "Come": "归来", "Back": "回归", "Here": "此处", "Away": "远方",
  "Stop": "止步", "Start": "启程", "Keep": "保持", "Hold": "紧握", "Lost": "迷失", "Found": "寻回",
  "Free": "自由", "Beautiful": "美丽", "Young": "年轻", "Old": "老旧", "True": "真实", "Lie": "谎言",
  "Yeah": "耶", "Gonna": "将要", "Wanna": "想要", "Right": "对的", "Bones": "风骨", "Ghost": "幽灵",
  "Vegas": "拉斯维加斯", "Dandelions": "蒲公英", "Atlantis": "亚特兰蒂斯", "Stan": "斯坦", "Dynamite": "炸药",
  "Natural": "自然", "Bored": "无聊", "Attention": "关注", "Enemy": "宿敌", "Riptide": "激流",
  "Unstoppable": "无可阻挡", "Believer": "信徒", "Demons": "心魔", "Humble": "谦逊", "Iris": "鸢尾花",
  "Memories": "回忆", "Creep": "懦夫", "Easy": "轻松", "Boyfriend": "男友", "Girlfriend": "女友",
  "Ex": "前任", "Hello": "你好", "Goodbye": "再见", "Angel": "天使", "Devil": "恶魔", "Whisper": "耳语",
  "Shout": "呐喊", "Scream": "尖叫", "Silence": "静谧", "Voice": "歌喉", "Melody": "旋律", "Harmony": "和弦",
  "Bass": "低音", "Guitar": "吉他", "Piano": "钢琴", "Drum": "架子鼓", "Stage": "舞台", "Show": "表演",
  "Concert": "音乐会", "Solo": "独奏", "Chorus": "合唱", "Melancholy": "忧郁", "Joy": "喜悦", "Anger": "愤怒",
  "Fear": "恐惧", "Surprise": "惊喜", "Sadness": "悲伤", "Disgust": "厌恶", "Shame": "羞耻", "Guilt": "内疚",
  "Pride": "骄傲", "Envy": "嫉妒", "Jealousy": "醋意", "Hope": "希望", "Despair": "绝望", "Trust": "信任",
  "Betrayal": "背叛", "Faith": "信仰", "Doubt": "怀疑", "Patience": "耐心", "Kindness": "善良",
  "Cruelty": "残忍", "Mercy": "仁慈", "Justice": "正义", "Truth": "真理", "Wisdom": "智慧", "Folly": "愚蠢",
  "Genius": "天才", "Idiot": "白痴", "Fool": "傻瓜", "Shadow": "影子", "Sunlight": "阳光", "Moonlight": "月光",
  "Starlight": "星光", "Skyline": "天际", "Ocean": "海洋", "Sea": "大海", "River": "江河", "Lake": "湖泊",
  "Stream": "溪流", "Pond": "池塘", "Wave": "波浪", "Tide": "潮汐", "Windy": "多风", "Rainy": "多雨",
  "Sunny": "晴朗", "Cloudy": "多云", "Snowy": "下雪", "Stormy": "暴风雨", "Foggy": "有雾", "Warm": "温暖",
  "Cold": "寒冷", "Hot": "炎热", "Cool": "凉爽", "Bright": "明亮", "Darkness": "黑暗", "Midnight": "午夜",
  "Sunset": "日落", "Sunrise": "日出", "Dawn": "黎明", "Dusk": "黄昏", "Morning": "早晨", "Afternoon": "下午",
  "Evening": "傍晚", "Week": "星期", "Month": "月份", "Year": "年份", "Century": "世纪", "Era": "时代",
  "Decade": "十年", "Season": "季节", "Weather": "天气", "Climate": "气候", "Nature": "自然",
  "Universe": "宇宙", "Cosmos": "宇宙空间", "Galaxy": "星系", "Planet": "行星", "Asteroid": "小行星",
  "Comet": "彗星", "Meteor": "流星", "Earthquake": "地震", "Volcano": "火山", "Flood": "洪水",
  "Drought": "干旱", "Smoke": "烟雾", "Fog": "浓雾", "Mist": "薄雾", "Dew": "露水",
  "Frost": "严霜", "Ice": "冰霜", "Snow": "白雪", "Cloud": "浮云", "Sky": "天空",
  "Air": "空气", "Wind": "微风", "Dust": "尘埃", "Dirt": "泥土", "Mud": "烂泥", "Clay": "粘土",
  "Sand": "细沙", "Stone": "石头", "Pebble": "鹅卵石", "Gravel": "砾石", "Soil": "土壤",
  "Land": "陆地", "Mountain": "山脉", "Hill": "小山", "Valley": "山谷", "Canyon": "峡谷", "Cliff": "悬崖",
  "Cave": "洞穴", "Forest": "森林", "Wood": "树林", "Jungle": "丛林", "Desert": "沙漠", "Plains": "平原",
  "Meadow": "草地", "Swamp": "沼泽", "Marsh": "湿地", "Island": "岛屿", "Peninsula": "半岛", "Cape": "海角",
  "Bay": "海湾", "Gulf": "海湾", "Harbor": "港口", "Port": "港口", "Shore": "海岸", "Coast": "海岸",
  "Beach": "沙滩", "Spring": "泉水", "Well": "井水", "Waterfall": "瀑布", "Geyser": "喷泉", "Glacier": "冰川",
  "Iceberg": "冰山", "Sex": "性",
  "Drug": "药", "Girls": "女孩们", "Boys": "男孩们", "Nights": "黑夜", "Days": "白昼",
  "Worlds": "世界", "Christmas": "圣诞", "Green": "绿色", "Yellow": "黄色", "Purple": "紫色",
  "Pink": "粉色", "Orange": "橙色", "Brown": "棕色", "Gray": "灰色", "Silver": "银色",
  "Bronze": "青铜", "Copper": "红铜", "Iron": "黑铁", "Steel": "精钢", "Metal": "金属"
};

// KMeans 聚类颜色（与 ScatterBrushChart 完全一致）
const clusterColors = ['#A8D8B9', '#B4A6CD', '#A2CBE6', '#F1A5B4', '#DDE29F'];
const clusterLabels = [
  { label: '狂热释放', color: '#A8D8B9' },
  { label: '轻松愉快', color: '#B4A6CD' },
  { label: '伤感静谧', color: '#A2CBE6' },
  { label: '阳光活力', color: '#F1A5B4' },
  { label: '迷幻张力', color: '#DDE29F' }
];

const TimelineChart = ({ data, scatterData }) => {

  if (!data || data.length === 0) return null;

  const isNoiseWord = (word) => {
    if (!word) return true;
    const lower = word.toLowerCase().trim();
    const noiseList = [
      "soundtrack", "remastered", "remaster", "live", "ost", "original", 
      "acoustic", "mono", "stereo", "single", "theme", "album", "instrumental", 
      "bonus", "track", "recorded", "re-recorded", "part", "deluxe", "edition", 
      "anniversary", "remasters", "remastering", "session", "sessions", 
      "broadcast", "concert", "unplugged", "vol", "volume", "hits", "greatest", 
      "collection", "ep", "lp", "one", "two", "three", "four", "five",
      "原声带", "重录版", "重录", "原声", "现场", 
      "现场版", "独奏", "单曲", "专辑", "特别版", "豪华版", "周年纪念", "纪念版", 
      "精选", "混音", "独唱"
    ];
    return noiseList.some(noise => lower.includes(noise));
  };

  const translateKeyword = (word) => {
    if (!word) return null;
    const matchedKey = Object.keys(englishToChineseMap).find(key => key.toLowerCase() === word.toLowerCase());
    return matchedKey ? englishToChineseMap[matchedKey] : null;
  };

  // 构建英文词 -> 主要聚类颜色的映射表
  // 遍历 scatter 中所有歌曲标题，统计每个英文单词在各聚类中出现的次数
  const wordClusterMap = useMemo(() => {
    const map = {}; // { lowerWord: { 0: count, 1: count, ... } }
    if (!scatterData) return map;

    // 获取翻译表中所有英文词（小写）
    const dictWords = new Set(Object.keys(englishToChineseMap).map(k => k.toLowerCase()));

    scatterData.forEach(song => {
      const title = song[2]; // 歌曲标题
      const cluster = song[5]; // 聚类索引
      if (!title || cluster === undefined) return;

      // 从歌曲标题中提取英文单词
      const words = title.toLowerCase().replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/);
      const seen = new Set(); // 同一首歌同一个词只计一次
      words.forEach(w => {
        if (w && dictWords.has(w) && !seen.has(w)) {
          seen.add(w);
          if (!map[w]) map[w] = {};
          map[w][cluster] = (map[w][cluster] || 0) + 1;
        }
      });
    });

    return map;
  }, [scatterData]);

  // 将 hex 颜色解析为 RGB
  const hexToRgb = (hex) => {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  };

  // RGB -> HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h, s, l };
  };

  // HSL -> hex
  const hslToHex = (h, s, l) => {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // 根据词的聚类统计，按各聚类占比加权混合颜色
  // 混合后在 HSL 空间提升饱和度，防止多色混合变灰
  const getWordColor = (englishWord) => {
    const lower = englishWord.toLowerCase();
    const stats = wordClusterMap[lower];
    if (!stats) return '#95A5A6';

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) return '#95A5A6';

    let r = 0, g = 0, b = 0;
    Object.entries(stats).forEach(([cluster, count]) => {
      const weight = count / total;
      const rgb = hexToRgb(clusterColors[parseInt(cluster)] || '#95A5A6');
      r += rgb.r * weight;
      g += rgb.g * weight;
      b += rgb.b * weight;
    });

    // 转 HSL，强制提升饱和度、控制亮度，保持鲜艳
    const hsl = rgbToHsl(Math.round(r), Math.round(g), Math.round(b));
    hsl.s = Math.max(hsl.s, 0.45); // 饱和度不低于 45%
    hsl.l = Math.min(hsl.l, 0.72); // 亮度不超过 72%
    hsl.l = Math.max(hsl.l, 0.55); // 亮度不低于 55%
    return hslToHex(hsl.h, hsl.s, hsl.l);
  };

  // 整合并计算所有年代的数据节点（仅热词，不含歌手）
  const allNodes = [];
  const decadeLabels = data.map(d => d.label);

  data.forEach((decadeData, decadeIndex) => {
    // 仅筛选热词（具备翻译对照）
    const translatedWords = [];
    decadeData.words.forEach(item => {
      if (!isNoiseWord(item.name)) {
        const trans = translateKeyword(item.name);
        if (trans) {
          translatedWords.push({
            ...item,
            translatedName: trans
          });
        }
      }
    });
    const filteredWords = translatedWords.slice(0, 8);

    // 纵坐标位置分配 (Y 轴在 0 - 100 之间分出 8 个高度，避免重叠)
    const yOffsets = [8, 20, 32, 44, 56, 68, 80, 92];

    // 气泡大小自适应映射 (45px - 78px)
    const values = filteredWords.map(item => item.value);
    const maxVal = values.length > 0 ? Math.max(...values) : 1;
    const minVal = values.length > 0 ? Math.min(...values) : 1;
    const valRange = maxVal - minVal || 1;

    filteredWords.forEach((item, itemIndex) => {
      const ratio = (item.value - minVal) / valRange;
      const size = Math.round(45 + ratio * 33);
      const color = getWordColor(item.name);

      allNodes.push({
        value: [decadeIndex, yOffsets[itemIndex], item.value],
        name: `🎵 ${item.translatedName}`,
        originalWord: item.name,
        symbolSize: size,
        clusterColor: color,
        decadeLabel: decadeData.label
      });
    });
  });

  const option = {
    backgroundColor: 'transparent',
    tooltip: { show: false },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '12%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: decadeLabels,
      boundaryGap: true,
      axisLine: { lineStyle: { color: '#E5E8EB', width: 1.5 } },
      axisTick: { show: false },
      axisLabel: {
        color: '#637381',
        fontSize: 12,
        fontWeight: 'bold',
        margin: 16,
        fontFamily: 'monospace',
        interval: 0,
        rotate: 15
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.035)',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    series: [
      {
        type: 'scatter',
        data: allNodes,
        symbol: 'circle',
        itemStyle: {
          color: function (params) {
            return params.data.clusterColor;
          },
          borderColor: '#FFFFFF',
          borderWidth: 2,
          shadowBlur: 14,
          shadowColor: 'rgba(0, 0, 0, 0.08)',
          shadowOffsetY: 5
        },
        label: {
          show: true,
          position: 'inside',
          formatter: function (params) {
            return params.data.name;
          },
          fontSize: 10,
          fontWeight: '900',
          color: '#FFFFFF',
          textBorderColor: 'rgba(0,0,0,0.22)',
          textBorderWidth: 2,
          fontFamily: 'Outfit, Inter, system-ui, sans-serif'
        },
        silent: true
      }
    ]
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px', width: '100%', gap: '15px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#212B36', fontWeight: '800', letterSpacing: '-0.02em' }}>
            🪐 年代文化时空长廊 (1960 - 2024 汉化歌名热词流)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#637381' }}>
            🎨 60年音乐浪潮尽收眼底：🎵 代表歌曲名字里的流行热词，气泡颜色由该词所属歌曲在 KMeans 5大聚类中的分布加权混合而成。
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {clusterLabels.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#637381', fontWeight: '700' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, border: '1px solid rgba(0,0,0,0.08)' }}></span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flexGrow: 1, width: '100%', position: 'relative', minHeight: '380px', backgroundColor: 'rgba(255, 255, 255, 0.35)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', overflow: 'hidden' }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }} notMerge={true} lazyUpdate={true} />
      </div>
    </div>
  );
};

export default TimelineChart;
