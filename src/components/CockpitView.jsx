import React from 'react';
import ToggleableChordRadar from './ToggleableChordRadar';
import ScatterBrushChart from './ScatterBrushChart';
import SongTable from './SongTable';

const CockpitView = ({ 
  data, 
  selectedGenre, 
  setSelectedGenre, 
  brushedData, 
  setBrushedData, 
  selectedSong, 
  setSelectedSong 
}) => {
  
  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px', color: '#637381' }}>
        ⏳ 正在加载极客驾驶舱...
      </div>
    );
  }

  // 联动雷达图的数据源
  let radarData = null;
  let radarName = '';

  if (selectedGenre && selectedGenre.features) {
    radarData = selectedGenre.features;
    radarName = selectedGenre.name;
  } else if (data.sunburst && data.sunburst.length > 0) {
    radarData = data.sunburst[0].features;
    radarName = data.sunburst[0].name;
  }

  const [hoveredCategory, setHoveredCategory] = React.useState(null);

  // 计算旭日图悬停节点关联的所有流派名字（包含主流派旗下的所有子流派）
  const hoveredGenres = React.useMemo(() => {
    if (!hoveredCategory || !data || !data.sunburst) return [];
    
    const cleanHover = hoveredCategory.trim().toLowerCase();
    
    // 寻找匹配的主流派
    const matchedParent = data.sunburst.find(parent => {
      const cleanParentName = parent.name.split('\n')[0].trim().toLowerCase();
      return cleanParentName === cleanHover || parent.name.trim().toLowerCase() === cleanHover;
    });

    if (matchedParent) {
      const childrenNames = matchedParent.children 
        ? matchedParent.children.map(c => c.name.trim().toLowerCase()) 
        : [];
      const parentNameClean = matchedParent.name.split('\n')[0].trim().toLowerCase();
      return [parentNameClean, ...childrenNames];
    } else {
      return [cleanHover];
    }
  }, [hoveredCategory, data]);

  return (
    <div 
      style={{
        display: 'flex',
        width: '100%',
        height: 'calc(100vh - 120px)', // 精准锁死一屏高度，减去头部与药丸导航高度，完全禁止外层滚动
        gap: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* ==========================================
          🖥️ 左栏 (40% 宽度): 流派旭日分布窗格
          ========================================== */}
      <div 
        className="card"
        style={{
          flex: '0 0 40%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.75)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px 0 rgba(145, 158, 171, 0.08)',
          padding: '20px',
          overflow: 'hidden',
          minWidth: 0
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(145,158,171,0.1)', paddingBottom: '10px', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '11.5px', color: '#1E293B', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🌀 流派多维分布结构</span>
          </h3>
          <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 'bold' }}>点击/悬停 联动雷达与星云</span>
        </div>
        
        <div style={{ flexGrow: 1, minHeight: 0, width: '100%', position: 'relative' }}>
          <ToggleableChordRadar 
            viewMode="sunburst"
            hoveredCategory={hoveredCategory}
            setHoveredCategory={setHoveredCategory}
            sunburstData={data.sunburst}
            graphData={data.graph}
            radarFeatures={radarData}
            radarName={radarName}
            indicatorNames={data.radar_features}
            featureMaxes={data.featureMaxes}
            scatterData={data.scatter}
            onNodeClick={(node) => setSelectedGenre(node)} 
            onNodeHover={(node) => {
              setSelectedGenre(node);
              setHoveredCategory(node ? node.name : null);
            }}
          />
        </div>
      </div>

      {/* ==========================================
          🖥️ 中栏 (38% 宽度): 雷达图 + KMeans图 上下布局
          ========================================== */}
      <div 
        style={{
          flex: '0 0 38%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          minWidth: 0
        }}
      >
        {/* 上子卡片: 雷达图 */}
        <div
          className="card"
          style={{
            height: 'calc(50% - 8px)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.75)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(145, 158, 171, 0.08)',
            padding: '16px 20px',
            overflow: 'hidden',
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(145,158,171,0.1)', paddingBottom: '6px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '11.5px', color: '#1E293B', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🌀 流派声学特征七维雷达</span>
            </h3>
            <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 'bold' }}>实时相似流派对比</span>
          </div>

          <div style={{ flexGrow: 1, minHeight: 0, width: '100%', position: 'relative' }}>
            <ToggleableChordRadar 
              viewMode="radar"
              hoveredCategory={hoveredCategory}
              setHoveredCategory={setHoveredCategory}
              sunburstData={data.sunburst}
              graphData={data.graph}
              radarFeatures={radarData}
              radarName={radarName}
              indicatorNames={data.radar_features}
              featureMaxes={data.featureMaxes}
              scatterData={data.scatter}
              onNodeClick={(node) => setSelectedGenre(node)} 
              onNodeHover={(node) => {
                setSelectedGenre(node);
                setHoveredCategory(node ? node.name : null);
              }}
            />
          </div>
        </div>

        {/* 下子卡片: KMeans 星云聚类图 */}
        <div
          className="card"
          style={{
            height: 'calc(50% - 8px)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.75)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(145, 158, 171, 0.08)',
            padding: '16px 20px',
            overflow: 'hidden',
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(145,158,171,0.1)', paddingBottom: '6px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '11.5px', color: '#1E293B', fontWeight: '800' }}>
              🌌 歌曲KMeans星云聚类与框选过滤 (Energy vs Valence)
            </h3>
            <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 'bold' }}>支持框选/高亮联动</span>
          </div>

          <div style={{ flexGrow: 1, minHeight: 0, width: '100%', position: 'relative' }}>
            <ScatterBrushChart 
              data={data.scatter} 
              selectedSong={selectedSong}
              hoveredGenres={hoveredGenres}
              onBrush={(selectedIndices) => {
                const selected = selectedIndices.map(i => data.scatter[i]);
                setBrushedData(selected);
                setSelectedSong(null);
              }} 
            />
          </div>
        </div>
      </div>

      {/* ==========================================
          🖥️ 右栏 (22% 宽度): 歌曲列表竖向长条卡片
          ========================================== */}
      <div 
        className="card"
        style={{
          flex: '0 0 22%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.75)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px 0 rgba(145, 158, 171, 0.08)',
          padding: '20px',
          overflow: 'hidden',
          minWidth: 0
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(145,158,171,0.1)', paddingBottom: '10px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '11.5px', color: '#1E293B', fontWeight: '800' }}>
            📋 歌曲列表 ({brushedData.length > 0 ? brushedData.length : data.scatter.length} 首)
          </h3>
        </div>

        <div style={{ flexGrow: 1, minHeight: 0, width: '100%', position: 'relative' }}>
          <SongTable 
            songs={brushedData.length > 0 ? brushedData : data.scatter} 
            selectedSong={selectedSong}
            onSongClick={(song) => setSelectedSong(song)}
            isCompact={true} // 启用精简模式，确保在窄栏中文字呼吸顺畅绝不折行拥挤！
          />
        </div>
      </div>
    </div>
  );
};

export default CockpitView;
