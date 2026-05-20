import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

const CombinedChordRadar = ({ sunburstData, graphData, radarFeatures, indicatorNames, featureMaxes, onNodeHover, onNodeClick }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const i18n = {
    danceability: '可舞度',
    energy: '能量',
    acousticness: '声学度',
    valence: '愉悦度',
    liveness: '现场感',
    instrumentalness: '器乐度',
    speechiness: '言语度'
  };

  const dataValues = radarFeatures ? indicatorNames.map(key => radarFeatures[key]) : [];

  const options = useMemo(() => {
    if (!graphData || !sunburstData) return {};

    const categoryColors = {
      '流行\nPop': '#A8D8B9',
      '摇滚\nRock': '#B4A6CD',
      '电子舞曲\nElectronic': '#A2CBE6',
      '原声/民谣\nFolk': '#F1A5B4',
      '嘻哈/R&B\nHip-Hop': '#DDE29F',
      '蓝调/爵士\nJazz': '#F3D291',
      '古典\nClassical': '#E7AB87',
      '其他': '#DDDDDD'
    };
    
    // =========================================================
    // PERFECT SYNCHRONIZATION ALGORITHM: SUNBURST <-> POLAR GRAPH
    // =========================================================
    // ECharts Sunburst allocates 360 degrees proportionally to the `value` of leaves.
    // It defaults to starting at 90 degrees and going clockwise.
    // By creating a Polar coordinate system with exactly the same angular scale, 
    // we can perfectly align our invisible Graph nodes with the outer edges of the Sunburst slices!
    
    let currentCumulativeValue = 0;
    const nodePolarAngles = {}; 
    
    sunburstData.forEach(rootCategory => {
        if (rootCategory.children) {
            rootCategory.children.forEach(child => {
                // The angular center of this particular slice
                const centerValue = currentCumulativeValue + (child.value / 2);
                nodePolarAngles[child.name] = centerValue;
                currentCumulativeValue += child.value;
            });
        }
    });
    
    const totalValue = currentCumulativeValue || 1; // Prevent divide by zero

    const nodeCatMap = {};
    graphData.nodes.forEach(n => {
        nodeCatMap[n.name] = n.category;
    });

    // Generate active links based on hover interaction natively managed via React state
    let activeLinks = [];
    if (hoveredCategory) {
       const validNames = new Set();
       validNames.add(hoveredCategory);
       
       // Handle hover behavior: if user hovers the large center-ring (Pop/Rock/etc), recursively highlight all branches inside it
       const rootCat = sunburstData.find(c => c.name === hoveredCategory);
       if (rootCat && rootCat.children) {
           rootCat.children.forEach(c => validNames.add(c.name));
       }

       activeLinks = graphData.links.filter(link => 
           validNames.has(link.source) || validNames.has(link.target)
       ).map(link => {
         const catSource = nodeCatMap[link.source];
         const catTarget = nodeCatMap[link.target];
         
         let linkColor = '';
         if (catSource === catTarget) {
            // Intra-category (同源相似): Gentle matching category color
            linkColor = categoryColors[catSource] || '#DDDDDD';
         } else {
            // Cross-category Fusion (跨界相似): Highly vivid striking coral color to highlight fusion 
            linkColor = '#FF8E8B'; 
         }

         return {
            ...link,
            lineStyle: {
              width: Math.max(1.5, (link.value - 0.5) * 10), // Dynamically thickness mapping
              opacity: 0.75,
              color: linkColor 
            }
         };
      });
    }

    // Inject exact polar coordinate [radius, angle_value] into each graph node
    const nodes = graphData.nodes.map(node => {
        // Find if this node is an anchor at any end of an active line
        const isActiveEndpoint = activeLinks.some(l => l.source === node.name || l.target === node.name);
        
        return {
            ...node,
            value: [100, nodePolarAngles[node.name] || 0], // [radius (max 100), angle (value index limits)]
            symbolSize: isActiveEndpoint ? 7 : 0, // Draw tiny glowing dots ONLY where active lines touch bounds!
            itemStyle: { 
                color: categoryColors[node.category] || '#CCCCCC', 
                borderColor: '#FFFFFF',
                borderWidth: isActiveEndpoint ? 1.5 : 0,
                shadowColor: 'rgba(0,0,0,0.15)',
                shadowBlur: 4
            },
            label: { show: false } 
        };
    });

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#EEEEEE',
        textStyle: {
          color: '#333333',
          fontFamily: '"Outfit", "Inter", sans-serif'
        }
      },
      // 1. Setup Polar Coordinate System mathematically equal to Sunburst bounds
      polar: {
        center: ['50%', '50%'],
        radius: '88%' // Align strictly with the Sunburst outer boundary ("88%")
      },
      angleAxis: {
        type: 'value',
        startAngle: 90, // ECharts Sunburst default starts at 90 degrees (top)
        clockwise: true, // ECharts Sunburst default traverses clockwise
        min: 0,
        max: totalValue,
        show: false
      },
      radiusAxis: {
        type: 'value',
        min: 0,
        max: 100,
        show: false
      },
      // 2. Setup Central Radar properties
      radar: {
        center: ['50%', '50%'],
        radius: '18%', 
        indicator: indicatorNames.map(name => ({
          name: i18n[name] || name,
          max: featureMaxes && featureMaxes[name] ? featureMaxes[name] * 1.05 : 1
        })),
        splitNumber: 4,
        axisName: {
          color: '#666666',
          fontWeight: 'bold',
          fontSize: 10,
          borderRadius: 3,
          padding: [2, 4],
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          nameGap: 8
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(250, 250, 250, 0.3)', 'rgba(240, 240, 240, 0.5)', 'rgba(230, 230, 230, 0.8)', 'rgba(168, 216, 185, 0.2)']
          }
        },
        axisLine: { lineStyle: { color: '#EEEEEE' } },
        splitLine: { lineStyle: { color: '#EEEEEE' } },
        z: 3
      },
      // 3. Render all layered series
      series: [
        {
          name: '流派层级关系 (Sunburst Matrix)',
          type: 'sunburst',
          data: sunburstData,
          sort: null, // Critical: prevent reshuffling the data indices to maintain synchronous polar map alignment!
          radius: ['38%', '88%'], 
          itemStyle: {
            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#FFFFFF'
          },
          label: {
            show: true,
            color: '#333333',
            textBorderColor: 'rgba(255,255,255,0.7)',
            textBorderWidth: 2,
            fontFamily: '"Outfit", "Inter", sans-serif',
            lineHeight: 16
          },
          levels: [
            {},
            {
              r0: '38%',
              r: '60%',
              itemStyle: { borderWidth: 2 },
              label: {
                rotate: 'tangential',
                fontSize: 12,
                fontWeight: 'bold'
              }
            },
            {
              r0: '60%',
              r: '92%',
              label: {
                position: 'inside',
                fontSize: 10,
                minAngle: 3
              },
              itemStyle: { borderWidth: 1 }
            }
          ],
          z: 2
        },
        {
          name: '多维声学特征轮廓 (Radar Fill)',
          type: 'radar',
          data: [
            {
              value: dataValues,
              name: '平均特征值构成 (Feature Profile)',
              areaStyle: { color: 'rgba(168, 216, 185, 0.5)' },
              lineStyle: { width: 3, color: '#A8D8B9' },
              itemStyle: { color: '#88B04B' }
            }
          ],
          z: 4
        },
        {
          name: '高维特征相似度纽带 (Chord Web)',
          type: 'graph',
          coordinateSystem: 'polar',
          layout: 'none', // Critical: using manual coordinates derived from angleAxis mappings
          data: nodes,
          links: activeLinks,
          roam: false,
          lineStyle: {
            curveness: 0.35 // Provides graceful bezier curving across the central radar void
          },
          silent: true, 
          z: 5
        }
      ]
    };
  }, [sunburstData, graphData, radarFeatures, indicatorNames, featureMaxes, hoveredCategory]);

  const onEvents = {
    click: (params) => {
      if (params.seriesType === 'sunburst' && params.data && params.data.features) {
        onNodeClick(params.data);
      }
    },
    mouseover: (params) => {
      if (params.seriesType === 'sunburst') {
        if (params.data && params.data.features) {
           onNodeHover(params.data);
        }
        setHoveredCategory(params.name);
      }
    },
    mouseout: (params) => {
      if (params.seriesType === 'sunburst') {
        setHoveredCategory(null);
      }
    }
  };

  return (
    <div className="chart-container" style={{ height: '800px', width: '100%' }}>
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} onEvents={onEvents} />
    </div>
  );
};

export default CombinedChordRadar;
