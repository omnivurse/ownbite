import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BloodworkTrendChartProps {
  biomarker: string;
  data: Array<{
    date: string;
    value: number;
    status?: string;
  }>;
  unit: string;
  optimalRange: {
    min: number;
    max: number;
  };
  className?: string;
}

const BloodworkTrendChart: React.FC<BloodworkTrendChartProps> = ({
  biomarker,
  data,
  unit,
  optimalRange,
  className = ''
}) => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate trend
  const trend = sortedData.length >= 2 
    ? sortedData[sortedData.length - 1].value > sortedData[0].value 
      ? 'increasing' 
      : 'decreasing'
    : 'stable';
  
  // Calculate percent change
  const percentChange = sortedData.length >= 2
    ? ((sortedData[sortedData.length - 1].value - sortedData[0].value) / sortedData[0].value) * 100
    : 0;

  const chartData = {
    labels: sortedData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: `${biomarker} (${unit})`,
        data: sortedData.map(d => d.value),
        borderColor: 'rgb(74, 101, 65)',
        backgroundColor: 'rgba(74, 101, 65, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: sortedData.map(d => {
          if (!d.status) return 'rgb(74, 101, 65)';
          if (d.status === 'optimal') return 'rgb(34, 197, 94)';
          if (d.status === 'low' || d.status === 'high') return 'rgb(251, 191, 36)';
          return 'rgb(239, 68, 68)';
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Optimal Range Max',
        data: sortedData.map(() => optimalRange.max),
        borderColor: 'rgba(34, 197, 94, 0.5)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: '+1',
        pointRadius: 0,
        borderDash: [5, 5],
      },
      {
        label: 'Optimal Range Min',
        data: sortedData.map(() => optimalRange.min),
        borderColor: 'rgba(34, 197, 94, 0.5)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        pointRadius: 0,
        borderDash: [5, 5],
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          filter: (legendItem: any) => legendItem.text !== 'Optimal Range Min',
          usePointStyle: true,
          boxWidth: 6
        }
      },
      title: {
        display: false,
        text: `${biomarker} Trend Over Time`
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const status = sortedData[dataIndex]?.status;
            if (status) {
              return `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: `${biomarker} (${unit})`
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        hoverRadius: 8,
        hoverBorderWidth: 2
      }
    }
  };

  const getStatusIcon = () => {
    const latestStatus = sortedData[sortedData.length - 1]?.status;
    
    if (!latestStatus) return <CheckCircle className="h-5 w-5 text-neutral-500" />;
    
    switch (latestStatus) {
      case 'optimal': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'low':
      case 'high': return <TrendingUp className={`h-5 w-5 text-yellow-500 ${latestStatus === 'low' ? 'rotate-180' : ''}`} />;
      case 'very_low':
      case 'very_high': return <TrendingDown className={`h-5 w-5 text-red-500 ${latestStatus === 'very_high' ? 'rotate-180' : ''}`} />;
      default: return <CheckCircle className="h-5 w-5 text-neutral-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold ml-2">
              {biomarker}
            </h3>
          </div>
          {Math.abs(percentChange) > 1 && (
            <div className={`flex items-center text-sm ${
              trend === 'increasing' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'increasing' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </div>
          )}
        </div>
        
        <div className="h-64 mb-4">
          <Line data={chartData} options={options} />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-medium text-neutral-900">Current</div>
            <div className={`text-lg font-bold ${
              sortedData[sortedData.length - 1]?.status === 'optimal' ? 'text-green-600' :
              sortedData[sortedData.length - 1]?.status === 'low' || sortedData[sortedData.length - 1]?.status === 'high' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {sortedData[sortedData.length - 1]?.value.toFixed(1)} {unit}
            </div>
          </div>
          <div>
            <div className="font-medium text-neutral-900">Optimal Range</div>
            <div className="text-green-600 font-medium">
              {optimalRange.min} - {optimalRange.max} {unit}
            </div>
          </div>
          <div>
            <div className="font-medium text-neutral-900">Trend</div>
            <div className={`font-medium ${
              trend === 'increasing' ? 'text-green-600' : trend === 'decreasing' ? 'text-red-600' : 'text-neutral-600'
            }`}>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default BloodworkTrendChart;