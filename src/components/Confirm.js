export default function Confirm({ img, label, onCancel, onConfirm, confirmButtonName }) {
  return(
    <div className="font-semibold fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
      <div className="bg-white rounded-xl p-5 text-xl flex flex-col items-center shadow-xl w-[400px] overflow-hidden">
        <img alt="confirm_image" src={img} className="w-[200px]"/>
        <p className="my-5 text-center">
          {label}
        </p>
        <div className="flex justify-center w-full">

          <button
          onClick={onCancel}
          className="w-[85px] bg-[#9e9e9e] border-2 border-[#9e9e9e] p-1 rounded-xl text-white hover:bg-transparent hover:text-black duration-300">
            Cancel
          </button>

          <button
          onClick={onConfirm}
          className="w-[85px] bg-[#DD1015] border-2 border-[#DD1015] p-1 rounded-xl text-white hover:bg-transparent hover:text-black duration-300 ml-7">
            {confirmButtonName || "Delete"}
          </button>

        </div>
      </div>
    </div>
  );
}