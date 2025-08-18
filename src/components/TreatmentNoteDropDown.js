import { useState, useRef, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

export default function TreatmentNoteDropDown({ treatmentsNotes, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showTreatmentNoteDetails, setShowTreatmentNoteDetails] = useState(false);
  const dropdownRef = useRef(null);
  const [treatmentNote, setTreatmentNote] = useState({
    name: "",
    description: "",
    duration_value: 1,
    duration_unit: ""
  });

  useEffect(() => {
    if (value && treatmentsNotes && treatmentsNotes.length > 0) {
      const found = treatmentsNotes.find((note) => note.id === value);
      if (found) {
        setSelected(found);
      }
    }
  }, [value, treatmentsNotes]);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        {selected ? selected?.title : "None"}
        <IoIosArrowDown />
      </button>

      {open && treatmentsNotes && treatmentsNotes.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
          {treatmentsNotes.map((med) => (
            <div
              key={med.id}
              className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <span onClick={() => handleSelect(med)}>
                {med?.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTreatmentNote({
                    name: med.title,
                    description: med.text,
                    duration_value: med.duration_value,
                    duration_unit: med.duration_unit,
                  });
                  setShowTreatmentNoteDetails(true);
                }}
              >
                <FaEye className="hover:scale-125 text-[#089bab]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showTreatmentNoteDetails && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2">
          <div className="relative bg-white rounded-xl p-5 text-xl flex flex-col items-center shadow-xl w-[500px]">
            <div
              onClick={() => {
                setShowTreatmentNoteDetails(false);
                setTreatmentNote({
                  name: "",
                  description: "",
                  duration_value: 1,
                  duration_unit: "",
                });
              }}
              className="absolute top-[15px] right-[15px] hover:text-[#089bab] font-bold cursor-pointer duration-300"
            >
              X
            </div>
            <div className="mb-5 w-full font-semibold">
              <h1 className="font-bold text-2xl text-center">{treatmentNote.name} Details</h1>
              <div className="flex justify-between my-3">
                <label>Name</label>
                <label className="text-[#089bab]">{treatmentNote.name}</label>
              </div>
              <div className="flex flex-col">
                <label>Description</label>
                <div className="h-[200px] bg-gray-200 rounded-2xl p-5 mt-2 overflow-y-auto text-[#089bab]">
                  {treatmentNote.description}
                </div>
              </div>
              <div className="flex mt-3 justify-between">
                <label>Duration</label>
                <div className="text-[#089bab]">
                  <label className="mr-2">{treatmentNote.duration_value}</label>
                  <label>{treatmentNote.duration_unit}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
