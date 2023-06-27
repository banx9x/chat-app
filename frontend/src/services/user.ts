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

type UploadProfilePayload = {
    userId: UserId;
    avatar: File;
    displayName: string;
};

export const updateProfile = async (data: UploadProfilePayload) => {
    const formData = new FormData();
    formData.append("avatar", data.avatar);
    formData.append("displayName", data.displayName);

    const res = await client.put<ServerResponse<User>>(
        `/users/${data.userId}/profile`,
        formData
    );

    return res.data.data;
};
