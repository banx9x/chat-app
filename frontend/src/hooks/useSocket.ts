import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";

const useSocket = () => {
    const { socket } = useContext(SocketContext);

    if (!socket) {
        throw new Error("Socket error");
    }

    return socket;
};

export default useSocket;
