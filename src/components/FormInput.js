export default function FormInput({
  label,
  name,
  type,
  placeholder,
  onChange,
  error,
  autoFocus,
  className,
  icon
}) {
  return (
    <div className="flex flex-col w-full">
      {label && <label className="font-semibold my-4">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          autoFocus={autoFocus}
          className={`
            px-4 py-1 border-transparent border-[2px] outline-none rounded-lg focus:border-[#089bab]
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          name={name}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
