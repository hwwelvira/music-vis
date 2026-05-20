import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

const englishToChineseMap = {
  // 核心音乐、情感与高频常用实词
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
  "Drought": "干旱", "Fire": "火灾", "Smoke": "烟雾", "Fog": "浓雾", "Mist": "薄雾", "Dew": "露水",
  "Frost": "严霜", "Ice": "冰霜", "Snow": "白雪", "Rain": "雨水", "Cloud": "浮云", "Sky": "天空",
  "Air": "空气", "Wind": "微风", "Dust": "尘埃", "Dirt": "泥土", "Mud": "烂泥", "Clay": "粘土",
  "Sand": "细沙", "Rock": "岩石", "Stone": "石头", "Pebble": "鹅卵石", "Gravel": "砾石", "Soil": "土壤",
  "Land": "陆地", "Mountain": "山脉", "Hill": "小山", "Valley": "山谷", "Canyon": "峡谷", "Cliff": "悬崖",
  "Cave": "洞穴", "Forest": "森林", "Wood": "树林", "Jungle": "丛林", "Desert": "沙漠", "Plains": "平原",
  "Meadow": "草地", "Swamp": "沼泽", "Marsh": "湿地", "Island": "岛屿", "Peninsula": "半岛", "Cape": "海角",
  "Bay": "海湾", "Gulf": "海湾", "Harbor": "港口", "Port": "港口", "Shore": "海岸", "Coast": "海岸",
  "Beach": "沙滩", "Spring": "泉水", "Well": "井水", "Waterfall": "瀑布", "Geyser": "喷泉", "Glacier": "冰川",
  "Iceberg": "冰山", "One": "一", "Two": "二", "Three": "三", "Four": "四", "Five": "五", "Sex": "性",
  "Drug": "药", "Girls": "女孩们", "Boys": "男孩们", "Nights": "黑夜", "Days": "白昼", "World": "世界",
  "Worlds": "世界", "Christmas": "圣诞", "Green": "绿色", "Yellow": "黄色", "Purple": "紫色",
  "Pink": "粉色", "Orange": "橙色", "Brown": "棕色", "Gray": "灰色", "Silver": "银色", "Gold": "金色",
  "Bronze": "青铜", "Copper": "红铜", "Iron": "黑铁", "Steel": "精钢", "Metal": "金属", "Bones": "风骨"
};

