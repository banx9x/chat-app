import axios from "axios";
import { AuthState, Authenticated } from "../contexts/AuthContext";

const client = axios.create({
    baseURL: "/api",
});

client.defaults.headers.common["Content-Type"] = "application/json";

client.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        const localData = localStorage.getItem("auth");

        if (localData) {
            const data = JSON.parse(localData) as Authenticated;

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
