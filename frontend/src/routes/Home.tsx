import { useAuth } from "../contexts/auth/hooks";
import UserProvider from "../contexts/user/provider";
import ChatPage from "../pages/Chat";
import HeroPage from "../pages/Hero";

export default function HomePage() {
    const { isAuthenticated, currentUser } = useAuth();

    if (!isAuthenticated) {
        return <HeroPage />;
    } else {
        return (
            <UserProvider user={currentUser}>
                <ChatPage />
            </UserProvider>
        );
    }
}
