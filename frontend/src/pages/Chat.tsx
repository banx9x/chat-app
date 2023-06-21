import { ArrowLeftIcon } from "@chakra-ui/icons";
import {
    Avatar,
    Box,
    Center,
    Divider,
    Flex,
    Grid,
    GridItem,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Skeleton,
    Spinner,
    Tab,
    TabIndicator,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useBoolean,
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
import ConversationList from "../components/ConversationList";
import Options from "../components/Options";
import SearchContactBox from "../components/SearchContactBox";
import { useAuth } from "../contexts/auth/hooks";
import { useUser } from "../contexts/user/hooks";
import { fetchConversations } from "../services/conversations";
import { searchUser } from "../services/user";

export default function ChatPage() {
    const { loggedOut } = useAuth();
    const { user } = useUser();
    const [showSearchContact, { on, off }] = useBoolean(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

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
        error: searchError,
    } = useQuery({
        queryKey: ["search", searchQuery],
        queryFn: ({ signal }) => searchUser(searchQuery, { signal }),
        enabled: searchQuery.length != 0,
    });

    const [selectedConversationId, setSelectedConversationId] =
        useState<Conversation["id"]>();

    const socketRef = useRef<Socket>();
    const client = useQueryClient();

    useEffect(() => {
        if (user && !socketRef.current) {
            const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
                io("http://localhost:3000/");

            socket.on("connect", () => {
                socket.emit("setup", user);
            });

            socket.on("connected", () => {
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
                "receivedMessage",
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

            socketRef.current = socket;
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = undefined;
            }
        };
    }, [user, client]);

    if (status === "loading") {
        return (
            <Center w={"100vw"} h={"100vh"}>
                <Spinner />
            </Center>
        );
    }

    if (error) {
        if (isAxiosError(error)) {
            if (error.response?.status === 403) {
                loggedOut();
                return null;
            }
        } else {
            return <Box>Something wrong :( {(error as Error).message}</Box>;
        }
    }

    return (
        <Box>
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
                                        <Avatar name={user.username} />
                                        <Text whiteSpace={"nowrap"}>
                                            {user.username}
                                        </Text>
                                    </Flex>
                                </MenuButton>

                                <MenuList>
                                    <MenuItem>Profile</MenuItem>
                                    <MenuDivider />
                                    <MenuItem>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                            <Divider border={0} />
                            {/* <SearchContactBox
                                onFocus={on}
                                onBlur={off}
                                onChange={setSearchQuery}
                            /> */}
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
                        <Tabs position="relative" variant="unstyled" h={"full"}>
                            <TabList gap={2} px={2}>
                                <Tab px={0}>Chats</Tab>
                                <Tab px={0}>Contacts</Tab>
                            </TabList>
                            <TabIndicator
                                mt="-1.5px"
                                height="2px"
                                bg="green.400"
                                borderRadius="1px"
                            />
                            <TabPanels flex={1} py={2}>
                                <TabPanel
                                    p={0}
                                    h={"full"}
                                    overflowY={"auto"}
                                    overscrollBehavior={"contain"}
                                >
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
                                <TabPanel>
                                    <p>Contacts</p>
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
        </Box>
    );
}
