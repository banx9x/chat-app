import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const useAuth = () => {
    const { state, dispatch } = useContext(AuthContext);

    const loggedIn = (payload: LoginSuccess) => {
        localStorage.setItem("auth", JSON.stringify(payload));
        dispatch({ type: "authenticated", payload });
    };

    const logOut = () => {
        localStorage.removeItem("auth");
        dispatch({ type: "unauthenticated" });
    };

    return { ...state, loggedIn, logOut };
};

export default useAuth;
