import BarChart from "./components/BarChart/BarChart";
import { ChartData } from "chart.js";

function App() {
  const labels = ["Savings", "Expresses", "Recuring"];

  const data: ChartData<"bar"> = {
    labels: labels,
    datasets: [
      {
        label: "Dataset 1",
        data: [2500, -4000, -5000],
        backgroundColor: ["#D4FAFC", "#D4FAFC", "#D4FAFC"],
        stack: "Stack 0",
        categoryPercentage: 0.5,
        barPercentage: 1,
      },
      {
        label: "Dataset 2",
        data: [2700, -3500, -4500],
        backgroundColor: ["#5D9C59", "#3C486B", "#3C486B"],
        stack: "Stack 1",
        categoryPercentage: 0.5,
        barPercentage: 1,
      },
    ],
  };

  return (
    <div className="w-full h-full pt-40">
      <div className="w-[1000px] mx-auto max-w-full">
        <BarChart
          data={data}
          topLabel
          className="w-[800px]"
          tooltipClass=""
          tooltipBody={(title) => (
            <div className="w-[300px] h-fit">
              <p>Great! Your customer save 25% of his monthly income</p>
              <div className="flex border-dashed border border-gray-400 rounded-xl p-2 mt-2">
                <div className="flex flex-col flex-grow items-center border-dashed border-r border-gray-400">
                  <b>24%</b>
                  <span>Customer save</span>
                  <span>$2.500</span>
                </div>
                <div className="flex flex-col flex-grow items-center text-green-600">
                  <b>24%</b>
                  <span>Healthy Range</span>
                  <span>$2.500</span>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default App;
