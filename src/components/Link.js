// use NavLink from react-router-dom
import { NavLink } from "react-router-dom";

export default function Link({to, label, responsive, icon}) {
  return (
    <NavLink to={to} className={({ isActive }) => `md:w-[220px] p-2 rounded-md cursor-pointer my-2 flex items-center duration-[0.3s] ${
      isActive ? 'text-[#089bab] bg-white' : 'hover:text-[#089bab] hover:bg-white'}
      ${responsive ? 'w-full' : 'w-[200px]'}`}>
      {icon}
      <span className={`md:block ${responsive ? 'hidden' : 'inline'}`}>{label}</span>
    </NavLink>
  );
}