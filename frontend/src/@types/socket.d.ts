interface ServerToClientEvents {
    connected: () => void;
    receivedMessage: (
        message: Message,
        conversationId: Conversation["id"]
    ) => void;
    acceptedFriendRequest: () => void;
    joinedGroup: () => void;
    leaveGroup: () => void;
    typing: () => void;
    stopTyping: () => void;
    seen: () => void;
}

interface ClientToServerEvents {
    setup: (user: User) => void;
    connected: () => void;
    typing: () => void;
    stopTyping: () => void;
    seen: () => void;
}
