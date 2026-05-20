import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

const PCAScatterChart = ({ data, onBrush, selectedSong }) => {
  const chartRef = useRef(null);

  // The cluster colors for a modern premium look
  const clusterColors = ['#A8D8B9', '#B4A6CD', '#A2CBE6', '#F1A5B4', '#DDE29F'];

  // Find the PCA equivalent of the selected song since selectedSong has Energy/Valence coordinates
  const selectedPcaSong = React.useMemo(() => {
    if (!selectedSong || !data) return null;
    return data.find(p => p[2] === selectedSong[2] && p[3] === selectedSong[3]);
  }, [selectedSong, data]);

  const options = {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: function (param) {
        return `
          <div style="font-weight: 600;">${param.data[2]}</div>
          <div style="color:#666666; font-size:12px;">${param.data[3]}</div>
          <div style="margin-top: 5px; font-size: 12px; color:#333;">
            PC1 (主成分1): ${param.data[0]}<br/>
            PC2 (主成分2): ${param.data[1]}<br/>
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
      name: '主要物理声学混合成分 1 (PC1)',
      nameTextStyle: { color: '#666666', fontWeight: 'bold' },
      scale: true,
      splitLine: { show: true, lineStyle: { color: '#EEEEEE' } },
      axisLabel: { color: '#666666' }
    },
    yAxis: {
      type: 'value',
      name: '次要物理声学混合成分 2 (PC2)',
      nameTextStyle: { color: '#666666', fontWeight: 'bold' },
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
            if (selectedPcaSong) {
              alpha = param.data[5] === selectedPcaSong[5] ? 0.85 : 0.05;
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
        data: selectedPcaSong ? [selectedPcaSong] : [],
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
           if (onBrush) onBrush([]);
          return;
        }
        
        let selectedIndices = [];
        for (let i = 0; i < brushComponent.selected.length; i++) {
          let dataIndices = brushComponent.selected[i].dataIndex;
          selectedIndices = selectedIndices.concat(dataIndices);
        }
        if (onBrush) onBrush(selectedIndices);
      });
    }
  }, [onBrush]);

  return (
    <div className="chart-container">
      {data && data.length > 0 ? (
        <ReactECharts 
          ref={chartRef}
          option={options} 
          style={{ height: '100%', width: '100%' }} 
        />
      ) : null}
    </div>
  );
};

export default PCAScatterChart;
