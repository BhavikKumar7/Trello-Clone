import { useEffect, useState } from "react";
import API from "../../api/axios";
import BoardItem from "./BoardItem";
import { DragDropProvider } from "@dnd-kit/react";

const Sidebar = ({ selectedBoardId, setSelectedBoardId }) => {
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  let lastMove = null;

  // 🔹 Fetch all boards
  const fetchBoards = async () => {
    try {
      const res = await API.get("/boards");
      setBoards(res.data);

      if (!selectedBoardId && res.data.length > 0) {
        setSelectedBoardId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // 🔹 Create board
  const createBoard = async () => {
    if (!newBoardTitle.trim()) return;

    try {
      const res = await API.post("/boards", {
        title: newBoardTitle,
        background: "#0079bf",
      });

      setBoards((prev) => [res.data, ...prev]);
      setSelectedBoardId(res.data.id);
      setNewBoardTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DRAG OVER (LIVE SHIFT)
  const handleDragOver = (event) => {
    const { operation } = event;
    if (!operation.target) return;

    const source = operation.source;
    const target = operation.target;

    if (!source.id.startsWith("board-") || !target.id.startsWith("board-")) return;

    const sourceId = source.data?.boardId;
    const targetId = target.data?.boardId;

    if (!sourceId || !targetId) return;
    if (sourceId === targetId) return;

    const key = `board-${sourceId}-to-${targetId}`;
    if (lastMove === key) return;
    lastMove = key;

    setBoards((prev) => {
      const updated = [...prev];

      const oldIndex = updated.findIndex((b) => b.id == sourceId);
      const newIndex = updated.findIndex((b) => b.id == targetId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);

      return updated;
    });
  };

  // ✅ DRAG END (SAVE TO DB)
  const handleDragEnd = async () => {
    setBoards((prev) => {
      const updated = prev.map((b, index) => ({
        ...b,
        position: index + 1,
      }));

      API.patch("/boards/reorder", {
        boards: updated.map((b) => ({
          id: b.id,
          position: b.position,
        })),
      }).catch(() => fetchBoards());

      return updated;
    });
  };

  return (
    <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="w-72 sm:w-72 max-w-[300px] h-full bg-[#1e1f21] text-white flex flex-col border-r border-gray-800">

        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold tracking-wide">
            Boards
          </h2>
        </div>

        {/* Board List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
          {boards.map((board, index) => (
            <BoardItem
              key={board.id}
              board={board}
              index={index}
              selectedBoardId={selectedBoardId}
              setSelectedBoardId={setSelectedBoardId}
              refreshBoards={fetchBoards}
            />
          ))}
        </div>

        {/* Create Board */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <input
            type="text"
            placeholder="Create new board..."
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[#2c2d30] text-white outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-sm sm:text-base"
          />

          <button
            onClick={createBoard}
            className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded-md font-medium text-sm sm:text-base"
          >
            + Create Board
          </button>
        </div>

      </div>
    </DragDropProvider>
  );
};

export default Sidebar;