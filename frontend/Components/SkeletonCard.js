export default function SkeletonCard(){
  return (
    <div className="rounded-xl p-5 border border-white/50 bg-white/65 backdrop-blur-md shadow-[0_8px_24px_rgba(108,0,255,0.08)] animate-pulse">
      <div className="h-5 w-1/3 bg-white/70 rounded mb-2" />
      <div className="h-4 w-1/2 bg-white/70 rounded mb-4" />
      <div className="h-3 w-full bg-white/70 rounded mb-2" />
      <div className="h-3 w-5/6 bg-white/70 rounded" />
    </div>
  );
}




