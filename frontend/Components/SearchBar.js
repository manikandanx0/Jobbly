export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="w-full">
      <div className="flex items-center bg-white rounded-full shadow-subtle px-4 py-2 gap-2">
        <span>🔎</span>
        <input
          value={value} onChange={(e)=>onChange?.(e.target.value)}
          placeholder={placeholder || 'Search internships...'}
          className="w-full outline-none text-body"
        />
      </div>
    </div>
  );
}
