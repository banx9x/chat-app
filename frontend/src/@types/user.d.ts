interface User {
    id: string;
    displayName: string;
    avatar?: string;
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
