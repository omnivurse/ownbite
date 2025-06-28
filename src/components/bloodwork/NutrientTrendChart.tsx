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
import Card, { CardBody } from '../ui/Card';
import { TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import PremiumFeatureGate from '../subscription/PremiumFeatureGate';

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

interface NutrientTrendData {
  date: string;
  value: number;
  status: string;
}

interface NutrientTrendChartProps {
  nutrientName: string;
  unit: string;
  data: NutrientTrendData[];
  optimalRange: {
    min: number;
    max: number;
  };
  className?: string;
}

const NutrientTrendChart: React.FC<NutrientTrendChartProps> = ({
  nutrientName,
  unit,
  data,
  optimalRange,
  className = ''
}) => {
  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: `${nutrientName} (${unit})`,
        data: data.map(d => d.value),
        borderColor: 'rgb(74, 101, 65)',
        backgroundColor: 'rgba(74, 101, 65, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: data.map(d => {
          if (d.status === 'optimal') return 'rgb(34, 197, 94)';
          if (d.status === 'low' || d.status === 'high') return 'rgb(251, 191, 36)';
          return 'rgb(239, 68, 68)';
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Optimal Range',
        data: data.map(() => optimalRange.max),
        borderColor: 'rgba(34, 197, 94, 0.5)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: '+1',
        pointRadius: 0,
        borderDash: [5, 5],
      },
      {
        label: 'Optimal Min',
        data: data.map(() => optimalRange.min),
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
          filter: (legendItem: any) => legendItem.text !== 'Optimal Min',
          usePointStyle: true,
          boxWidth: 6
        }
      },
      title: {
        display: false,
        text: `${nutrientName} Trend Over Time`
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const status = data[dataIndex]?.status;
            return `Status: ${status?.charAt(0).toUpperCase() + status?.slice(1)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: `${nutrientName} (${unit})`
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

  const latestValue = data[data.length - 1];
  const previousValue = data[data.length - 2];
  const trend = latestValue && previousValue ? latestValue.value - previousValue.value : 0;
  
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'low':
      case 'high': return <TrendingUp className={`h-5 w-5 text-yellow-500 ${status === 'low' ? 'rotate-180' : ''}`} />;
      case 'very_low':
      case 'very_high': return <TrendingDown className={`h-5 w-5 text-red-500 ${status === 'very_high' ? 'rotate-180' : ''}`} />;
      default: return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div className={className}>
      <div className="h-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default NutrientTrendChart;