import { Flex } from "@chakra-ui/react";
import ContactItem from "./Contact";

interface ContactListProps {
    contacts: User[];
}

export default function ContactList({ contacts }: ContactListProps) {
    return (
        <Flex flexDir={"column"}>
            {contacts.map((contact) => (
                <ContactItem key={contact.id} contact={contact} />
            ))}
        </Flex>
    );
}
