import { Avatar, Flex, Text } from "@chakra-ui/react";

interface ContactItemProps {
    contact: User;
    onSelect: (contact: UserId) => void;
}

export default function ContactItem({ contact, onSelect }: ContactItemProps) {
    return (
        <Flex
            align={"center"}
            gap={2}
            p={2}
            _hover={{ bg: "gray.100" }}
            borderRadius={"2xl"}
            onClick={() => onSelect(contact.id)}
        >
            <Avatar name={contact.displayName} />

            <Text fontWeight={"medium"}>{contact.displayName}</Text>
        </Flex>
    );
}
