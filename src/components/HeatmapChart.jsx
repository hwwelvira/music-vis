import React from 'react';
import ReactECharts from 'echarts-for-react';

const HeatmapChart = ({ corrData, features }) => {
  // Format feature names
  const i18n = {
    danceability: '可舞度',
    energy: '能量',
    loudness: '响度',
    speechiness: '言语度',
    acousticness: '声学度',
    instrumentalness: '器乐度',
    liveness: '现场感',
    valence: '愉悦度',
    tempo: '节奏(BPM)'
  };
  const formattedFeatures = features.map(f => i18n[f] || (f.charAt(0).toUpperCase() + f.slice(1)));

  const options = {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#EEEEEE',
      textStyle: { color: '#333333' },
      formatter: function (params) {
        return `
          ${formattedFeatures[params.data[0]]} & ${formattedFeatures[params.data[1]]}<br/>
          相关系数 (Correlation): <span style="color:#A8D8B9; font-weight:bold;">${params.data[2]}</span>
        `;
      }
    },
    grid: {
      height: '70%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: formattedFeatures,
      splitArea: { show: true },
      axisLabel: { 
        color: '#666666',
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'category',
      data: formattedFeatures,
      splitArea: { show: true },
      axisLabel: { color: '#666666' }
    },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: { color: '#666666' },
      inRange: {
        color: ['#F4F6F8', '#A2CBE6', '#F1A5B4']
      }
    },
    series: [{
      name: '皮尔逊相关系数',
      type: 'heatmap',
      data: corrData,
      label: {
        show: true,
        color: '#333333',
        fontSize: 10
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div className="chart-container" style={{ height: '500px' }}>
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default HeatmapChart;
