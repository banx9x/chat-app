import client from "./client";

export const fetchConversations = async () => {
    const res = await client.get<ServerResponse<ConversationPreview[]>>(
        "/conversations"
    );

    return res.data.data;
};

export type FetchConversationsResponse = Awaited<
    ReturnType<typeof fetchConversations>
>;

export const fetchConversationById = async (
    conversation: Conversation["id"]
) => {
    const res = await client.get<ServerResponse<Conversation>>(
        `/conversations/${conversation}`
    );

    return res.data.data;
};

export const postMessage = async ({
    conversationId,
    content,
}: {
    conversationId: Conversation["id"];
    content: string;
}) => {
    const res = await client.post<ServerResponse<Message>>(
        `/conversations/${conversationId}/messages`,
        {
            content,
        }
    );

    return res.data.data;
};

export type FetchConversationResponse = Awaited<
    ReturnType<typeof fetchConversationById>
>;
