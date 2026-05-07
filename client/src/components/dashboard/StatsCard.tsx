import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  change?: string;
  index?: number;
}

const StatsCard = ({ title, value, icon: Icon, color, bgColor, change, index = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card p-5 hover:border-slate-600/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        {change && (
          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            <TrendingUp size={10} />
            {change}
          </span>
        )}
      </div>
      <div>
        <motion.p
          className="text-3xl font-bold text-white mb-1"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: index * 0.1 + 0.1 }}
        >
          {value}
        </motion.p>
        <p className="text-slate-400 text-sm">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
