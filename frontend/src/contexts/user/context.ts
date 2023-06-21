import { createContext } from "react";

export interface UserState {
    user: User;
}

export const UserContext = createContext<UserState>({} as UserState);
