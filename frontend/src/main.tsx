import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import HomePage from "./routes/Home.tsx";
import LoginPage from "./routes/Login.tsx";
import RegisterPage from "./routes/Register.tsx";
import AuthProvider from "./contexts/auth/provider.tsx";

const client = new QueryClient();

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
        errorElement: <div>Something wrong</div>,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <AuthProvider>
            <ChakraProvider>
                <QueryClientProvider client={client}>
                    <RouterProvider router={router} />
                    <ReactQueryDevtools />
                </QueryClientProvider>
            </ChakraProvider>
        </AuthProvider>
    </React.StrictMode>
);
