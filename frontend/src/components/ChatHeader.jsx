import { X, Trash } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, hideUserFromSidebar } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  // Defensive check: if authUser is null, treat as no permission
  const canSeeLastSeen =
    authUser?.showLastSeen === true && selectedUser?.showLastSeen === true;

  const isOnline = onlineUsers.includes(selectedUser?._id);

  if (!selectedUser) return null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser?.profilePic || "/avatar.png"} alt={selectedUser?.fullName} />
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{selectedUser?.fullName}</h3>
            <button
              onClick={() => {
                hideUserFromSidebar(selectedUser._id);
                setSelectedUser(null);
              }}
              className="btn btn-ghost btn-xs text-red-600 hover:bg-red-100 p-0"
              title="Remove user from sidebar"
            >
              <Trash className="size-4" />
            </button>
          </div>
          <p className="text-sm text-base-content/70">
            {canSeeLastSeen && isOnline ? "Online" : "Offline"}
          </p>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
