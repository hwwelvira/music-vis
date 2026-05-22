import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

const ScatterBrushChart = ({ data, onBrush, selectedSong }) => {
  const chartRef = useRef(null);

  // The cluster colors for a modern premium look
  const clusterColors = ['#A8D8B9', '#B4A6CD', '#A2CBE6', '#F1A5B4', '#DDE29F'];

  const legendItems = [
    { label: '狂热释放', color: '#A8D8B9' },    // Cluster 0: 高能量+中愉悦
    { label: '轻松愉快', color: '#B4A6CD' },    // Cluster 1: 中能量+高愉悦
    { label: '伤感静谧', color: '#A2CBE6' },    // Cluster 2: 低能量+低愉悦
    { label: '阳光活力', color: '#F1A5B4' },    // Cluster 3: 高能量+高愉悦
    { label: '迷幻张力', color: '#DDE29F' }     // Cluster 4: 中能量+低愉悦
  ];

  const options = {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: function (param) {
        return `
          <div style="font-weight: 600;">${param.data[2]}</div>
          <div style="color:#666666; font-size:12px;">${param.data[3]}</div>
          <div style="margin-top: 5px; font-size: 12px; color:#333;">
            能量: ${param.data[0]}<br/>
            愉悦度: ${param.data[1]}<br/>
            流派: ${param.data[4]}
          </div>
        `;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#EEEEEE',
      textStyle: { color: '#333333' },
      padding: 10,
    },
    brush: {
      toolbox: ['rect', 'polygon', 'keep', 'clear'],
      xAxisIndex: 0,
      inBrush: { opacity: 1 },
      outOfBrush: { opacity: 0.1 }
    },
    toolbox: {
      iconStyle: { borderColor: '#999999' },
      emphasis: { iconStyle: { borderColor: '#A8D8B9' } },
      feature: {
        brush: { type: ['rect', 'polygon', 'clear'] }
      }
    },
    xAxis: {
      type: 'value',
      name: '能量 (Energy)',
      nameTextStyle: { color: '#666666' },
      scale: true,
      splitLine: { show: true, lineStyle: { color: '#EEEEEE' } },
      axisLabel: { color: '#666666' }
    },
    yAxis: {
      type: 'value',
      name: '愉悦度 (Valence)',
      nameTextStyle: { color: '#666666' },
      scale: true,
      splitLine: { show: true, lineStyle: { color: '#EEEEEE' } },
      axisLabel: { color: '#666666' }
    },
    dataZoom: [
      { type: 'inside' },
      { 
        type: 'slider', 
        showDataShadow: false, 
        borderColor: 'transparent',
        backgroundColor: '#F4F6F8',
        fillerColor: 'rgba(168, 216, 185, 0.3)',
        handleStyle: { color: '#A8D8B9' },
        textStyle: { color: '#666666' }
      }
    ],
    series: [
      {
        type: 'scatter',
        symbolSize: 6,
        data: data,
        itemStyle: {
          color: function (param) {
            const hex = clusterColors[param.data[5] % clusterColors.length];
            let alpha = 0.8;
            if (selectedSong) {
              alpha = param.data[5] === selectedSong[5] ? 0.85 : 0.05;
            }
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          }
        },
        large: false,
        largeThreshold: 10000 // 强制阻止 ECharts 进入大批量同色渲染模式
      },
      // 选中的特定歌曲高亮特效点
      {
        type: 'effectScatter',
        symbolSize: 16,
        data: selectedSong ? [selectedSong] : [],
        itemStyle: {
          color: '#FF5E7E',
          borderColor: '#FFFFFF',
          borderWidth: 2,
          shadowColor: 'rgba(255, 94, 126, 0.5)',
          shadowBlur: 10
        },
        rippleEffect: { brushType: 'stroke', scale: 3.5 },
        zlevel: 1
      }
    ]
  };

  useEffect(() => {
    if (chartRef.current) {
      const echartInstance = chartRef.current.getEchartsInstance();
      echartInstance.on('brushSelected', function (params) {
        const brushComponent = params.batch[0];
        if (!brushComponent || brushComponent.areas.length === 0) {
          onBrush([]);
          return;
        }
        
        let selectedIndices = [];
        for (let i = 0; i < brushComponent.selected.length; i++) {
          let dataIndices = brushComponent.selected[i].dataIndex;
          selectedIndices = selectedIndices.concat(dataIndices);
        }
        onBrush(selectedIndices);
      });
    }
  }, [onBrush]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 聚类颜色图例 Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '16px', 
        flexWrap: 'wrap',
        padding: '0 10px 10px 10px',
        borderBottom: '1px solid #EEEEEE'
      }}>
        {legendItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: item.color,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}></span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666666' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="chart-container" style={{ flexGrow: 1, position: 'relative' }}>
        <ReactECharts 
          ref={chartRef}
          option={options} 
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }} 
        />
      </div>
    </div>
  );
};

export default ScatterBrushChart;
