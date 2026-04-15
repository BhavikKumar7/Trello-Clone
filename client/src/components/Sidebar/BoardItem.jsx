import { useState } from "react";
import { MoreVertical } from "react-feather";
import { Popover } from "react-tiny-popover";
import API from "../../api/axios";
import { useSortable } from "@dnd-kit/react/sortable";

const BoardItem = ({
  board,
  index,
  selectedBoardId,
  setSelectedBoardId,
  refreshBoards,
  refreshBoard,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);

  const { ref, transform, transition, isDragging } = useSortable({
    id: `board-${board.id}`,
    index,
    data: {
      boardId: board.id,
    },
  });

  // 🔹 Update board
  const updateBoard = async () => {
    try {
      await API.put(`/boards/${board.id}`, {
        title,
        background: board.background,
      });
      setIsEditing(false);
      refreshBoards();
      refreshBoard && refreshBoard();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Delete board
  const deleteBoard = async () => {
    const confirmDelete = window.confirm("Delete this board?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/boards/${board.id}`);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition ${
        selectedBoardId === board.id
          ? "bg-blue-600"
          : "bg-[#2c2d30] hover:bg-[#3a3b3f]"
      }`}
    >
      <div
        className="flex items-center justify-between w-full cursor-pointer"
        onPointerDown={(e) => {e.stopPropagation(); setSelectedBoardId(board.id)}}
        onClick={() => setSelectedBoardId(board.id)}
      >
        {/* TITLE */}
        <div className="flex-1 min-w-0">
          {!isEditing ? (
            <span className="truncate text-sm sm:text-base">
              {title}
            </span>
          ) : (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={updateBoard}
              onKeyDown={(e) => e.key === "Enter" && updateBoard()}
              className="w-full bg-gray-100 text-black px-2 py-1 rounded outline-none text-sm"
              autoFocus
            />
          )}
        </div>

        {/* MENU */}
        <Popover
          isOpen={isPopoverOpen}
          positions={["right", "bottom"]}
          onClickOutside={() => setIsPopoverOpen(false)}
          portalElement={document.body} // 🔥 ensures it appears above sidebar
          containerStyle={{ zIndex: 9999 }}
          content={
            <div className="bg-[#2c2d30] text-white rounded shadow-lg p-2 w-28 sm:w-32">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setIsPopoverOpen(false);
                }}
                className="block w-full text-left px-2 py-1 text-sm hover:bg-[#3a3b3f] rounded"
              >
                Edit
              </button>

              <button
                onClick={deleteBoard}
                className="block w-full text-left px-2 py-1 text-sm hover:bg-red-500 rounded"
              >
                Delete
              </button>
            </div>
          }
        >
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsPopoverOpen(!isPopoverOpen);
            }}
            className="ml-2 p-1 hover:bg-[#3a3b3f] rounded"
          >
            <MoreVertical size={14} />
          </button>
        </Popover>
      </div>
    </div>
  );
};

export default BoardItem;