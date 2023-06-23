import {
    Avatar,
    AvatarGroup,
    Box,
    Flex,
    Heading,
    Text,
} from "@chakra-ui/react";
import { useUser } from "../contexts/user/hooks";

interface ChatCardProps {
    conversation: ConversationPreview;
    onSelect: (conversation: Conversation["id"]) => void;
    isSelected: boolean;
}

export function ConversationItem({
    conversation,
    onSelect,
    isSelected,
}: ChatCardProps) {
    const { user } = useUser();

    const participant = conversation.isGroup
        ? null
        : conversation.participants.find(
              (participant) => participant.id != user.id
          );

    return (
        <Box
            p={2}
            borderRadius={"2xl"}
            _hover={{ bg: "gray.100" }}
            onClick={() => onSelect(conversation.id)}
            bg={isSelected ? "gray.100" : ""}
        >
            <Flex align={"center"} gap={2}>
                <Avatar
                    name={
                        conversation.isGroup
                            ? conversation.groupName
                            : participant?.displayName
                    }
                />

                <Flex flexDir={"column"} justify={"space-around"} gap={1}>
                    <Heading
                        as={"h5"}
                        size={"sm"}
                        fontWeight={"medium"}
                        noOfLines={1}
                    >
                        {conversation.isGroup
                            ? conversation.groupName
                            : participant?.displayName}
                    </Heading>

                    <Text noOfLines={1} fontSize={"sm"} color={"gray.700"}>
                        {conversation.latestMessage?.content}
                    </Text>
                </Flex>

                <Flex
                    flexDir={"column"}
                    ml={"auto"}
                    align={"flex-end"}
                    justify={"space-between"}
                >
                    <Box as={"time"} fontSize={"sm"} color={"gray.700"}>
                        {conversation.latestMessage &&
                            new Date(
                                conversation.latestMessage.updatedAt
                            ).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                    </Box>
                    {conversation.isGroup && (
                        <AvatarGroup max={5} size={"xs"}>
                            {conversation.participants.map((participant) => (
                                <Avatar
                                    key={participant.id}
                                    name={participant.displayName}
                                />
                            ))}
                        </AvatarGroup>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
}

interface ConversationListProps {
    conversations: ConversationPreview[];
    onSelectConversation: (conversationId: Conversation["id"]) => void;
    selectedConversationId?: Conversation["id"];
}

export default function ConversationList({
    conversations,
    onSelectConversation,
    selectedConversationId,
}: ConversationListProps) {
    return (
        <Flex flexDir={"column"}>
            {conversations
                .sort(
                    (a, b) =>
                        new Date(
                            b.latestMessage
                                ? b.latestMessage.createdAt
                                : b.updatedAt
                        ).getTime() -
                        new Date(
                            a.latestMessage
                                ? a.latestMessage.createdAt
                                : b.updatedAt
                        ).getTime()
                )
                .map((conversation) => (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        onSelect={onSelectConversation}
                        isSelected={selectedConversationId === conversation.id}
                    />
                ))}
        </Flex>
    );
}
