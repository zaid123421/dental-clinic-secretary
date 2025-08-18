// import icons
import { FiPlus } from "react-icons/fi";

export default function PlusButton ({ className, onClick }) {
  return(
    <button onClick={onClick} className={`bg-[#089bab] hover:bg-[#047986] duration-300 text-white p-3 rounded-xl fixed bottom-[25px] right-[25px] md:hidden ${className}`}>
      <FiPlus className="text-lg" />
    </button>
  );
}