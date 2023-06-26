import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const useUser = () => {
    const { state } = useContext(AuthContext);

    if (!state) {
        throw new Error("No user in context");
    }

    return state;
};

export default useUser;
