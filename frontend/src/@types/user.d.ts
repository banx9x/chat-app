interface User {
    id: string;
    username: string;
    email: string;
    friends: User[];
    createdAt: string;
    updatedAt: string;
}

interface LoginSuccess {
    data: User;
    token: string;
}

interface LoginFailed {
    error: string;
}
