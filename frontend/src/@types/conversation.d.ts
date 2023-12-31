interface Message {
    id: string;
    sender: User;
    content: string;
    createdAt: string;
    updatedAt: string;
}

type MessageId = Message["id"];

interface SingleConversation {
    id: string;
    participants: User[];
    messages: Message[];
    latestMessage: Message | null;
    isGroup: false;
    isDraft: boolean;
    createdAt: string;
    updatedAt: string;
}

interface GroupConversation extends SingleConversation {
    groupName: string;
    groupAvatar: string;
    isGroup: true;
    admin: User;
}

type Conversation = SingleConversation | GroupConversation;
type ConversationId = Conversation["id"];

type ConversationPreview =
    | Omit<SingleConversation, "messages">
    | Omit<GroupConversation, "messages">;
