import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

type PriceHistory = {
  price: number;
  date: string;
  timestamp: number;
};

type PriceChartProps = {
  history: PriceHistory[];
};

function PriceChart({
  history,
}: PriceChartProps) {
  const sortedHistory = [...history].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  if (sortedHistory.length === 0) {
    return (
      <div className="chart-empty">
        No price history available
      </div>
    );
  }

  const data = {
    labels: sortedHistory.map((item) =>
      new Date(
        item.timestamp
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    ),

    datasets: [
      {
        label: "Price",

        data: sortedHistory.map(
          (item) => item.price
        ),

        tension: 0.35,

        borderWidth: 3,

        pointRadius: 4,

        pointHoverRadius: 7,

        fill: true,

        backgroundColor:
          "rgba(59, 130, 246, 0.08)",

        borderColor: "#3b82f6",

        pointBackgroundColor:
          "#3b82f6",

        pointBorderColor:
          "#151820",

        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      intersect: false,

      mode: "index" as const,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#11151d",

        titleColor: "#ffffff",

        bodyColor: "#d1d5db",

        borderColor: "#303744",

        borderWidth: 1,

        padding: 12,

        displayColors: false,

        callbacks: {
          label: (context: any) => {
            return `Price: ₹${Number(
              context.raw
            ).toLocaleString("en-IN")}`;
          },
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#737b8c",

          maxRotation: 0,

          minRotation: 0,

          autoSkip: true,

          maxTicksLimit: 6,

          font: {
            size: 10,
          },
        },

        grid: {
          display: false,
        },

        border: {
          display: false,
        },
      },

      y: {
        beginAtZero: false,

        ticks: {
          color: "#737b8c",

          maxTicksLimit: 5,

          font: {
            size: 10,
          },

          callback: (
            value: string | number
          ) => {
            return `₹${Number(
              value
            ).toLocaleString("en-IN")}`;
          },
        },

        grid: {
          color:
            "rgba(255, 255, 255, 0.05)",
        },

        border: {
          display: false,
        },
      },
    },
  };

  return (
    <Line
      data={data}
      options={options}
    />
  );
}

export default PriceChart;