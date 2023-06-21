import {
    Avatar,
    Box,
    Center,
    Flex,
    Heading,
    IconButton,
    Input,
    Spinner,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "../contexts/user/hooks";
import { fetchConversationById, postMessage } from "../services/conversations";
import Message from "./Message";
import { AiOutlineSearch } from "react-icons/ai";
import { BsLayoutSidebarReverse } from "react-icons/bs";

interface ChatBoxProps {
    conversationId: Conversation["id"];
}

interface ChatFormValues {
    content: string;
}

export default function ChatBox({ conversationId }: ChatBoxProps) {
    const { user } = useUser();
    const client = useQueryClient();
    const { register, handleSubmit, reset } = useForm<ChatFormValues>();
    const messageBoxRef = useRef<HTMLDivElement | null>(null);
    const { status, data: conversation } = useQuery({
        queryKey: ["conversation", conversationId],
        queryFn: () => fetchConversationById(conversationId),
    });
    const messages = useMutation({
        mutationFn: postMessage,
        onMutate: async ({ conversationId, content }) => {
            const newMessage: Message = {
                id: String(Date.now()),
                sender: user,
                content,
                createdAt: new Date().toLocaleString(),
                updatedAt: new Date().toLocaleString(),
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

            reset();

            return { id: newMessage.id };
        },
        onSuccess: (res, { conversationId }, context) => {
            const id = context?.id;

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

    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    });

    if (status === "loading") {
        return (
            <Center w={"full"} h={"full"}>
                <Spinner />
            </Center>
        );
    }

    const onSubmit = (values: ChatFormValues) => {
        messages.mutate({
            conversationId,
            content: values.content,
        });
    };

    const participant = conversation?.isGroup
        ? null
        : conversation?.participants.find(
              (participant) => participant.id != user.id
          );

    return (
        <Flex flexDir={"column"} h={"full"}>
            <Box h={16} flexShrink={0}>
                <Flex
                    h={"full"}
                    align={"center"}
                    justifyContent={"space-between"}
                >
                    <Flex gap={2} align={"center"}>
                        <Avatar
                            name={
                                conversation?.isGroup
                                    ? conversation.groupName
                                    : participant?.username
                            }
                        />

                        <Box>
                            <Heading
                                as={"h5"}
                                fontSize={"lg"}
                                fontWeight={"medium"}
                            >
                                {conversation?.isGroup
                                    ? conversation.groupName
                                    : participant?.username}
                            </Heading>
                            <Box fontSize={"sm"} color={"gray.700"}>
                                {conversation?.isGroup
                                    ? `${conversation.participants.length} members`
                                    : "Online"}
                            </Box>
                        </Box>
                    </Flex>

                    <Flex gap={2}>
                        <IconButton
                            icon={<AiOutlineSearch />}
                            aria-label="Search message"
                        />
                        <IconButton
                            icon={<BsLayoutSidebarReverse />}
                            aria-label="Info"
                        />
                    </Flex>
                </Flex>
            </Box>
            <Box
                ref={messageBoxRef}
                flex={1}
                overflowY={"auto"}
                overscrollBehavior={"contain"}
                py={4}
            >
                <Flex flexDir={"column"} justifyContent={"flex-end"} gap={1}>
                    {conversation && conversation.messages.length > 0
                        ? conversation.messages.map((message) => (
                              <Message key={message.id} message={message} />
                          ))
                        : "No messages"}
                </Flex>
            </Box>

            <Box h={12}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        {...register("content")}
                        placeholder="Enter something"
                        autoComplete={"off"}
                    />
                </form>
            </Box>
        </Flex>
    );
}
