import { createContext } from "react";

export interface AuthenticatedState {
    isAuthenticated: true;
    currentUser: User;
    token: string;
}

export interface UnauthenticatedState {
    isAuthenticated: false;
    currentUser: null;
    token: null;
}

export type AuthState = AuthenticatedState | UnauthenticatedState;

type AuthAction =
    | { type: "authenticated"; payload: LoginSuccess }
    | { type: "unauthenticated" };

interface AuthContextObject {
    auth: AuthState;
    dispatch: React.Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextObject>({} as AuthContextObject);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case "authenticated": {
            return {
                isAuthenticated: true,
                currentUser: action.payload.data,
                token: action.payload.token,
            };
        }

        case "unauthenticated": {
            return {
                isAuthenticated: false,
                currentUser: null,
                token: null,
            };
        }

        default: {
            return state;
        }
    }
};

export { AuthContext, authReducer };
