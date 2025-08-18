export default function Button({
  variant = "primary",
  icon,
  iconPosition = "left",
  className = "",
  children,
  onClick
}) {
  const baseStyles = "flex items-center justify-center duration-300 border-2 rounded-xl mr-3";
  
  const variants = {
    primary: "bg-[#089bab] text-white hover:bg-transparent hover:text-black border-[#089bab] w-[300px] py-1 ",
    secondary: "bg-gray-300 text-black hover:bg-gray-400 w-full",
    plus: "bg-[#089bab] hover:bg-[#047986] duration-300 text-white p-3 rounded-2xl p-2 fixed bottom-[25px] right-[25px] md:hidden border-none",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon && iconPosition === "left" && <span>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span>{icon}</span>}
    </button>
  );
}
