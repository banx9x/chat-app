import { Flex } from "@chakra-ui/react";
import ContactItem from "./Contact";

interface ContactListProps {
    contacts: User[];
    onSelectContact: (contact: UserId) => void;
}

export default function ContactList({
    contacts,
    onSelectContact,
}: ContactListProps) {
    return (
        <Flex flexDir={"column"}>
            {contacts.map((contact) => (
                <ContactItem
                    key={contact.id}
                    contact={contact}
                    onSelect={onSelectContact}
                />
            ))}
        </Flex>
    );
}
