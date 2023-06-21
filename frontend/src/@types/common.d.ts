interface ServerResponse<T> {
    data: T;
}

interface ServerError {
    error: string;
}
