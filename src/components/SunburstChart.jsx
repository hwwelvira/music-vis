import React from 'react';
import ReactECharts from 'echarts-for-react';

const SunburstChart = ({ data, onNodeClick, onNodeHover }) => {
  const options = {
    color: ['#A8D8B9', '#B4A6CD', '#A2CBE6', '#F1A5B4', '#DDE29F', '#F3D291', '#E7AB87'],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#A8D8B9',
      textStyle: {
        color: '#333333',
        fontFamily: '"Outfit", "Inter", sans-serif'
      }
    },
    series: {
      type: 'sunburst',
      data: data,
      sort: null,
      radius: ['10%', '90%'],
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
        fontSize: 12,
        fontFamily: '"Outfit", "Inter", sans-serif',
        minAngle: 12, 
        lineHeight: 16
      },
      levels: [
        {},
        {
          r0: '10%',
          r: '40%',
          itemStyle: { borderWidth: 2 },
          label: {
            rotate: 'tangential',
            fontSize: 11,
            fontWeight: 'bold'
          }
        },
        {
          r0: '40%',
          r: '85%',
          label: {
            position: 'inside',
            fontSize: 9,
            minAngle: 4
          },
          itemStyle: {
            borderWidth: 1
          }
        }
      ]
    }
  };

  const onEvents = {
    click: (params) => {
      if (params.data && params.data.features) {
        onNodeClick(params.data);
      }
    },
    mouseover: (params) => {
      if (params.data && params.data.features) {
        onNodeHover(params.data);
      }
    }
  };

  return (
    <div className="chart-container">
      <ReactECharts 
        option={options} 
        style={{ height: '100%', width: '100%' }} 
        onEvents={onEvents}
      />
    </div>
  );
};

export default SunburstChart;
