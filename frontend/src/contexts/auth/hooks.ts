import { useContext } from "react";
import { AuthContext } from "./context";

const useAuth = () => {
    const { auth, dispatch } = useContext(AuthContext);

    const loggedIn = (payload: LoginSuccess) => {
        localStorage.setItem("auth", JSON.stringify(payload));
        dispatch({ type: "authenticated", payload });
    };

    const loggedOut = () => {
        localStorage.removeItem("auth");
        dispatch({ type: "unauthenticated" });
    };

    return { ...auth, loggedIn, loggedOut };
};

export { useAuth };
