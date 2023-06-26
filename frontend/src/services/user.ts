import { AxiosRequestConfig } from "axios";
import client from "./client";

export const fetchUsers = async (options?: AxiosRequestConfig) => {
    const res = await client.get<ServerResponse<User[]>>("/users", options);

    return res.data.data;
};

export const searchUser = async (
    query: string,
    options: AxiosRequestConfig
) => {
    const res = await client.get<ServerResponse<User[]>>("/users/search", {
        ...options,
        params: { search: query },
    });

    return res.data.data;
};
