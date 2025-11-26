import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Briefcase } from 'lucide-react';
import { IVisitingCardClient } from '../utils/constants';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

interface Props {
  uniqueDesignations: string[];
  cards: IVisitingCardClient[];
}

const DesignationPieChart: React.FC<Props> = ({ uniqueDesignations, cards }) => {
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach(c => counts[c.designation] = (counts[c.designation] || 0) + 1);
    
    return uniqueDesignations
      .map(d => ({ name: d, value: counts[d] || 0 }))
      .filter(d => d.value > 0);
  }, [uniqueDesignations, cards]);

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center border-b pb-2">
        <Briefcase className="w-5 h-5 mr-2 text-blue-600" /> Designation Distribution
      </h3>
      {pieData.length > 0 ? (
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center text-slate-400 py-10">No Data Available</div>
      )}
    </div>
  );
};

export default DesignationPieChart;