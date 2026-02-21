import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const MonthlyTargetChart = () => {
    const data = {
        labels: ['Completed', 'Remaining'],
        datasets: [
            {
                data: [75, 25],
                backgroundColor: ['#3C50E0', '#F1F5F9'], // Blue & Slate-100
                borderWidth: 0,
                cutout: '80%',
            },
        ],
    };

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }, // Disable tooltip for cleaner look
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div className="col-span-12 rounded-sm border border-slate-200 bg-white px-5 pt-7.5 pb-5 shadow-sm dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
            <div className="mb-3 justify-between gap-4 sm:flex">
                <div>
                    <h5 className="text-xl font-bold text-slate-800 dark:text-white">
                        Monthly Target
                    </h5>
                </div>
            </div>

            <div className="mb-2">
                <div id="chartThree" className="mx-auto flex justify-center">
                    <div className="relative h-64 w-64">
                        <Doughnut data={data} options={options} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-bold text-slate-800">75%</span>
                            <span className="text-sm font-medium text-slate-400">Achieved</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mx-auto mt-4 max-w-[380px] text-center text-sm font-medium text-slate-500">
                You earn $3,287 today, it's higher than last month. Keep up your good work!
            </p>

            <div className="bg-slate-50 mt-6 rounded-lg p-4 grid grid-cols-2 gap-4 border border-slate-100">
                <div className="text-center">
                    <span className="block text-xs font-semibold uppercase text-slate-400 mb-1">Target</span>
                    <span className="block text-xl font-bold text-slate-800">$20K</span>
                </div>
                <div className="text-center border-l border-slate-200">
                    <span className="block text-xs font-semibold uppercase text-slate-400 mb-1">Revenue</span>
                    <span className="block text-xl font-bold text-emerald-500">$16K</span>
                </div>
            </div>
        </div>
    );
};

export default MonthlyTargetChart;
