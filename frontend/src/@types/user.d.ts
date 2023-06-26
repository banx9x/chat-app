interface User {
    id: string;
    displayName: string;
    avatar: string | null;
    email: string;
    friends: User[];
    createdAt: string;
    updatedAt: string;
}

type UserId = User["id"];

interface LoginSuccess {
    user: User;
    token: string;
}
