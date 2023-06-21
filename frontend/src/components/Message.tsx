import { Box } from "@chakra-ui/react";
import { useUser } from "../contexts/user/hooks";

interface MessageProps {
    message: Message;
}

export default function Message({ message }: MessageProps) {
    const { user } = useUser();

    const isSender = message.sender.id === user.id;

    return (
        <Box
            alignSelf={isSender ? "flex-end" : "flex-start"}
            bg={isSender ? "purple.400" : "gray.100"}
            px={3}
            py={1}
            borderRadius={"2xl"}
            minW={"20"}
            maxW={"lg"}
            color={isSender ? "white" : "black"}
            pos={"relative"}
            role="group"
        >
            <Box>{message.content}</Box>

            <Box
                as={"time"}
                color={isSender ? "whiteAlpha.700" : "gray.500"}
                fontSize={"xs"}
            >
                {new Date(message.createdAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </Box>
        </Box>
    );
}
