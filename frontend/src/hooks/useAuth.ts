import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";

const useAuth = () => {
    const { state, dispatch } = useContext(AuthContext);

    useEffect(() => {
        if (!state) {
            localStorage.removeItem("auth");
        } else {
            localStorage.setItem("auth", JSON.stringify(state));
        }
    }, [state]);

    const loggedIn = (payload: LoginSuccess) => {
        dispatch({ type: "authenticated", payload });
    };

    const updatedProfile = (payload: User) => {
        dispatch({ type: "profileChanged", payload });
    };

    const logOut = () => {
        dispatch({ type: "unauthenticated" });
    };

    return { ...state, loggedIn, updatedProfile, logOut };
};

export default useAuth;