const TimelineChart = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewType, setViewType] = useState('artist');

  useEffect(() => {
    let timer;
    if (isPlaying && data && data.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % data.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, data]);

  if (!data || data.length === 0) return null;

  const currentData = data[currentIndex];

  const isNoiseWord = (word) => {
    if (!word) return true;
    const lower = word.toLowerCase().trim();
    const noiseList = [
      "soundtrack", "remastered", "remaster", "live", "ost", "original", 
      "acoustic", "mono", "stereo", "single", "theme", "album", "instrumental", 
      "bonus", "track", "recorded", "re-recorded", "part", "deluxe", "edition", 
      "anniversary", "remasters", "remastering", "session", "sessions", 
      "broadcast", "concert", "unplugged", "vol", "volume", "hits", "greatest", 
      "collection", "ep", "lp", "原声带", "重录版", "重录", "原声", "现场", 
      "现场版", "独奏", "单曲", "专辑", "特别版", "豪华版", "周年纪念", "纪念版", 
      "精选", "混音", "独唱"
    ];
    return noiseList.some(noise => lower.includes(noise));
  };

  const clusterColors = ['#0D9488', '#DB2777', '#7C3AED', '#EA580C', '#2563EB'];

  const getColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return clusterColors[Math.abs(hash) % clusterColors.length];
  };

  const translateKeyword = (word) => {
    if (!word) return null;
    const matchedKey = Object.keys(englishToChineseMap).find(key => key.toLowerCase() === word.toLowerCase());
    return matchedKey ? englishToChineseMap[matchedKey] : null;
  };

  const combinedNodes = [];
  const filteredArtists = currentData.artists.filter(item => !isNoiseWord(item.name));
  const filteredWords = currentData.words.filter(item => !isNoiseWord(item.name));

  if (viewType === 'artist') {
    const artistValues = filteredArtists.map(item => item.value);
    const maxVal = artistValues.length > 0 ? Math.max(...artistValues) : 1;
    const minVal = artistValues.length > 0 ? Math.min(...artistValues) : 1;
    const valRange = maxVal - minVal || 1;

    filteredArtists.forEach((item) => {
      const ratio = (item.value - minVal) / valRange;
      const fontSize = Math.round(11 + ratio * 15); // 映射到 11px - 26px
      const color = getColor(item.name);
      combinedNodes.push({
        id: `artist_${item.name}`,
        name: item.name,
        value: item.value,
        symbolSize: fontSize * 2.3,
        symbol: 'circle',
        itemStyle: { color: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)', borderWidth: 0 },
        label: {
          show: true, color: color, fontSize: fontSize, fontWeight: 'bold',
          textShadowBlur: 4, textShadowColor: 'rgba(255, 255, 255, 0.9)', opacity: 1
        },
        category: 0
      });
    });
  } else {
    // 过滤出能够完美汉化的中文热词
    const translatedWords = [];
    filteredWords.forEach((item) => {
      const translatedName = translateKeyword(item.name);
      if (translatedName) {
        translatedWords.push({
          ...item,
          translatedName
        });
      }
    });

    const wordValues = translatedWords.map(item => item.value);
    const maxVal = wordValues.length > 0 ? Math.max(...wordValues) : 1;
    const minVal = wordValues.length > 0 ? Math.min(...wordValues) : 1;
    const valRange = maxVal - minVal || 1;

    translatedWords.forEach((item) => {
      const ratio = (item.value - minVal) / valRange;
      const fontSize = Math.round(11 + ratio * 15); // 映射到 11px - 26px
      const color = getColor(item.name);
      combinedNodes.push({
        id: `word_${item.name}`,
        name: item.translatedName,
        originalName: item.name,
        value: item.value,
        symbolSize: fontSize * 2.4,
        symbol: 'circle',
        itemStyle: { color: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)', borderWidth: 0 },
        label: {
          show: true, color: color, fontSize: fontSize, fontWeight: 'bold', fontStyle: 'italic',
          textShadowBlur: 4, textShadowColor: 'rgba(255, 255, 255, 0.9)', opacity: 1
        },
        category: 1
      });
    });
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#EAEAEB',
      borderWidth: 1,
      textStyle: { color: '#212B36', fontSize: 13 },
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowBlur: 10,
      formatter: (params) => {
        if (!params.data.name) return '';
        const isArtist = params.data.category === 0;
        const displayName = isArtist ? params.data.name : `${params.data.name} (${params.data.originalName})`;
        return `<div style="padding: 4px 8px; font-family: sans-serif;">
          <b style="color: ${params.data.label?.color || '#212B36'}; font-size: 14px;">${displayName}</b><br/>
          <span style="color: #637381; margin-top: 4px; display: inline-block; font-size: 12px;">
            ${isArtist ? '🎙️ 代表歌手活跃度 (曲目数)' : '🎵 歌名流行热词频次'}: <b>${params.data.value}</b>
          </span>
        </div>`;
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      force: { repulsion: viewType === 'artist' ? 100 : 120, gravity: 0.05, layoutAnimation: true },
      left: '2%', right: '2%', top: '2%', bottom: '2%',
      roam: true, draggable: true,
      label: { show: true, position: 'inside', formatter: '{b}', fontFamily: 'Outfit, Inter, system-ui, sans-serif' },
      data: combinedNodes,
      links: []
    }]
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '660px', width: '100%', gap: '15px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#212B36', fontWeight: '800', letterSpacing: '-0.02em' }}>
            流行音乐年代星系 ({viewType === 'artist' ? '代表歌手活跃度' : '歌名流行中文热词'})
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#637381' }}>
            {viewType === 'artist' ? '🎙️ 粗体文字为年代代表歌手，大小代表活跃歌单曲目数。' : '🎵 粗斜体字为歌曲名字里最流行的英文单词已翻译成的中文热词。'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '30px' }}>
            <button onClick={() => setViewType('artist')} style={{ border: 'none', background: viewType === 'artist' ? '#00A896' : 'transparent', color: viewType === 'artist' ? '#FFFFFF' : '#637381', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>🎙️ 代表歌手</button>
            <button onClick={() => setViewType('word')} style={{ border: 'none', background: viewType === 'word' ? '#00A896' : 'transparent', color: viewType === 'word' ? '#FFFFFF' : '#637381', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>🎵 歌名热词</button>
          </div>
          <div style={{ background: 'rgba(0, 168, 150, 0.12)', border: '1px solid #00A896', borderRadius: '50px', padding: '6px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00A896', animation: isPlaying ? 'pulse 1.5s infinite' : 'none' }}></span>
            <span style={{ color: '#008274', fontWeight: '800', fontSize: '16px', fontFamily: 'monospace' }}>{currentData.label} 年代</span>
          </div>
        </div>
      </div>
      <div style={{ flexGrow: 1, width: '100%', position: 'relative', minHeight: '380px', backgroundColor: 'rgba(255, 255, 255, 0.35)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.6)', overflow: 'hidden' }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} lazyUpdate={true} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 20px 10px 20px', background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '12px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ background: '#00A896', border: 'none', color: '#FFFFFF', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPlaying ? <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="5" y="4" width="4" height="16" rx="1" /><rect x="15" y="4" width="4" height="16" rx="1" /></svg> : <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginLeft: '2px' }}><path d="M8 5v14l11-7z" /></svg>}
          </button>
          <input type="range" min="0" max={data.length - 1} value={currentIndex} onChange={(e) => { setCurrentIndex(parseInt(e.target.value)); setIsPlaying(false); }} style={{ flexGrow: 1, cursor: 'pointer', accentColor: '#00A896' }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.6; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.6; } }`}</style>
    </div>
  );
};

export default TimelineChart;
