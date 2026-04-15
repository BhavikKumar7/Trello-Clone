import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import BoardPage from "./pages/BoardPage";
import { Menu } from "react-feather";

function App() {
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* MOBILE OVERLAY */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static z-50 h-full w-72
          transform transition-transform duration-300
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar
          selectedBoardId={selectedBoardId}
          setSelectedBoardId={setSelectedBoardId}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOP BAR (MOBILE ONLY) */}
        <div className="md:hidden flex items-center justify-between p-3 bg-[#1e1f21] text-white">
          <button onClick={() => setShowSidebar(true)}>
            <Menu size={20} />
          </button>
          <span className="font-semibold">Boards</span>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto">
          {selectedBoardId ? (
            <BoardPage boardId={selectedBoardId} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a board
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;