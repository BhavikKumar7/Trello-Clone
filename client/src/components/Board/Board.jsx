import { useState, useEffect } from "react";
import List from "../List/List";
import API from "../../api/axios";
import { DragDropProvider } from "@dnd-kit/react";

const Board = ({ board }) => {
  const [lists, setLists] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const [searchText, setSearchText] = useState("");
  const [filterLabel, setFilterLabel] = useState("");
  const [filterMember, setFilterMember] = useState("");
  const [filterDue, setFilterDue] = useState("");
  const [membersList, setMembersList] = useState([]);

  const moveCardLocally = (lists, cardId, sourceListId, destinationListId, newPosition) => {
    const newLists = structuredClone(lists); // 🔥 important (deep copy)

    let movedCard = null;

    // remove
    for (const list of newLists) {
      if (list.id === Number(sourceListId)) {
        const index = list.cards.findIndex(c => c.id == cardId);
        if (index !== -1) {
          movedCard = list.cards.splice(index, 1)[0];
          break;
        }
      }
    }

    if (!movedCard) return newLists;

    // 🔥 update list_id
    movedCard.list_id = Number(destinationListId);

    // insert
    for (const list of newLists) {
      if (list.id === Number(destinationListId)) {
        list.cards.splice(newPosition - 1, 0, movedCard);
        break;
      }
    }

    return newLists;
  };

  const handleDragEnd = async (event) => {
    const { operation } = event;

    if (!operation.target) return;

    const source = operation.source;
    const target = operation.target;

    const cardId = source.id.replace("card-", "");
    const sourceListId = source.data?.rawListId;

    let destinationListId;
    let newPosition;

    // 🔥 LIST DROP
    if (operation.source.id.startsWith("list-")) {
      setLists((prev) => {
        const updated = prev.map((list, index) => ({
          ...list,
          position: index + 1,
        }));

        API.patch("/lists/reorder", {
          lists: updated.map(l => ({
            id: l.id,
            position: l.position
          })),
        }).catch(() => refreshBoard());

        return updated;
      });

      try {
        await API.patch("/lists/reorder", {
          lists: updatedLists,
        });
      } catch (err) {
        console.error(err);
        refreshBoard(); // fallback
      }

      return; // stop card logic
    }

    if (target.id.startsWith("card-")) {
      destinationListId = target.data?.rawListId;
      newPosition = target.data?.index + 1;
    } else {
      destinationListId = target.id.replace("list-", "");
      const destList = lists.find(l => l.id == destinationListId);
      newPosition = (destList?.cards?.length || 0) + 1;
    }

    // 🔥 OPTIMISTIC UPDATE (NO FLICKER)
    setLists(prev =>
      moveCardLocally(prev, cardId, sourceListId, destinationListId, newPosition)
    );

    // 🔥 BACKEND CALL (silent)
    try {
      await API.patch("/cards/move", {
        cardId,
        sourceListId,
        destinationListId,
        newPosition,
      });
    } catch (err) {
      console.error(err);
      refreshBoard(); // fallback if failed
    }
  };

  let lastMove = null;

  const handleDragOver = (event) => {
    const { operation } = event;
    if (!operation.target) return;

    const source = operation.source;
    const target = operation.target;

    if (source.id.startsWith("list-")) {
      if (!target.id.startsWith("list-")) return;

      const sourceId = source.data?.listId;
      const targetId = target.data?.listId;

      if (!sourceId || !targetId) return;
      if (sourceId === targetId) return;

      const key = `list-${sourceId}-to-${targetId}`;
      if (lastMove === key) return;
      lastMove = key;

      setLists((prev) => {
        const updated = [...prev];

        const oldIndex = updated.findIndex((l) => l.id == sourceId);
        const newIndex = updated.findIndex((l) => l.id == targetId);

        if (oldIndex === -1 || newIndex === -1) return prev;

        const [moved] = updated.splice(oldIndex, 1);
        updated.splice(newIndex, 0, moved);

        return updated;
      });

      return;
    }

    if (source.id.startsWith("card-")) {
      const cardId = source.id.replace("card-", "");
      const sourceListId = source.data?.rawListId;

      let destinationListId;
      let newPosition;

      if (target.id.startsWith("card-")) {
        destinationListId = target.data?.rawListId;
        newPosition = target.data?.index;
      }

      else if (target.id.startsWith("list-")) {
        destinationListId = target.id.replace("list-", "");

        const destList = lists.find((l) => l.id == destinationListId);
        newPosition = destList?.cards?.length || 0;
      }

      if (!destinationListId) return;

      const key = `card-${cardId}-${destinationListId}-${newPosition}`;

      // ❌ prevent flicker
      if (lastMove === key) return;
      lastMove = key;

      // ❌ prevent same position update
      if (
        sourceListId == destinationListId &&
        source.data?.index === newPosition
      )
        return;

      setLists((prev) =>
        moveCardLocally(
          prev,
          cardId,
          sourceListId,
          destinationListId,
          newPosition + 1
        )
      );
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setMembersList(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setLists(board.lists || []);
  }, [board]);

  const refreshBoard = async () => {
    try {
      const res = await API.get(`/boards/${board.id}`);
      setLists(res.data.lists || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;

    try {
      const res = await API.post("/lists", {
        boardId: board.id,
        title: newListTitle,
        position: lists.length + 1,
      });

      const newList = {
        id: res.data.id,
        title: res.data.title,
        position: res.data.position,
        cards: [],
      };

      setLists([...lists, newList]);
      setNewListTitle("");
      setShowInput(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="h-screen p-3 sm:p-6 text-white bg-[#0079bf] overflow-hidden">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">

          {/* TITLE */}
          <h2 className="flex-1 min-w-0 text-xl sm:text-2xl font-bold truncate">
            {board.title}
          </h2>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search cards..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="px-3 py-2 rounded-md text-black w-full sm:w-auto min-w-[140px]"
            />

            {/* LABEL FILTER */}
            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="px-3 py-2 rounded-md text-black w-full sm:w-auto text-sm sm:text-base"
            >
              <option value="">All Labels</option>
              <option value="1">Bug</option>
              <option value="2">Feature</option>
              <option value="3">Urgent</option>
              <option value="4">Improvement</option>
            </select>

            {/* MEMBER FILTER */}
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="px-3 py-2 rounded-md text-black w-full sm:w-auto text-sm sm:text-base"
            >
              <option value="">All Members</option>
              {membersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* DUE FILTER */}
            <select
              value={filterDue}
              onChange={(e) => setFilterDue(e.target.value)}
              className="px-3 py-2 rounded-md text-black w-full sm:w-auto text-sm sm:text-base"
            >
              <option value="">All Dates</option>
              <option value="today">Due Today</option>
              <option value="overdue">Overdue</option>
            </select>

          </div>
        </div>

        {/* LISTS */}
        <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto pb-3">

          {lists.map((list, index) => (
            <List
              key={list.id}
              list={list}
              index={index}
              refreshBoard={refreshBoard}
              searchText={searchText}
              filterLabel={filterLabel}
              filterMember={filterMember}
              filterDue={filterDue}
            />
          ))}

          {/* ADD LIST */}
          <div className="min-w-[85vw] sm:min-w-[250px]">
            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="w-full bg-white hover:bg-slate-200 text-black p-3 rounded-lg text-left text-sm sm:text-base"
              >
                + Add another list
              </button>
            ) : (
              <div className="bg-gray-200 p-3 rounded-lg">
                <input
                  type="text"
                  placeholder="Enter list title..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="w-full p-2 rounded mb-2 text-black outline-none text-sm sm:text-base"
                  autoFocus
                />

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleAddList}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add List
                  </button>

                  <button
                    onClick={() => setShowInput(false)}
                    className="text-black px-2 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </DragDropProvider>
  );
};

export default Board;