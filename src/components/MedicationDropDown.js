import { useState, useRef, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { ImageUrl } from "../config";

export default function MedicationDropDown({ medications, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showMedicationDetails, setShowMedicationDetails] = useState(false);
  const dropdownRef = useRef(null);
  const [medicationPlan, setMedicationPlan] = useState({
    id: null,
    medicationId: null,
    name: "",
    dose: "",
    duration_value: 1,
    duration_unit: "days",
    info: "",
    image: null,
  });

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value && medications?.length) {
      const found = medications.find((med) => med.id === value);
      if (found) {
        setSelected(found);
      }
    }
  }, [value, medications]);

  const handleSelect = (med) => {
    setSelected(med);
    onSelect(med);
    setOpen(false);
  };

  return (
    <div className="relative w-[150px] mb-5" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="min-w-[150px] px-3 py-1 rounded-xl text-left bg-gray-200 flex justify-between items-center"
      >
        {selected ? selected.medication.name : "None"}
        <IoIosArrowDown />
      </button>

      {open && medications && medications.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
          {medications.map((med) => (
            <div
              key={med.id}
              className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <span onClick={() => handleSelect(med)}>
                {med.medication.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMedicationPlan({
                    name: med.medication.name,
                    dose: med.dose,
                    duration_value: med.duration_value,
                    duration_unit: med.duration_unit,
                    info: med.medication.info,
                    image: `${ImageUrl}${med.medication.image}`,
                  });
                  setShowMedicationDetails(true);
                }}
              >
                <FaEye className="hover:scale-125 text-[#089bab]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showMedicationDetails && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
          <div className="relative bg-white rounded-xl p-5 text-xl flex flex-col items-center shadow-xl w-[500px]">
            <div
              onClick={() => {
                setShowMedicationDetails(false);
                setMedicationPlan({
                  name: "",
                  dose: "",
                  duration_value: 1,
                  duration_unit: "days",
                  info: "",
                });
              }}
              className="absolute top-[15px] right-[15px] hover:text-[#089bab] font-bold cursor-pointer duration-300"
            >
              X
            </div>
            <div className="mb-5 w-full font-semibold">
              <h1 className="font-bold text-2xl text-center">
                Medication Plan Details
              </h1>
              <div className="my-3 object-cover w-full flex justify-center">
                <img
                  className="w-[150px] h-[150px]"
                  alt="medication-plan-image"
                  src={medicationPlan.image}
                />
              </div>
              <div className="flex justify-between my-3">
                <label>Name</label>
                <label className="text-[#089bab] ml-2">
                  {medicationPlan.name}
                </label>
              </div>
              <div className="flex flex-col">
                <label>Description</label>
                <div className="h-[200px] bg-gray-200 rounded-2xl p-5 mt-2 overflow-y-auto text-[#089bab]">
                  {medicationPlan.info}
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <label>Duration</label>
                <div className="text-[#089bab] ml-2">
                  <label className="mr-2">
                    {medicationPlan.duration_value}
                  </label>
                  <label>{medicationPlan.duration_unit}</label>
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <label>Dose</label>
                <label className="text-[#089bab] ml-2">
                  {medicationPlan.dose}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
