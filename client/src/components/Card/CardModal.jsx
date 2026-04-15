import { useState, useEffect, useRef } from "react";
import API from "../../api/axios";

const CardModal = ({ card, onClose, refreshBoard }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [membersList, setMembersList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);

  const dropdownRef = useRef();

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [dueDate, setDueDate] = useState(formatDate(card.due_date));

  const [selectedLabel, setSelectedLabel] = useState(
    card.label ? card.label.id : null
  );

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
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMembersDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.addEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedMembers(card.members?.map(m => m.id) || []);
    setDueDate(formatDate(card.due_date));
    setTitle(card.title);
    setDescription(card.description || "");
    setSelectedLabel(card.label ? card.label.id : null);
  }, [card]);

  const toggleMember = (id) => {
    let updated;

    if (selectedMembers.includes(id)) {
      updated = selectedMembers.filter(m => m !== id);
    } else {
      updated = [...selectedMembers, id];
    }

    setSelectedMembers(updated);
    setShowMembersDropdown(false);
  };

  const labelsList = [
    { id: 1, name: "Bug", color: "#ff4d4f" },
    { id: 2, name: "Feature", color: "#52c41a" },
    { id: 3, name: "Urgent", color: "#fa8c16" },
    { id: 4, name: "Improvement", color: "#1890ff" }
  ];

  const handleSave = async () => {
    try {
      await API.put(`/cards/${card.id}`, {
        title,
        description,
      });

      await API.patch(`/cards/${card.id}/duedate`, {
        dueDate: dueDate || null,
      });

      if (card.label) {
        await API.delete(`/cards/${card.id}/labels/${card.label.id}`);
      }

      if (selectedLabel) {
        await API.post(`/cards/${card.id}/labels`, {
          labelId: selectedLabel,
        });
      }

      if (card.members && card.members.length > 0) {
        for (let m of card.members) {
          await API.delete(`/cards/${card.id}/members/${m.id}`);
        }
      }

      for (let userId of selectedMembers) {
        await API.post(`/cards/${card.id}/members`, {
          userId,
        });
      }

      onClose();
      refreshBoard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3 sm:px-0"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[500px] sm:w-[500px] p-4 sm:p-6 rounded-xl shadow-xl text-black max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        <h2 className="text-lg sm:text-xl font-semibold mb-4">Edit Card</h2>

        {/* TITLE */}
        <label className="text-sm font-medium mb-1 block">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-sm sm:text-base"
        />

        {/* DESCRIPTION */}
        <label className="text-sm font-medium mb-1 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-sm sm:text-base"
        />

        {/* LABEL */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Label</h3>

          <select
            value={selectedLabel || ""}
            onChange={(e) =>
              setSelectedLabel(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
          >
            <option value="">No Label</option>
            {labelsList.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>

          {selectedLabel && (
            <div
              className="mt-2 h-3 rounded"
              style={{
                background:
                  labelsList.find(l => l.id === selectedLabel)?.color
              }}
            />
          )}
        </div>

        {/* DUE DATE */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Due Date</h3>
          <input
            type="date"
            value={dueDate || ""}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
          />
        </div>

        {/* MEMBERS */}
        <div ref={dropdownRef} className="mb-4 relative">
          <h3 className="text-sm font-semibold mb-2">Members</h3>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMembersDropdown(!showMembersDropdown);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white text-sm sm:text-base"
          >
            {selectedMembers.length > 0
              ? `${selectedMembers.length} member(s) selected`
              : "Select Members"}
          </button>

          {showMembersDropdown && (
            <div
              className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-40 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {membersList.map((member) => {
                const isSelected = selectedMembers.includes(member.id);

                return (
                  <label
                    key={member.id}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMember(member.id)}
                    />
                    <span className="text-sm">{member.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 bg-gray-200 rounded-md text-sm sm:text-base"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-sm sm:text-base"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default CardModal;