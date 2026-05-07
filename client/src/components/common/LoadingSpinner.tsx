import { motion } from 'framer-motion';


const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-indigo-600/20 border-t-indigo-600"
      />
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="card p-5 space-y-3 animate-pulse">
    <div className="skeleton h-4 w-3/4 rounded" />
    <div className="skeleton h-3 w-1/2 rounded" />
    <div className="skeleton h-8 w-full rounded" />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-3 animate-pulse">
    <div className="skeleton w-8 h-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-3 w-2/3 rounded" />
      <div className="skeleton h-2 w-1/3 rounded" />
    </div>
  </div>
);

export default LoadingSpinner;
