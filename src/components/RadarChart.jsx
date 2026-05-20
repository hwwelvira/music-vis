import React from 'react';
import ReactECharts from 'echarts-for-react';

const RadarChart = ({ features, indicatorNames, featureMaxes }) => {
  const i18n = {
    danceability: '可舞度',
    energy: '能量',
    acousticness: '声学度',
    valence: '愉悦度',
    liveness: '现场感',
    instrumentalness: '器乐度',
    speechiness: '言语度'
  };

  if (!features) return <div className="chart-container" style={{color: '#b3b3b3'}}>请在旭日图中选择一个音乐流派</div>;

  const dataValues = indicatorNames.map(key => features[key]);

  const options = {
    color: ['#A8D8B9'],
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#A8D8B9',
      textStyle: { color: '#333333' }
    },
    radar: {
      indicator: indicatorNames.map(name => ({
        name: i18n[name] || name,
        max: featureMaxes && featureMaxes[name] ? featureMaxes[name] * 1.05 : 1
      })),
      splitNumber: 4,
      axisName: {
        color: '#666666',
        fontWeight: 'bold',
        borderRadius: 3,
        padding: [3, 5]
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(250, 250, 250, 0.3)', 'rgba(240, 240, 240, 0.5)', 'rgba(230, 230, 230, 0.8)', 'rgba(168, 216, 185, 0.2)']
        }
      },
      axisLine: {
        lineStyle: { color: '#EEEEEE' }
      },
      splitLine: {
        lineStyle: { color: '#EEEEEE' }
      }
    },
    series: [
      {
        name: '流派特征 (Genre Features)',
        type: 'radar',
        data: [
          {
            value: dataValues,
            name: '平均特征值 (Average Features)',
            areaStyle: {
              color: 'rgba(168, 216, 185, 0.5)'
            },
            lineStyle: {
              width: 2,
              color: '#A8D8B9'
            },
            itemStyle: {
              color: '#88B04B'
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="chart-container">
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default RadarChart;
