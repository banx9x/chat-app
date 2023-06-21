import axios from "axios";
import { AuthState } from "../contexts/auth/context";

const client = axios.create({
    baseURL: "/api",
});

client.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        const localData = localStorage.getItem("auth");

        if (localData) {
            const data = JSON.parse(localData) as AuthState;

            config.headers.setAuthorization(`Bearer ${data.token}`);
        } else {
            config.headers.setAuthorization(null);
        }

        return config;
    },
    function (error) {
        console.log(error);
        // Do something with request error
        return Promise.reject(error);
    }
);

export default client;
