import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

// ── Module-scope pure helpers (allocated once, never re-created) ───────────
const _parseHex = (hex) => {
  if (!hex || typeof hex !== 'string' || hex[0] !== '#') return [168, 216, 185];
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
};
const _blendHex = (c1, c2, r) => {
  try {
    const [r1,g1,b1] = _parseHex(c1), [r2,g2,b2] = _parseHex(c2);
    return `rgb(${Math.round(r1+(r2-r1)*r)},${Math.round(g1+(g2-g1)*r)},${Math.round(b1+(b2-b1)*r)})`;
  } catch(e) { return c1 || '#A8D8B9'; }
};

const BASE_COLORS = ['#A8D8B9','#B4A6CD','#A2CBE6','#F1A5B4','#DDE29F','#F3D291','#E7AB87'];
const RIBBON_R = 68.1818; // inner arc radius in polar units
const ANIM_DURATION = 550; // ms
const ANIM_SOFT = 0.18;   // soft edge width for sweep

const ToggleableChordRadar = ({ sunburstData, graphData, radarFeatures, radarName, indicatorNames, featureMaxes, onNodeHover, onNodeClick }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // ECharts instance ref – for direct imperative updates during animation
  const echartsRef    = useRef(null);
  // Per-ribbon color info read by renderItem (written in useMemo, read in renderItem + RAF)
  const colorInfoRef  = useRef([]);
  // Base ribbon geometry (4 arc values) – cached here so RAF never calls getOption()
  const ribbonBaseRef = useRef([]);
  const rafRef        = useRef(null);

  const i18n = {
    danceability:'可舞度', energy:'能量', acousticness:'声学度', valence:'愉悦度',
    liveness:'现场感', instrumentalness:'器乐度', speechiness:'言语度'
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LEFT CHART OPTION  (no animProgress dependency → only re-runs when
  // hoveredCategory / data actually change, NOT on every animation frame)
  // ─────────────────────────────────────────────────────────────────────────
  const chordOptions = useMemo(() => {
    if (!graphData || !sunburstData) return {};

    // Build angle ranges & color map
    let cumVal = 0;
    const angleRanges = {}, catColors = {};
    sunburstData.forEach((root, i) => {
      const col = BASE_COLORS[i % BASE_COLORS.length];
      catColors[root.name] = col;
      (root.children || []).forEach(child => {
        angleRanges[child.name] = [cumVal, cumVal + child.value];
        catColors[child.name]   = col;
        cumVal += child.value;
      });
    });
    const totalValue = cumVal || 1;

    const nodeCatMap = {};
    graphData.nodes.forEach(n => { nodeCatMap[n.name] = n.category; });

    let ribbonData = [];
    let highlightNames = new Set();

    if (hoveredCategory) {
      const validNames = new Set([hoveredCategory]);
      const rootCat = sunburstData.find(c => c.name === hoveredCategory);
      (rootCat?.children || []).forEach(c => validNames.add(c.name));

      const links = graphData.links.filter(l =>
        validNames.has(l.source) // 只取从当前节点**主动**发出的连线（有向图逻辑）
      );

      highlightNames = new Set(validNames);
      links.forEach(l => {
        highlightNames.add(l.source); highlightNames.add(l.target);
        highlightNames.add(nodeCatMap[l.source]); highlightNames.add(nodeCatMap[l.target]);
      });

      const linkCounts = {};
      let minSim = Infinity, maxSim = -Infinity;
      links.forEach(l => {
        linkCounts[l.source] = (linkCounts[l.source] || 0) + 1;
        linkCounts[l.target] = (linkCounts[l.target] || 0) + 1;
        if (l.value < minSim) minSim = l.value;
        if (l.value > maxSim) maxSim = l.value;
      });
      const simRange = maxSim - minSim || 1;

      const offsets = {};
      const newColorInfo = [];
      ribbonData = links.map((l, idx) => {
        // Source side geometry (evenly divide arc width)
        const [ss, se] = angleRanges[l.source] || [0,1];
        const so = offsets[l.source] || 0;
        const aw = (1 / (linkCounts[l.source] || 1)) * (se - ss);
        offsets[l.source] = so + aw;
        const srcStart = ss + so, srcEnd = srcStart + aw;

        // Target side geometry (evenly divide arc width)
        const [ts, te] = angleRanges[l.target] || [0,1];
        const to2 = offsets[l.target] || 0;
        const bw  = (1 / (linkCounts[l.target] || 1)) * (te - ts);
        offsets[l.target] = to2 + bw;
        const tgtStart = ts + to2, tgtEnd = tgtStart + bw;

        // Normalize similarity to opacity (from 0.25 to 0.85)
        const normSim = (l.value - minSim) / simRange;
        const targetOpacity = 0.25 + normSim * 0.6;

        // Color direction (always start FROM hovered category)
        let srcColor = catColors[l.source] || '#FF8E8B';
        const tgtColor = catColors[l.target] || '#FF8E8B';
        const isSourceStart = validNames.has(l.source);

        const altColors = ['#A2CBE6', '#F3D291', '#F1A5B4'];
        // 将原本的大类颜色与蓝/黄/粉进行融合 (0.75 表示 75% 的蓝/黄/粉 + 25% 的原本大类颜色)
        srcColor = _blendHex(srcColor, altColors[idx % 3], 0.75);

        newColorInfo.push({
          fromColor: isSourceStart ? srcColor : tgtColor,
          toColor:   isSourceStart ? tgtColor : srcColor,
          isSourceStart,
          targetOpacity
        });

        // value[0-3] = arc geometry, value[4] = animation progress (0 initially)
        const item = { value: [srcStart, srcEnd, tgtStart, tgtEnd, 0], itemStyle: { opacity: targetOpacity } };
        return item;
      });

      // Write color info for RAF and renderItem to read
      colorInfoRef.current  = newColorInfo;
      // Cache geometry for RAF (avoids getOption() every frame)
      ribbonBaseRef.current = ribbonData.map(d => d.value.slice(0, 4));
    } else {
      colorInfoRef.current  = [];
      ribbonBaseRef.current = []; // Clear immediately so stale RAF frames don't re-draw
    }

    // Sunburst opacity logic
    const isSmall = hoveredCategory && !!nodeCatMap[hoveredCategory];
    const getOp = (name, isRoot) => {
      if (!hoveredCategory) return 1;
      if (!highlightNames.has(name)) return 0.15;
      if (isRoot && isSmall) return 0.45;
      return 1;
    };
    const activeSunburst = sunburstData.map(root => ({
      ...root,
      itemStyle: { ...root.itemStyle, opacity: getOp(root.name, true) },
      children: (root.children || []).map(c => ({
        ...c, itemStyle: { ...c.itemStyle, opacity: getOp(c.name, false) }
      }))
    }));

    return {
      color: BASE_COLORS,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#EEEEEE',
        textStyle: { color: '#333333', fontFamily: '"Outfit","Inter",sans-serif' },
        position: function (point, params, dom, rect, size) {
          // size.viewSize 是图表容器的宽高，size.contentSize 是提示框的宽高
          const viewWidth = size.viewSize[0];
          const viewHeight = size.viewSize[1];
          const cx = viewWidth / 2;
          const cy = viewHeight / 2;
          
          const [mx, my] = point;
          const [tw, th] = size.contentSize;
          const offset = 15; // 距离鼠标的偏移量

          // 朝向圆心的反方向：根据鼠标所在象限，把提示框向外推
          let x = mx > cx ? mx + offset : mx - tw - offset;
          let y = my > cy ? my + offset : my - th - offset;

          // 边缘防溢出保护，防止提示框被截断
          if (x < 0) x = 0;
          if (x + tw > viewWidth) x = viewWidth - tw;
          if (y < 0) y = 0;
          if (y + th > viewHeight) y = viewHeight - th;

          return [x, y];
        }
      },
      polar:      { center: ['50%','50%'], radius: '88%' },
      angleAxis:  { type:'value', startAngle:90, clockwise:true, min:0, max:totalValue, show:false },
      radiusAxis: { type:'value', min:0, max:100, show:false },
      series: [
        // ── Layer 1: Sunburst SECTORS only (colored fills, NO labels) ──
        {
          name: '流派层级关系', type: 'sunburst',
          data: activeSunburst, sort: null, radius: ['38%','88%'],
          nodeClick: false, // 禁用默认的点击下钻放大行为
          tooltip: { formatter: '<span style="font-weight:bold;">{b}</span><br/><span style="color:#666;font-size:12px;">曲库样本规模：{c} 首</span>' },
          emphasis: { focus: 'none' },
          itemStyle: { borderRadius:4, borderWidth:2, borderColor:'#FFFFFF' },
          label: { show: false },
          levels: [
            {},
            { r0:'38%', r:'60%', itemStyle:{borderWidth:2} },
            { r0:'60%', r:'92%', itemStyle:{borderWidth:1} }
          ],
          z: 2
        },
        // ── Layer 2: Ribbon chords (between sector fills and text) ──
        {
          id: 'ribbon-custom',
          name: '特征相似度弦带', type: 'custom', silent: true,
          coordinateSystem: 'polar',
          // renderItem: reads value[0-4] for geometry+progress, reads colorInfoRef for colors
          renderItem: (params, api) => {
            const center = api.coord([0,0]);
            const edgeP  = api.coord([RIBBON_R, 0]);
            const pixR   = Math.sqrt((edgeP[0]-center[0])**2 + (edgeP[1]-center[1])**2);

            const p1 = api.coord([RIBBON_R, api.value(0)]);
            const p2 = api.coord([RIBBON_R, api.value(1)]);
            const p3 = api.coord([RIBBON_R, api.value(2)]);
            const p4 = api.coord([RIBBON_R, api.value(3)]);
            const t  = api.value(4); // animation progress 0→1

            const info        = colorInfoRef.current[params.dataIndex] || {};
            const fromColor   = info.fromColor || '#A8D8B9';
            const toColor     = info.toColor   || '#B4A6CD';
            const isSrcStart  = info.isSourceStart ?? true;

            const srcX = (p1[0]+p2[0])/2, srcY = (p1[1]+p2[1])/2;
            const tgtX = (p3[0]+p4[0])/2, tgtY = (p3[1]+p4[1])/2;
            const fx = isSrcStart ? srcX : tgtX, fy = isSrcStart ? srcY : tgtY;
            const tx = isSrcStart ? tgtX : srcX, ty = isSrcStart ? tgtY : srcY;

            const es = Math.max(0, t - ANIM_SOFT), ee = Math.min(1, t);
            const colorStops = t >= 1
              ? [{ offset:0, color: fromColor }, { offset:1, color: toColor }]
              : [
                  { offset:0,  color: fromColor },
                  { offset:es, color: _blendHex(fromColor, toColor, es) },
                  { offset:ee, color: 'rgba(200,200,200,0)' },
                  { offset:1,  color: 'rgba(200,200,200,0)' }
                ];

            const style = api.style();
            style.fill    = { type:'linear', x:fx, y:fy, x2:tx, y2:ty, global:true, colorStops };
            // Use the similarity-based opacity
            style.opacity = info.targetOpacity !== undefined ? info.targetOpacity : 0.75;
            
            // 增加一点白色描边，让相邻或重叠的弦能够被物理分割开，增加区分度
            style.stroke = 'rgba(255, 255, 255, 0.4)';
            style.lineWidth = 1.5;

            return {
              type: 'path',
              shape: { pathData: `M ${p1[0]} ${p1[1]} A ${pixR} ${pixR} 0 0 1 ${p2[0]} ${p2[1]} Q ${center[0]} ${center[1]} ${p3[0]} ${p3[1]} A ${pixR} ${pixR} 0 0 1 ${p4[0]} ${p4[1]} Q ${center[0]} ${center[1]} ${p1[0]} ${p1[1]} Z` },
              style
            };
          },
          data: ribbonData,
          z: 5
        },
        // ── Layer 3: Sunburst LABELS only (transparent sectors, text on top) ──
        {
          name: '流派文字标签', type: 'sunburst',
          data: activeSunburst, sort: null, radius: ['38%','88%'],
          nodeClick: false,
          silent: true,  // Don't intercept mouse — Layer 1 handles interaction
          tooltip: { show: false },
          emphasis: { focus: 'none' },
          itemStyle: { color: 'transparent', borderColor: 'transparent', borderWidth: 0, opacity: 0 },
          label: { show:true, color:'#333333', textBorderColor:'rgba(255,255,255,0.7)', textBorderWidth:2, fontFamily:'"Outfit","Inter",sans-serif', lineHeight:16 },
          levels: [
            {},
            { r0:'38%', r:'60%', itemStyle:{color:'transparent',borderColor:'transparent'}, label:{rotate:'tangential',fontSize:12,fontWeight:'bold'} },
            { r0:'60%', r:'92%', itemStyle:{color:'transparent',borderColor:'transparent'}, label:{position:'inside',fontSize:10,minAngle:3} }
          ],
          z: 10
        }
      ]
    };
  }, [sunburstData, graphData, hoveredCategory]); // ← NO animProgress in deps!

  // ─────────────────────────────────────────────────────────────────────────
  // RAF ANIMATION – directly patches ECharts instance, zero React re-renders
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!hoveredCategory) return;

    let startTime = null;

    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const raw = Math.min((ts - startTime) / ANIM_DURATION, 1);
      // easeInOutQuad: smooth start + smooth end, no lingering deceleration tail
      const t = raw < 0.5 ? 2 * raw * raw : 1 - (-2 * raw + 2) ** 2 / 2;

      const ec = echartsRef.current?.getEchartsInstance?.();
      const base = ribbonBaseRef.current; // ← read from ref, NEVER call getOption()
      if (ec && base.length > 0) {
        // Build new data array directly from cached geometry + current t
        const newData = base.map((geo, i) => {
          const op = colorInfoRef.current[i]?.targetOpacity || 0.75;
          return {
            value: [geo[0], geo[1], geo[2], geo[3], t],
            itemStyle: { opacity: op }
          };
        });
        ec.setOption({ series: [{ id: 'ribbon-custom', data: newData }] });
      }

      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // Immediately flush empty ribbons so no ghost frames linger on canvas
      const ec = echartsRef.current?.getEchartsInstance?.();
      if (ec) ec.setOption({ series: [{ id: 'ribbon-custom', data: [] }] });
    };
  }, [hoveredCategory]);

  // ─────────────────────────────────────────────────────────────────────────
  // RIGHT CHART: Standalone Radar
  // ─────────────────────────────────────────────────────────────────────────
  const radarOptions = useMemo(() => {
    if (!radarFeatures || !indicatorNames?.length) return {};
    
    // 建立小类到大类的映射，方便图例显示
    const nodeCatMap = {};
    if (graphData?.nodes) {
      graphData.nodes.forEach(n => { nodeCatMap[n.name] = n.category; });
    }

    const currentName = hoveredCategory || radarName;
    const currentCatRaw = currentName ? nodeCatMap[currentName] : null;
    let mainSeriesName = currentName || '当前选择流派';
    if (currentCatRaw) {
      const catClean = currentCatRaw.split('\n')[0];
      mainSeriesName = `${currentName} (${catClean})`;
    }

    // 主特征数据（当前选择/悬停的流派）
    const radarSeriesData = [{ 
      value: indicatorNames.map(k => radarFeatures[k] || 0), 
      name: mainSeriesName, 
      areaStyle: {color:'rgba(168,216,185,0.45)'}, 
      lineStyle: {width:3,color:'#88B04B'}, 
      itemStyle: {color:'#88B04B'} 
    }];

    // 如果悬停的是一个小类，则提取它发出的 3 条相似弦的目标流派，一并绘制
    if (hoveredCategory && graphData?.links && graphData?.nodes) {
      const isSubcategory = graphData.nodes.some(n => n.name === hoveredCategory);
      if (isSubcategory) {
        // 取出主动发出的连线，并按照相关性 (value) 从大到小排序
        const outLinks = graphData.links
          .filter(l => l.source === hoveredCategory)
          .sort((a, b) => b.value - a.value);

        // 按照相关性递减，颜色顺序：浅蓝 -> 淡黄 -> 粉红；透明度递减：1.0 -> 0.6 -> 0.3
        const altColors = ['#A2CBE6', '#F3D291', '#F1A5B4'];
        const opacities = [1.0, 0.6, 0.3];

        outLinks.forEach((l, idx) => {
          const targetNode = graphData.nodes.find(n => n.name === l.target);
          if (targetNode && targetNode.features) {
            const color = altColors[idx % 3];
            const opacity = opacities[idx % 3];
            const catName = (nodeCatMap[l.target] || '未知').split('\n')[0];
            radarSeriesData.push({
              value: indicatorNames.map(k => targetNode.features[k] || 0),
              name: `${l.target} (${catName})`,
              areaStyle: { color: 'transparent' }, // 相似流派不填充面积
              lineStyle: { width: 2, type: 'dashed', color, opacity }, // 虚线及透明度
              itemStyle: { color, opacity }
            });
          }
        });
      }
    }

    return {
      tooltip: { trigger:'item', backgroundColor:'rgba(255,255,255,0.95)', borderColor:'#A8D8B9', textStyle:{color:'#333333',fontFamily:'"Outfit","Inter",sans-serif'} },
      legend: { show: true, top: '75%', icon: 'circle', textStyle: { fontSize: 12, fontFamily: '"Outfit","Inter",sans-serif', color: '#555' } },
      radar: {
        center:['50%','46%'], radius:'60%', // 稍微上移并缩小一点，给底部的图例留出空间
        indicator: indicatorNames.map(n => ({ name: i18n[n] || n, max: featureMaxes?.[n] ? featureMaxes[n]*1.05 : 1 })),
        splitNumber: 4,
        axisName:  { color:'#555555', fontWeight:'bold', fontSize:12, borderRadius:3, padding:[3,6], backgroundColor:'rgba(255,255,255,0.85)' },
        splitArea: { areaStyle:{ color:['rgba(250,250,250,0.3)','rgba(240,240,240,0.5)','rgba(230,230,230,0.8)','rgba(168,216,185,0.2)'] } },
        axisLine:  { lineStyle:{ color:'#DDDDDD' } },
        splitLine: { lineStyle:{ color:'#DDDDDD' } }
      },
      series: [{
        name:'流派声学特征', type:'radar',
        data: radarSeriesData
      }]
    };
  }, [radarFeatures, indicatorNames, featureMaxes, hoveredCategory, graphData]);

  const chordEvents = {
    click:     p => { if (p.seriesType === 'sunburst' && p.data?.features) onNodeClick(p.data); },
    mouseover: p => { if (p.seriesType === 'sunburst') { if (p.data?.features) onNodeHover(p.data); setHoveredCategory(p.name); } },
    mouseout:  p => { if (p.seriesType === 'sunburst') setHoveredCategory(null); }
  };

  return (
    <div className="chart-container" style={{ display:'flex', height:'800px', width:'100%' }}>
      {/* Left: Sunburst + Chord Ribbons */}
      <div style={{ flex:'0 0 60%', height:'100%' }}>
        <ReactECharts
          ref={echartsRef}
          key="chord-sunburst"
          option={chordOptions}
          style={{ height:'100%', width:'100%' }}
          onEvents={chordEvents}
        />
      </div>

      {/* Right: Radar */}
      <div style={{ flex:'0 0 40%', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        {radarFeatures ? (
          <ReactECharts option={radarOptions} style={{ height:'100%', width:'100%' }} />
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#AAAAAA', fontSize:'14px', flexDirection:'column', gap:'12px' }}>
            <div style={{ fontSize:'48px', opacity:0.3 }}>🎵</div>
            <span>悬停旭日图节点，查看流派特征七维分析</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToggleableChordRadar;
