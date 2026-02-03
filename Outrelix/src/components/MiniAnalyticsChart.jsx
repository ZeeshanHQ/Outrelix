import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MiniAnalyticsChart = ({ data }) => (
  <div className="w-full h-20">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" hide />
        <YAxis hide domain={[0, 100]} />
        <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default MiniAnalyticsChart; 