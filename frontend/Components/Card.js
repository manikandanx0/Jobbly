export default function Card({ className = '', variant = 'default', children }){
  const variantClass = variant === 'glass'
    ? 'backdrop-blur-md bg-white/70 border border-white/60 shadow-md'
    : 'bg-white border border-gray-200 shadow-subtle';
  return <div className={`rounded-xl p-6 transition hover:shadow-lg ${variantClass} ${className}`}>{children}</div>;
}




