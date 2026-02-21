import React from 'react';
import { ArrowUpRight, ArrowDownRight, Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';

const MetricCard = ({ title, value, trend, trendUp, icon: Icon, color }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon className={`w-24 h-24 text-${color}-600 transform translate-x-4 -translate-y-4`} />
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors z-10 relative">
            <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>

        <div className="mt-6 flex items-end justify-between relative z-10">
            <div>
                <h4 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                    {value}
                </h4>
                <span className="text-sm font-medium text-slate-500">{title}</span>
            </div>

            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend}
                {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            </span>
        </div>
    </div>
);

const DashboardMetrics = () => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6 2xl:gap-7.5">
            <MetricCard
                title="Total Views"
                value="$3.456K"
                trend="0.43%"
                trendUp={true}
                icon={Users}
                color="blue"
            />
            <MetricCard
                title="Total Profit"
                value="$45.2K"
                trend="4.35%"
                trendUp={true}
                icon={ShoppingCart}
                color="blue"
            />
            <MetricCard
                title="Total Product"
                value="2.450"
                trend="2.59%"
                trendUp={true}
                icon={Activity}
                color="blue"
            />
            <MetricCard
                title="Total Users"
                value="3.456"
                trend="0.95%"
                trendUp={false}
                icon={DollarSign}
                color="blue"
            />
        </div>
    );
};

export default DashboardMetrics;
