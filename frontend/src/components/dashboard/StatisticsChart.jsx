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
    Filler,
} from 'chart.js';

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

const StatisticsChart = () => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: {
                        family: "'Outfit', sans-serif",
                        size: 12
                    },
                    color: '#64748B'
                }
            },
            tooltip: {
                backgroundColor: '#FFFFFF',
                titleColor: '#1E293B',
                bodyColor: '#64748B',
                borderColor: '#E2E8F0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                intersect: false,
                mode: 'nearest',
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#94A3B8',
                    font: { family: "'Outfit', sans-serif" }
                },
                border: { display: false }
            },
            y: {
                grid: {
                    color: '#F1F5F9',
                    drawBorder: false,
                },
                ticks: {
                    display: true, // Keep Y axis ticks for stats
                    stepSize: 50,
                    color: '#94A3B8',
                },
                border: { display: false },
                min: 0,
                max: 400
            }
        },
        elements: {
            line: {
                tension: 0.4 // Smooth curve
            },
            point: {
                radius: 0,
                hoverRadius: 6,
                backgroundColor: '#3C50E0'
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Visitors',
                data: [150, 180, 170, 220, 200, 250, 210, 280, 250, 310, 290, 350],
                borderColor: '#3C50E0',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(60, 80, 224, 0.2)');
                    gradient.addColorStop(1, 'rgba(60, 80, 224, 0)');
                    return gradient;
                },
                borderWidth: 2,
            },
            {
                fill: true,
                label: 'Sessions',
                data: [100, 140, 130, 170, 160, 200, 170, 220, 200, 250, 230, 280], // Lower data
                borderColor: '#80CAEE',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(128, 202, 238, 0.2)');
                    gradient.addColorStop(1, 'rgba(128, 202, 238, 0)');
                    return gradient;
                },
                borderWidth: 2,
            }
        ],
    };

    return (
        <div className="col-span-12 rounded-sm border border-slate-200 bg-white px-5 pt-7.5 pb-5 shadow-sm dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-12">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap mb-6">
                <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                        Statistics
                    </h4>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-600">Day</span>
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-600">Week</span>
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-600 text-white shadow-md shadow-blue-200">Month</span>
                    </div>
                </div>
            </div>

            <div className="mb-2">
                <div id="chartTwo" className="-ml-5 h-[350px] w-[105%]">
                    <Line options={options} data={data} />
                </div>
            </div>
        </div>
    );
};

export default StatisticsChart;
