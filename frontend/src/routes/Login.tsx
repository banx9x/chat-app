import { ChatIcon } from "@chakra-ui/icons";
import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Stack,
    Link,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Divider,
    AbsoluteCenter,
    useToast,
    ToastId,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

interface LoginFormValues {
    email: string;
    password: string;
    remember: boolean;
}

export default function LoginPage() {
    const { loggedIn } = useAuth();
    const { register, handleSubmit } = useForm<LoginFormValues>();

    const toast = useToast();
    const toastRef = useRef<ToastId>();

    const navigate = useNavigate();

    const login = useMutation({
        mutationFn: async (credential: LoginFormValues) => {
            const res = await axios.post<ServerResponse<LoginSuccess>>(
                "/api/users/login",
                credential
            );

            return res.data.data;
        },

        onSuccess: (res) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            toast.update(toastRef.current!, {
                title: "Login Success",
                description: `Welcome back ${res.user.displayName} 🤟`,
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
                title: "Login Failed",
                description:
                    axios.isAxiosError(error) && error.response
                        ? (error.response.data as ServerError).error
                        : error.message,
                status: "error",
                isClosable: true,
            });
        },
    });

    const onSubmit = (values: LoginFormValues) => {
        toastRef.current = toast({
            title: "Login...",
            description: "",
            status: "loading",
            isClosable: false,
        });
        login.mutate(values);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Flex
                minH="100vh"
                align="center"
                justify="center"
                bg={useColorModeValue("gray.50", "gray.800")}
            >
                <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
                    <Stack align="center">
                        <Heading fontSize="4xl">
                            Sign in to your account
                        </Heading>
                        <Text fontSize="lg" color="gray.600">
                            and start interesting conversations with friends{" "}
                            <ChatIcon color="green.400" />
                        </Text>
                    </Stack>
                    <Box
                        rounded="lg"
                        bg={useColorModeValue("white", "gray.700")}
                        boxShadow="lg"
                        p={8}
                    >
                        <Stack spacing={4}>
                            <FormControl id="email">
                                <FormLabel>Email address</FormLabel>
                                <Input
                                    type="email"
                                    {...register("email", {})}
                                />
                            </FormControl>
                            <FormControl id="password">
                                <FormLabel>Password</FormLabel>
                                <Input
                                    type="password"
                                    {...register("password")}
                                />
                            </FormControl>
                            <Stack spacing={10}>
                                <Stack
                                    direction={{ base: "column", sm: "row" }}
                                    align="start"
                                    justify="space-between"
                                >
                                    <Checkbox {...register("remember")}>
                                        Remember me
                                    </Checkbox>
                                    <Link color="blue.400">
                                        Forgot password?
                                    </Link>
                                </Stack>
                                <Stack>
                                    <Button
                                        type="submit"
                                        bg="green.400"
                                        color="white"
                                        _hover={{
                                            bg: "green.500",
                                        }}
                                        isLoading={login.isLoading}
                                    >
                                        Login
                                    </Button>
                                    <Box position="relative" padding="4">
                                        <Divider />
                                        <AbsoluteCenter bg="white" px="4">
                                            Need an account?
                                        </AbsoluteCenter>
                                    </Box>
                                    <Button
                                        as={RouterLink}
                                        to="/register"
                                        bg="blue.400"
                                        color="white"
                                        _hover={{
                                            bg: "blue.500",
                                        }}
                                    >
                                        Register
                                    </Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Flex>
        </form>
    );
}
