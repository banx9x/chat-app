import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postMessage } from "../services/conversations";
import useUser from "./useUser";

const usePostMessage = () => {
    const { currentUser, token } = useUser();
    const client = useQueryClient();

    return useMutation({
        mutationFn: postMessage,
        onMutate: async ({ conversationId, content }) => {
            const newMessage: Message = {
                id: String(Date.now()),
                sender: currentUser,
                content,
                createdAt: new Date().toString(),
                updatedAt: new Date().toString(),
            };

            await client.cancelQueries({
                queryKey: ["conversation", conversationId],
            });

            await client.cancelQueries({
                queryKey: ["conversations"],
            });

            await client.cancelQueries({
                queryKey: [],
            });

            client.setQueryData(
                ["conversation", conversationId],
                (old?: Conversation) => {
                    if (!old) return old;

                    return {
                        ...old,
                        messages: [...old.messages, newMessage],
                        latestMessage: newMessage,
                    };
                }
            );

            client.setQueryData(
                ["conversations"],
                (old?: ConversationPreview[]) => {
                    if (!old) return old;

                    return old.map((conversation) =>
                        conversation.id == conversationId
                            ? { ...conversation, latestMessage: newMessage }
                            : conversation
                    );
                }
            );

            return { id: newMessage.id };
        },
        onSuccess: (res, { conversationId }, context) => {
            const id = context?.id;

            client.setQueryData(
                ["conversations"],
                (old?: ConversationPreview[]) => {
                    if (!old) return old;

                    return old.map((conversation) =>
                        conversation.id == conversationId
                            ? { ...conversation, latestMessage: res }
                            : conversation
                    );
                }
            );

            client.setQueryData(
                ["conversation", conversationId],
                (old?: Conversation) => {
                    if (!old) return old;

                    return {
                        ...old,
                        messages: old.messages.map((message) =>
                            message.id == id ? res : message
                        ),
                        latestMessage: res,
                    };
                }
            );
        },
    });
};

export default usePostMessage;
