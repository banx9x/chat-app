import { lazy } from "react";
import useAuth from "../hooks/useAuth";
import HeroPage from "../pages/Hero";
const ChatPage = lazy(() => import("../pages/Chat"));

export default function HomePage() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <HeroPage />;
    } else {
        return <ChatPage />;
    }
}
