import { useReducer } from "react";
import { AuthContext, AuthState, authReducer } from "./context";

interface AuthProviderProps {
    children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(
        authReducer,
        {
            isAuthenticated: false,
            currentUser: null,
            token: null,
        } as AuthState,
        (initializerArg) => {
            const local = localStorage.getItem("auth");

            if (local) {
                const json = JSON.parse(local);

                return {
                    isAuthenticated: true,
                    currentUser: json.data,
                    token: json.token,
                };
            } else {
                return initializerArg;
            }
        }
    );
    return (
        <AuthContext.Provider value={{ auth: state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
}
