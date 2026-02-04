
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { JobApplication } from '../types';

interface ActivityGraphProps {
  jobs: JobApplication[];
  days?: number;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ jobs, days = 7 }) => {
  const data = React.useMemo(() => {
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const count = jobs.filter(j => j.dateApplied === dateStr).length;
      
      result.push({
        date: d.toLocaleDateString(undefined, { weekday: days <= 7 ? 'short' : undefined, day: 'numeric', month: 'short' }),
        fullDate: dateStr,
        count: count
      });
    }
    return result;
  }, [jobs, days]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={days > 7 ? 15 : 30}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#6366f1' : '#e2e8f0'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityGraph;
