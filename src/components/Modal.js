export default function Model({ message, imageSrc }) {
  return(
    <div className="insert-box
        px-[15px]
        inset-0
        bg-black
        bg-opacity-25
        flex
        items-center
        justify-center
        fixed
        z-50">
      <div style={{ boxShadow: "0px 15px 20px 5px rgba(0, 0, 0, 0.25)" }}
      className="flex flex-col items-center justify-center bg-white w-full md:w-[600px] pb-[35px] rounded-xl">
        <img src={imageSrc} alt="Modal Icon" className="w-[500px]" />
        <p className="text-center text-[14px] md:text-[20px] font-bold">{message}</p>
      </div>
    </div>
  );
}