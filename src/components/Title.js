export default function Title({ label, className }) {
  return(
    <div className={`text-[32px] font-semibold border-b-[2px] border-[#dddddd] pb-2 px-7 md:px-0 ${className}`}>
      {label}
    </div>
  );
}