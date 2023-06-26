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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineSearch } from "react-icons/ai";
import { BsLayoutSidebarReverse } from "react-icons/bs";
import usePostMessage from "../hooks/usePostMessage";
import useSocket from "../hooks/useSocket";
import useUser from "../hooks/useUser";
import useUsers from "../hooks/useUsers";
import { fetchConversationById } from "../services/conversations";
import Message from "./Message";

interface ChatBoxProps {
    conversationId: Conversation["id"];
}

interface ChatFormValues {
    content: string;
}

export default function ChatBox({ conversationId }: ChatBoxProps) {
    const socket = useSocket();
    const { currentUser } = useUser();
    const { register, handleSubmit, reset, watch } = useForm<ChatFormValues>();
    const messageBoxRef = useRef<HTMLDivElement | null>(null);

    const { status, data: conversation } = useQuery({
        queryKey: ["conversation", conversationId],
        queryFn: () => fetchConversationById(conversationId),
        onError: (error) => {
            // if (isAxiosError(error)) {
            //     if (error.response && error.response.status == 404) {
            //         client.setQueryData(
            //             ["conversation", conversationId],
            //             () => {
            //                 const conversation: Conversation = {
            //                     id: "temp",
            //                     participants: [
            //                         currentUser,
            //                         users.find(
            //                             (user) => user.id == conversationId
            //                         ) as User,
            //                     ],
            //                     messages: [],
            //                     latestMessage: null,
            //                     isGroup: false,
            //                     createdAt: new Date().toLocaleString(),
            //                     updatedAt: new Date().toLocaleString(),
            //                 };
            //                 return conversation;
            //             }
            //         );
            //     }
            // }
        },
    });
    const postMessage = usePostMessage();

    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop =
                messageBoxRef.current.scrollHeight;
        }
    });

    useEffect(() => {
        const subscription = watch(({ content }) => {
            if (content && content.trim().length > 0) {
                socket && socket.emit("conversation:typing");
            } else {
                socket && socket.emit("conversation:stop-typing");
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, socket]);

    if (status === "loading") {
        return (
            <Center w={"full"} h={"full"}>
                <Spinner />
            </Center>
        );
    }

    const onSubmit = (values: ChatFormValues) => {
        reset();

        postMessage.mutate({
            conversationId,
            content: values.content,
        });
    };

    const participant = conversation?.isGroup
        ? null
        : conversation?.participants.find(
              (participant) => participant.id != currentUser.id
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
                                    : participant?.displayName
                            }
                            src={currentUser.avatar ?? undefined}
                        />

                        <Box>
                            <Heading
                                as={"h5"}
                                fontSize={"lg"}
                                fontWeight={"medium"}
                            >
                                {conversation?.isGroup
                                    ? conversation.groupName
                                    : participant?.displayName}
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
