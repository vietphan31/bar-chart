import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ScriptableScaleContext,
  Plugin,
  TooltipModel,
} from "chart.js";
import { ChartOptions } from "chart.js/auto";
import { CSSProperties } from "react";
import { ReactNode, useState } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TooltipStyle {
  opacity: number;
  title: string;
  positionX: number;
  positionY: number;
  position: "first" | "mid" | "last";
}

interface TooltipTProps extends TooltipStyle {
  children?: ReactNode;
  className?: string;
}

const TooltipT = ({
  opacity,
  title,
  positionX = 0,
  positionY = 0,
  position = "mid",
  children,
  className,
}: TooltipTProps) => {
  let style: CSSProperties = {};
  switch (position) {
    case "first":
      style = {
        left: 0,
      };
      break;
    case "mid":
      style = {
        left: positionX,
      };
      break;
    case "last":
      style = {
        right: 0,
      };
      break;
  }

  return (
    <div
      className={`w-fit h-fit bg-white absolute transition-opacity -translate-y-1/2 border border-solid border-gray-400 rounded-2xl shadow-md overflow-hidden pointer-events-none ${
        position === "mid" ? "-translate-x-1/2" : ""
      } ${className}`}
      style={{
        top: "50%",
        opacity,
        ...style,
      }}
    >
      <div className="bg-yellow-400 font-bold p-2">{title}</div>
      <div className="p-2">{children}</div>
    </div>
  );
};

interface BarChartProps {
  data: ChartData<"bar">;
  tooltipBody?: (title: string) => JSX.Element;
  topLabel?: boolean;
  topLabelCallback?: (
    label: string,
    labelDataset: string,
    value: number
  ) => number | string;
  className?: string;
  tooltipClass?: string;
}

const BarChart = ({
  data,
  tooltipBody,
  topLabel = false,
  topLabelCallback,
  className,
  tooltipClass,
}: BarChartProps) => {
  const [tooltipStyle, setTooltipStyle] = useState<TooltipStyle>({
    title: "",
    opacity: 0,
    positionX: 0,
    positionY: 0,
    position: "mid",
  });

  const externalTooltip = (context: {
    chart: ChartJS<"bar">;
    tooltip: TooltipModel<"bar">;
  }) => {
    const { chart, tooltip } = context;
    if (
      tooltip.opacity === tooltipStyle.opacity &&
      tooltip.title[0] === tooltipStyle.title
    )
      return;

    tooltipStyle.opacity = tooltip.opacity;
    tooltipStyle.title = tooltip.title[0];
    if (data.labels) {
      const tooltipIndex = data.labels.findIndex(
        (l) => l === tooltipStyle.title
      );
      if (tooltipIndex === 0) {
        tooltipStyle.position = "first";
      } else if (tooltipIndex === data.labels.length - 1) {
        tooltipStyle.position = "last";
      } else tooltipStyle.position = "mid";
    }
    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    tooltipStyle.positionX = Math.round(positionX + tooltip.caretX);
    tooltipStyle.positionY = Math.round(positionY + tooltip.caretY);
    setTooltipStyle({ ...tooltipStyle });

    return;
  };

  const options: ChartOptions<"bar"> = {
    plugins: {
      title: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: tooltipBody
        ? {
            enabled: false,
            external: externalTooltip,
          }
        : {},
    },
    layout: {
      padding: 20,
    },
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        border: {
          dash: [4],
        },
        stacked: true,
        ticks: {
          font: {
            weight: "bold",
            size: 18,
          },
          color: "#0B2447",
          padding: 20,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: (context: ScriptableScaleContext) => {
            const zeroLine = context.tick.value;
            return zeroLine === 0 ? "#000" : "#ccc";
          },
          drawTicks: true,
        },
        bounds: "data",
        ticks: {
          callback(tickValue) {
            return `${Number(tickValue) / 1000}${tickValue !== 0 ? "k" : ""}`;
          },
        },
      },
    },
  };

  const topLabelsPlugin: Plugin<"bar"> = {
    id: "topLabelsPlugin",
    afterDatasetDraw(chart: ChartJS) {
      const {
        ctx,
        scales: { x },
        data,
      } = chart;
      ctx.textAlign = "left";
      ctx.font = "bold 16px";
      ctx.fillStyle = "#000";

      data.datasets.forEach((dataset, dI) => {
        const pad = dI === 0 ? 80 : -10;
        dataset.data.forEach((v, i) => {
          const value = Number(v);
          const barElement: any = chart.getDatasetMeta(dI).data[i];
          let yPosition = barElement.y - 5;
          if (value < 0) yPosition = yPosition - barElement.height;

          let label = value.toString();

          if (topLabelCallback && dataset.label && data.labels) {
            label = topLabelCallback(
              data.labels[i] as string,
              dataset.label,
              value
            ).toString();
          }

          ctx.fillText(
            label || "",
            x.getPixelForValue(i) - pad,
            yPosition,
            80
          );
        });
      });
    },
  };

  const plugins: Plugin<"bar">[] = [];
  if (topLabel) plugins.push(topLabelsPlugin);

  return (
    <div
      className={`max-w-full min-w-[500px] min-h-fit relative mx-auto ${className}`}
    >
      <Bar options={options} data={data} plugins={[topLabelsPlugin]} />
      {tooltipBody && (
        <TooltipT className={tooltipClass} {...tooltipStyle}>
          {tooltipBody(tooltipStyle.title)}
        </TooltipT>
      )}
    </div>
  );
};

export default BarChart;
