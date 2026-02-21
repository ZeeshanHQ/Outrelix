import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MonthlySalesChart = () => {
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
                    color: '#64748B' // slate-500
                }
            },
            title: {
                display: false,
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
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#94A3B8', // slate-400
                    font: {
                        family: "'Outfit', sans-serif",
                    }
                },
                border: { display: false }
            },
            y: {
                grid: {
                    color: '#F1F5F9', // slate-100
                    drawBorder: false,
                },
                ticks: {
                    display: false
                },
                border: { display: false }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        elements: {
            bar: {
                borderRadius: 4,
                borderSkipped: false
            }
        }
    };

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = {
        labels,
        datasets: [
            {
                label: 'Sales',
                data: [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
                backgroundColor: '#3C50E0',
                barThickness: 10
            },
            {
                label: 'Revenue',
                data: [100, 200, 150, 220, 140, 150, 210, 80, 160, 290, 210, 80],
                backgroundColor: '#80CAEE',
                barThickness: 10
            },
        ],
    };

    return (
        <div className="col-span-12 rounded-sm border border-slate-200 bg-white px-5 pt-7.5 pb-5 shadow-sm dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
                <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                        Monthly Sales
                    </h4>
                </div>
            </div>

            <div className="mb-2">
                <div id="chartOne" className="-ml-5 h-[355px] w-[105%]">
                    <Bar options={options} data={data} />
                </div>
            </div>
        </div>
    );
};

export default MonthlySalesChart;
