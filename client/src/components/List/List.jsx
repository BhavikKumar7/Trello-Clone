import { useEffect, useState } from "react";
import { MoreVertical } from "react-feather";
import { Popover } from "react-tiny-popover";
import API from "../../api/axios";
import Card from "../Card/Card";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

const List = ({
  list,
  index,
  refreshBoard,
  searchText,
  filterLabel,
  filterMember,
  filterDue
}) => {
  const [cards, setCards] = useState(list.cards || []);
  const [showCardInput, setShowCardInput] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  const { ref } = useDroppable({
    id: `list-${list.id}`,
    data: {
      type: "LIST",
      listId: list.id,
      index,   // 🔥 REQUIRED
    },
  });

  const {
    ref: sortableRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `list-${list.id}`,
    index,
    data: {
      type: "LIST",
      listId: list.id,
      index,
    },
  });

  const updateList = async () => {
    try {
      await API.put(`/lists/${list.id}`, { title });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteList = async () => {
    const confirmDelete = window.confirm("Delete this list?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/lists/${list.id}`);
      refreshBoard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;

    try {
      const res = await API.post("/cards", {
        listId: list.id,
        title: newCardTitle,
      });

      const newCard = {
        id: res.data.id,
        title: res.data.title,
        position: cards.length + 1,
      };

      setCards([...cards, newCard]);
      setNewCardTitle("");
      setShowCardInput(false);
      refreshBoard();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCards = (list.cards || []).filter((card) => {
    if (
      searchText &&
      !card.title.toLowerCase().includes(searchText.toLowerCase())
    ) return false;

    if (
      filterLabel &&
      (!card.label || card.label.id !== Number(filterLabel))
    ) return false;

    if (
      filterMember &&
      !card.members?.some(m => m.id === Number(filterMember))
    ) return false;

    if (filterDue) {
      const today = new Date();
      const due = new Date(card.due_date);

      if (filterDue === "today") {
        if (!card.due_date || due.toDateString() !== today.toDateString())
          return false;
      }

      if (filterDue === "overdue") {
        if (!card.due_date || !(due < today))
          return false;
      }
    }

    return true;
  });

  useEffect(() => {
    setCards(list.cards || []);
  }, [list]);

  return (
    <div
      ref={(node) => {
        ref(node);
        sortableRef(node);
      }}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="bg-gray-200 p-2 sm:p-3 rounded-lg min-w-[85vw] sm:min-w-[250px] max-w-[90vw] sm:max-w-[280px] flex flex-col"
    >
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-2 sm:mb-3">

        {/* title */}
        <div className="flex-1 min-w-0">
          {!isEditing ? (
            <h3 className="font-semibold text-black truncate text-sm sm:text-base">
              {title}
            </h3>
          ) : (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={updateList}
              onKeyDown={(e) => e.key === "Enter" && updateList()}
              className="w-full bg-gray-100 text-black px-2 py-1 rounded border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm sm:text-base"
              autoFocus
            />
          )}
        </div>

        {/* ICON */}
        <Popover
          isOpen={isPopoverOpen}
          positions={["bottom", "right"]}
          onClickOutside={() => setIsPopoverOpen(false)}
          content={
            <div className="bg-[#030303] text-white rounded shadow-lg p-2 w-28 sm:w-32">
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
                onClick={deleteList}
                className="block w-full text-left px-2 py-1 text-sm hover:bg-red-500 rounded"
              >
                Delete
              </button>
            </div>
          }
        >
          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="text-black p-1 hover:bg-gray-300 rounded"
          >
            <MoreVertical size={14} className="sm:w-4 sm:h-4" />
          </button>
        </Popover>

      </div>

      {/* CARDS */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
        {filteredCards.map((card, index) => (
          <Card
            key={card.id}
            card={{ ...card, list_id: list.id }}
            index={index}
            refreshBoard={refreshBoard}
          />
        ))}
      </div>

      {/* ADD CARD */}
      <div className="mt-2">
        {!showCardInput ? (
          <button
            onClick={() => setShowCardInput(true)}
            className="w-full text-left text-gray-700 hover:bg-gray-300 p-2 rounded text-sm sm:text-base"
          >
            + Add a card
          </button>
        ) : (
          <div className="bg-gray-100 p-2 rounded">
            <textarea
              placeholder="Enter a title for this card..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="w-full p-2 rounded outline-none resize-none text-black mb-2 text-sm sm:text-base"
              rows={2}
              autoFocus
            />

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleAddCard}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Add Card
              </button>

              <button
                onClick={() => setShowCardInput(false)}
                className="text-black px-2 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default List;