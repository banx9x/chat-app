interface ServerToClientEvents {
    // System
    "socket:connected": () => void;

    // User
    "user:received-friend-request": (user: User) => void;
    "user:accepted-friend-request": (user: User) => void;
    "user:rejected-friend-request": (user: User) => void;

    // Conversation
    "conversation:created": (conversation: SingleConversation) => void;
    "conversation:deleted": () => void;
    "conversation:typing": () => void;
    "conversation:stop-typing": () => void;
    "conversation:seen": () => void;

    "conversation:messages:received": (
        message: Message,
        conversationId: ConversationId
    ) => void;
    "conversation:messages:deleted";

    // Group
    "group:created": (group: GroupConversation) => void;
    "group:added": (group: GroupConversation) => void;
    "group:removed": (group: GroupConversation) => void;
    "group:joined": (user: User, group: GroupConversation) => void;
    "group:left": (user: User, group: GroupConversation) => void;
    "group:deleted": (group: GroupConversation) => void;
}

interface ClientToServerEvents {
    // System
    "socket:setup": (user: User) => void;

    // User

    // Conversation
    "conversation:typing": () => void;
    "conversation:stop-typing": () => void;
}
