import { createContext, useReducer } from "react";

export interface Authenticated {
    currentUser: User;
    token: string;
}

export type AuthState = Authenticated | null;

export type AuthAction =
    | { type: "authenticated"; payload: LoginSuccess }
    | { type: "profileChanged"; payload: User }
    | { type: "unauthenticated" };

export interface AuthContextObject {
    state: AuthState;
    dispatch: React.Dispatch<AuthAction>;
}

export const AuthContext = createContext<AuthContextObject>(
    {} as AuthContextObject
);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case "authenticated": {
            return {
                currentUser: action.payload.user,
                token: action.payload.token,
            };
        }

        case "profileChanged": {
            if (!state) return state;

            console.log(action.payload);

            return {
                currentUser: action.payload,
                token: state.token,
            };
        }

        case "unauthenticated": {
            return null;
        }

        default: {
            throw new Error("Unsupported action");
        }
    }
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(
        authReducer,
        null,
        (initializerArg) => {
            const local = localStorage.getItem("auth");

            if (local) {
                const json = JSON.parse(local);

                return {
                    currentUser: json.currentUser,
                    token: json.token,
                };
            } else {
                return initializerArg;
            }
        }
    );

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
}
