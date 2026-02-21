import React from 'react';
import { Mail, ArrowUpRight, CheckCircle } from 'lucide-react';

const NeuralFeed = () => {
    const leads = [
        {
            company: 'TechFlow Solutions',
            role: 'CTO',
            intent: 'High',
            match: '98%',
            status: 'Ready',
            time: '2m ago'
        },
        {
            company: 'Global Innovations',
            role: 'VP Sales',
            intent: 'Medium',
            match: '85%',
            status: 'Warm',
            time: '15m ago'
        },
        {
            company: 'Nexus Corp',
            role: 'Founder',
            intent: 'High',
            match: '92%',
            status: 'Ready',
            time: '1h ago'
        },
        {
            company: 'Starlight Ventures',
            role: 'Marketing Dir',
            intent: 'Low',
            match: '65%',
            status: 'Cold',
            time: '3h ago'
        }
    ];

    return (
        <div className="col-span-12 rounded-sm border border-slate-200 bg-white px-5 pt-6 pb-2.5 shadow-sm dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-bold text-slate-800 dark:text-white">
                Live Neural Feed
            </h4>

            <div className="flex flex-col">
                <div className="grid grid-cols-3 rounded-sm bg-slate-50 dark:bg-meta-4 sm:grid-cols-5">
                    <div className="p-2.5 xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base text-slate-500">Company</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base text-slate-500">Role</h5>
                    </div>
                    <div className="p-2.5 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base text-slate-500">Match</h5>
                    </div>
                    <div className="hidden p-2.5 text-center sm:block xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base text-slate-500">Status</h5>
                    </div>
                    <div className="hidden p-2.5 text-center sm:block xl:p-5">
                        <h5 className="text-sm font-medium uppercase xsm:text-base text-slate-500">Action</h5>
                    </div>
                </div>

                {leads.map((lead, key) => (
                    <div
                        className={`grid grid-cols-3 sm:grid-cols-5 ${key === leads.length - 1 ? '' : 'border-b border-slate-100 dark:border-strokedark'
                            }`}
                        key={key}
                    >
                        <div className="flex items-center gap-3 p-2.5 xl:p-5">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {lead.company[0]}
                                </div>
                            </div>
                            <p className="hidden text-black dark:text-white sm:block font-medium">{lead.company}</p>
                        </div>

                        <div className="flex items-center justify-center p-2.5 xl:p-5">
                            <p className="text-slate-600 dark:text-white">{lead.role}</p>
                        </div>

                        <div className="flex items-center justify-center p-2.5 xl:p-5">
                            <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${lead.match > '90%' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {lead.match}
                            </span>
                        </div>

                        <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                            <p className="text-slate-600 dark:text-white">{lead.status}</p>
                        </div>

                        <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                            <button className="hover:text-blue-600 transition-colors">
                                <Mail className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NeuralFeed;
