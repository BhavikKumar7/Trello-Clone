import { useEffect, useState } from "react";
import API from "../api/axios";
import Board from "../components/Board/Board";

const BoardPage = ({ boardId, refreshFlag }) => {
  const [board, setBoard] = useState(null);

  // ✅ MOVE OUTSIDE
  const fetchBoard = async () => {
    try {
      const res = await API.get(`/boards/${boardId}`);
      setBoard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (boardId) fetchBoard();
  }, [boardId, refreshFlag]);

  if (!board)
    return (
      <div className="flex items-center justify-center h-full px-4 text-center">
        <div className="p-5 text-base sm:text-lg md:text-xl font-semibold">
          Loading...
        </div>
      </div>
    );

  return (
    <div className="h-full w-full overflow-auto">
      <Board board={board} refreshBoard={fetchBoard} />
    </div>
  );
};

export default BoardPage;