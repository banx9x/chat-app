import React from "react";
import { Socket } from "socket.io-client";

type SocketContextObject = {
    socket?: Socket<ServerToClientEvents, ClientToServerEvents>;
};

export const SocketContext = React.createContext<SocketContextObject>(
    {} as SocketContextObject
);

export type SocketContextProviderProps = {
    socket?: Socket;
    children: React.ReactNode;
};

export default function SocketProvider({
    socket,
    children,
}: SocketContextProviderProps) {
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}
