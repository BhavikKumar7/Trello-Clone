import { useEffect, useState } from "react";
import API from "../api/axios";
import Board from "../components/Board/Board";

const BoardPage = ({ boardId, refreshFlag }) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/boards/${boardId}`);
      setBoard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) fetchBoard();
  }, [boardId, refreshFlag]);

  // ✅ LOADING UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-4 overflow-x-auto p-4 w-full">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="min-w-[250px] h-[300px] bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg font-semibold text-gray-500">
          No board found
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <Board board={board} refreshBoard={fetchBoard} />
    </div>
  );
};

export default BoardPage;