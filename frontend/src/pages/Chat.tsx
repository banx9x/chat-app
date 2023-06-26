import {
    Avatar,
    Box,
    Center,
    Divider,
    Flex,
    Grid,
    GridItem,
    IconButton,
    Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Skeleton,
    Spinner,
    Tab,
    TabIndicator,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import {
    AiOutlineSearch,
    AiOutlineUserAdd,
    AiOutlineUsergroupAdd,
} from "react-icons/ai";
import { Socket, io } from "socket.io-client";
import ChatBox from "../components/ChatBox";
import ContactList from "../components/ContactList";
import ConversationList from "../components/ConversationList";
import useAuth from "../hooks/useAuth";
import {
    fetchConversations,
    fetchOrCreateConversation,
} from "../services/conversations";
import { searchUser } from "../services/user";
import useUsers from "../hooks/useUsers";
import { Navigate } from "react-router-dom";
import SocketProvider from "../contexts/SocketContext";
import useUser from "../hooks/useUser";

export default function ChatPage() {
    const { logOut } = useAuth();
    const { currentUser } = useUser();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const toast = useToast();

    const { data: users = [] } = useUsers();

    const {
        status,
        data: conversations = [],
        error,
        isLoading,
    } = useQuery({
        queryKey: ["conversations"],
        queryFn: fetchConversations,
    });

    const {
        status: searchStatus,
        data: searchResult = [],
        // error: searchError,
    } = useQuery({
        queryKey: ["search"],
        queryFn: ({ signal }) => searchUser(searchQuery, { signal }),
        enabled: searchQuery.length != 0,
    });

    const [selectedConversationId, setSelectedConversationId] =
        useState<ConversationId | null>(null);
    const [selectedContactId, setSelectedContactId] = useState<UserId | null>(
        null
    );

    const { status: findOrCreateStatus } = useQuery({
        queryKey: ["conversation", { contact: selectedContactId }],
        queryFn: ({ signal }) =>
            fetchOrCreateConversation(String(selectedContactId), { signal }),
        enabled: !!selectedContactId,
        onSuccess: (res) => {
            client.setQueryData(
                ["conversations"],
                (old?: ConversationPreview[]) => {
                    if (!old) return old;

                    if (res.isDraft) {
                        const id = old.find(
                            (conversation) => conversation.id == res.id
                        );

                        if (id) {
                            return old;
                        } else {
                            return [...old, res];
                        }
                    } else {
                        return old;
                    }
                }
            );

            setSelectedConversationId(res.id);
        },
    });

    const socketRef = useRef<Socket>();
    const client = useQueryClient();

    useEffect(() => {
        if (currentUser && !socketRef.current) {
            const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
                io();

            socket.on("connect", () => {
                socket.emit("socket:setup", currentUser);
            });

            socket.on("socket:connected", () => {
                console.log("Connected to server");
            });

            socket.on("disconnect", (reason) => {
                if (
                    reason === "io server disconnect" ||
                    reason === "io client disconnect"
                ) {
                    console.error("Disconnected, refresh page");
                }

                // auto reconnect
            });

            socket.on(
                "conversation:created",
                (conversation: SingleConversation) => {
                    client.setQueryData(
                        ["conversations"],
                        (old?: ConversationPreview[]) => {
                            if (!old) return old;

                            const exist = old.find(
                                ({ id }) => conversation.id == id
                            );

                            console.log(exist);

                            if (!exist) return [...old, conversation];
                            else {
                                return old.map((c) =>
                                    c.id == conversation.id
                                        ? {
                                              ...c,
                                              latestMessage:
                                                  conversation.latestMessage,
                                          }
                                        : c
                                );
                            }
                        }
                    );

                    client.setQueryData(
                        ["conversation", conversation.id],
                        (old?: SingleConversation) => {
                            if (!old) return old;

                            return conversation;
                        }
                    );
                }
            );

            socket.on(
                "conversation:messages:received",
                (message: Message, conversationId: Conversation["id"]) => {
                    client.setQueryData(
                        ["conversations"],
                        (old?: ConversationPreview[]) => {
                            if (!old) return;

                            return old.map((conversation) =>
                                conversation.id == conversationId
                                    ? {
                                          ...conversation,
                                          latestMessage: message,
                                      }
                                    : conversation
                            );
                        }
                    );
                    client.setQueryData(
                        ["conversation", conversationId],
                        (old?: Conversation) => {
                            if (!old) return;

                            return {
                                ...old,
                                messages: [...old.messages, message],
                            };
                        }
                    );
                }
            );

            socket.on("group:created", async (group) => {
                client.setQueryData(
                    ["conversations"],
                    (old?: ConversationPreview[]) => {
                        if (!old) return old;

                        return [...old, group];
                    }
                );

                toast({
                    title: "Notification",
                    description: "Your have been added to a new group",
                });
            });

            socket.on("group:added", async (group) => {
                client.setQueryData(
                    ["conversations"],
                    (old?: ConversationPreview[]) => {
                        if (!old) return old;

                        return [...old, group];
                    }
                );

                toast({
                    title: "Notification",
                    description: "You have been added to new group",
                });
            });

            socket.on("group:removed", (group) => {
                client.setQueryData(
                    ["conversations"],
                    (old?: ConversationPreview[]) => {
                        if (!old) return old;

                        return old.filter(
                            (conversation) => conversation.id != group.id
                        );
                    }
                );

                toast({
                    title: "Notification",
                    description: "You have been removed from group",
                });
            });

            socket.on("group:deleted", async (group) => {
                client.setQueryData(
                    ["conversations"],
                    (old?: ConversationPreview[]) => {
                        if (!old) return old;

                        return old.filter(
                            (conversation) => conversation.id != group.id
                        );
                    }
                );

                toast({
                    title: "Notification",
                    description: "Your group have been deleted",
                });
            });

            socketRef.current = socket;
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = undefined;
            }
        };
    }, [currentUser, client, toast]);

    if (status === "loading") {
        return (
            <Center w={"100vw"} h={"100vh"}>
                <Spinner />
            </Center>
        );
    }

    if (error) {
        if (isAxiosError(error)) {
            if (error.response && error.response.status === 403) {
                logOut();
                return <Navigate to={"/"} />;
            }
        } else {
            return <Box>Something wrong :( {(error as Error).message}</Box>;
        }
    }

    return (
        <SocketProvider socket={socketRef.current}>
            <Skeleton isLoaded={!isLoading}>
                <Grid
                    h={"100vh"}
                    templateAreas={`"menu chatbox"
                                    "list chatbox"`}
                    templateColumns={"350px minmax(0px, 1fr)"}
                    templateRows={"64px minmax(0, 1fr)"}
                >
                    <GridItem area={"menu"}>
                        <Center h={16} p={2} gap={2}>
                            <Menu>
                                <MenuButton>
                                    <Flex align={"center"} gap={2}>
                                        <Avatar
                                            name={currentUser.displayName}
                                        />
                                        <Text whiteSpace={"nowrap"}>
                                            {currentUser.displayName}
                                        </Text>
                                    </Flex>
                                </MenuButton>

                                <MenuList>
                                    <MenuItem>Profile</MenuItem>
                                    <MenuDivider />
                                    <MenuItem onClick={logOut}>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                            <Divider border={0} />
                            <IconButton
                                icon={<AiOutlineSearch />}
                                aria-label="Search contact"
                            />
                            <IconButton
                                icon={<AiOutlineUserAdd />}
                                aria-label="Add friend"
                            />
                            <IconButton
                                icon={<AiOutlineUsergroupAdd />}
                                aria-label="Create group"
                            />
                        </Center>
                    </GridItem>

                    <GridItem area={"list"}>
                        <Tabs
                            position="relative"
                            variant="unstyled"
                            display={"flex"}
                            flexDir={"column"}
                            h={"full"}
                        >
                            <TabList gap={2} px={2}>
                                <Tab px={0}>Chats</Tab>
                                <Tab px={0}>Contacts</Tab>
                            </TabList>
                            <TabIndicator
                                top={"10"}
                                mt="-1.5px"
                                height="2px"
                                bg="green.400"
                                borderRadius="1px"
                            />
                            <TabPanels h={"full"} py={2} overflowY={"auto"}>
                                <TabPanel p={"0"}>
                                    <ConversationList
                                        conversations={conversations}
                                        onSelectConversation={
                                            setSelectedConversationId
                                        }
                                        selectedConversationId={
                                            selectedConversationId
                                        }
                                    />
                                </TabPanel>
                                <TabPanel p={"0"}>
                                    <ContactList
                                        contacts={users}
                                        onSelectContact={setSelectedContactId}
                                    />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </GridItem>

                    <GridItem area={"chatbox"} px={4}>
                        {selectedConversationId && (
                            <ChatBox conversationId={selectedConversationId} />
                        )}
                    </GridItem>
                </Grid>
            </Skeleton>

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                onCloseComplete={() => {
                    setSearchQuery("");
                    client.removeQueries(["search"]);
                }}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Friends</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody minH={"48"}>
                        <Input
                            placeholder="Search friend"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <Box>
                            {searchStatus === "loading"
                                ? ""
                                : searchResult.length === 0 &&
                                  searchQuery.length == 0
                                ? "Find someone"
                                : searchResult.length === 0
                                ? "No result"
                                : searchResult.map((user) => (
                                      <Box key={user.id}>
                                          {user.displayName}
                                      </Box>
                                  ))}
                        </Box>
                    </ModalBody>

                    {/* <ModalFooter>
                        <Button colorScheme="purple" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant="ghost">Secondary Action</Button>
                    </ModalFooter> */}
                </ModalContent>
            </Modal>
        </SocketProvider>
    );
}
