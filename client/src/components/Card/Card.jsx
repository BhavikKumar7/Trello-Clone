import { useState } from "react";
import { Edit2, Trash2 } from "react-feather";
import API from "../../api/axios";
import CardModal from "./CardModal";
import { useSortable } from "@dnd-kit/react/sortable";

const Card = ({ card, index, refreshBoard }) => {
  const [showActions, setShowActions] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(card.is_completed);

  const { ref, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: {
      rawListId: card.list_id,
      index,
    },
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });

  const toggleComplete = async () => {
    try {
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);

      await API.patch(`/cards/${card.id}/complete`, {
        isCompleted: newStatus,
      });

      refreshBoard();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCard = async () => {
    const confirmDelete = window.confirm("Delete this card?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/cards/${card.id}`);
      refreshBoard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className={`p-2 sm:p-3 rounded-md shadow-sm flex justify-between items-start gap-2 group transition ${isCompleted ? "bg-green-200" : "bg-white hover:bg-gray-100"
          }`}
        style={{
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
          transition,
          zIndex: isDragging ? 1000 : "auto",
        }}
      >
        {/* ✅ CLICKABLE WRAPPER */}
        <div
          className="flex items-start gap-2 flex-1 min-w-0"
          onPointerDown={(e) => e.stopPropagation()} // 🔥 prevents drag conflict
        >
          {/* CHECKBOX */}
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={toggleComplete}
            className="cursor-pointer mt-1"
          />

          {/* CONTENT */}
          <div className="flex flex-col gap-1 min-w-0 w-full">
            {/* LABEL */}
            <div className="flex gap-1 flex-wrap">
              {card.label && (
                <div
                  className="px-2 py-0.5 text-[10px] sm:text-xs rounded text-white font-medium w-fit"
                  style={{ background: card.label.color }}
                >
                  {card.label.name}
                </div>
              )}
            </div>

            {/* TITLE */}
            <span
              className={`text-black text-sm sm:text-base break-words ${isCompleted ? "line-through opacity-70" : ""
                }`}
            >
              {card.title}
            </span>

            {/* DATE */}
            {card.due_date && (() => {
              const today = new Date();
              const due = new Date(card.due_date);

              today.setHours(0, 0, 0, 0);
              due.setHours(0, 0, 0, 0);

              return (
                <span
                  className={`text-[10px] sm:text-xs px-2 py-0.5 rounded w-fit ${due < today
                    ? "bg-red-100 text-red-600"
                    : due.getTime() === today.getTime()
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                    }`}
                >
                  📅 {due.toLocaleDateString("en-GB")}
                </span>
              );
            })()}

            {/* MEMBERS */}
            <div className="flex gap-1 mt-1 flex-wrap">
              {card.members?.map((member) => (
                <div
                  key={member.id}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs flex items-center justify-center"
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ ACTIONS (ISOLATED) */}
        <div
          className={`flex gap-1 sm:gap-2 ${showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } transition`}
        >
          <Edit2
            size={14}
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onPointerDown={(e) => { e.stopPropagation(); setOpenModal(true); }}
          // onClick={(e) => {
          //   e.stopPropagation();
          //   setOpenModal(true);
          // }}
          />

          <Trash2
            size={14}
            className="cursor-pointer text-gray-600 hover:text-red-600"
            onPointerDown={(e) => { e.stopPropagation(); deleteCard(); }}
          // onClick={(e) => {
          //   e.stopPropagation();
          //   deleteCard();
          // }}
          />
        </div>
      </div>

      {openModal && (
        <CardModal
          card={card}
          onClose={() => setOpenModal(false)}
          refreshBoard={refreshBoard}
        />
      )}
    </>
  );
};

export default Card;