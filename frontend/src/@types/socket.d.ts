interface ServerToClientEvents {
    connected: () => void;
    receivedMessage: (
        message: Message,
        conversationId: Conversation["id"]
    ) => void;
}

interface ClientToServerEvents {
    setup: (user: User) => void;
    connected: () => void;
    typing: () => void;
    stopTyping: () => void;
}
