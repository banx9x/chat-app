import { UserContext } from "./context";

interface UserProviderProps {
    user: User;
    children: React.ReactNode;
}

export default function UserProvider({ user, children }: UserProviderProps) {
    return (
        <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
    );
}
