import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Divider,
    AbsoluteCenter,
    useToast,
    ToastId,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { ChatIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import useAuth from "../hooks/useAuth";

interface RegisterFormValues {
    displayName: string;
    email: string;
    password: string;
}

export default function RegisterPage() {
    const { loggedIn } = useAuth();
    const { register, handleSubmit } = useForm<RegisterFormValues>();

    const toast = useToast();
    const toastRef = useRef<ToastId>();

    const navigate = useNavigate();

    const registerMutation = useMutation({
        mutationFn: async (data: RegisterFormValues) => {
            const res = await axios.post<ServerResponse<LoginSuccess>>(
                "/api/users/register",
                data
            );

            return res.data.data;
        },
        onSuccess: (res) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            toast.update(toastRef.current!, {
                title: "Register Success",
                description: `Welcome ${res.user.displayName} 🤟`,
                status: "success",
                isClosable: true,
            });

            loggedIn(res);

            navigate("/", {
                replace: true,
            });
        },

        onError: (error: Error | AxiosError) => {
            console.log(error);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            toast.update(toastRef.current!, {
                title: "Register Failed",
                description:
                    axios.isAxiosError(error) && error.response
                        ? (error.response.data as ServerError).error
                        : error.message,
                status: "error",
                isClosable: true,
            });
        },
    });

    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = (values: RegisterFormValues) => {
        toastRef.current = toast({
            title: "Register...",
            status: "loading",
            isClosable: false,
        });
        registerMutation.mutate(values);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Flex
                minH={"100vh"}
                align={"center"}
                justify={"center"}
                bg={useColorModeValue("gray.50", "gray.800")}
            >
                <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
                    <Stack align={"center"}>
                        <Heading fontSize={"4xl"} textAlign={"center"}>
                            Sign up
                        </Heading>
                        <Text fontSize={"lg"} color={"gray.600"}>
                            and start interesting conversations with friends{" "}
                            <ChatIcon color="green.400" />
                        </Text>
                    </Stack>
                    <Box
                        rounded={"lg"}
                        bg={useColorModeValue("white", "gray.700")}
                        boxShadow={"lg"}
                        p={8}
                    >
                        <Stack spacing={4}>
                            <Box>
                                <FormControl id="displayName" isRequired>
                                    <FormLabel>Your name</FormLabel>
                                    <Input
                                        type="text"
                                        {...register("displayName")}
                                    />
                                </FormControl>
                            </Box>
                            <FormControl id="email" isRequired>
                                <FormLabel>Email address</FormLabel>
                                <Input type="email" {...register("email")} />
                            </FormControl>
                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        {...register("password")}
                                    />
                                    <InputRightElement h={"full"}>
                                        <Button
                                            variant={"ghost"}
                                            onClick={() =>
                                                setShowPassword(
                                                    (showPassword) =>
                                                        !showPassword
                                                )
                                            }
                                        >
                                            {showPassword ? (
                                                <ViewIcon />
                                            ) : (
                                                <ViewOffIcon />
                                            )}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <Stack pt={2}>
                                <Button
                                    type="submit"
                                    bg={"green.400"}
                                    color={"white"}
                                    _hover={{
                                        bg: "green.500",
                                    }}
                                    isLoading={registerMutation.isLoading}
                                >
                                    Register
                                </Button>

                                <Box position="relative" padding="4">
                                    <Divider />
                                    <AbsoluteCenter bg="white" px="4">
                                        Already a user?
                                    </AbsoluteCenter>
                                </Box>
                                <Button
                                    as={RouterLink}
                                    to="/login"
                                    bg="blue.400"
                                    color="white"
                                    _hover={{
                                        bg: "blue.500",
                                    }}
                                >
                                    Login
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Flex>
        </form>
    );
}
