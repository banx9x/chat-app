import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../services/user";

const useUsers = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
    });
};

export default useUsers;
