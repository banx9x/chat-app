import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./routes/Home.tsx";
import LoginPage from "./routes/Login.tsx";
import RegisterPage from "./routes/Register.tsx";
import AuthProvider from "./contexts/AuthContext.tsx";

const client = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: false,
        },
    },
});

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
            <ChakraProvider
                toastOptions={{
                    defaultOptions: { position: "top", duration: 10000 },
                }}
            >
                <QueryClientProvider client={client}>
                    <RouterProvider router={router} />

                    <ReactQueryDevtools />
                </QueryClientProvider>
            </ChakraProvider>
        </AuthProvider>
    </React.StrictMode>
);
