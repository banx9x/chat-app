import {
    Avatar,
    Box,
    Center,
    IconButton,
    Input,
    Skeleton,
    SkeletonCircle,
    Text,
} from "@chakra-ui/react";
import useUser from "../hooks/useUser";
import { BsImage } from "react-icons/bs";
import { ChangeEvent, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "../services/user";
import useAuth from "../hooks/useAuth";

interface ProfileProps {
    user: User;
}

export default function Profile({ user }: ProfileProps) {
    const { updatedProfile } = useAuth();
    const { currentUser } = useUser();
    const uploadRef = useRef<HTMLInputElement>(null);
    const profile = useMutation({
        mutationFn: updateProfile,
        onSuccess: (res) => {
            updatedProfile(res);
        },
    });

    const isEditable = currentUser.id == user.id;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];

        if (file) {
            profile.mutate({
                userId: currentUser.id,
                avatar: file,
                displayName: currentUser.displayName,
            });
        }
    };

    return (
        <Box pb={4}>
            <Center h={40}>
                <Box pos={"relative"}>
                    <SkeletonCircle size={"32"} isLoaded={!profile.isLoading}>
                        <Avatar
                            size={"2xl"}
                            name={user.displayName}
                            src={user.avatar}
                        />
                    </SkeletonCircle>
                    {isEditable && (
                        <Box>
                            <IconButton
                                pos={"absolute"}
                                right={"0"}
                                bottom={"0"}
                                icon={<BsImage />}
                                rounded={"full"}
                                aria-label="Upload avatar"
                                onClick={() =>
                                    uploadRef.current &&
                                    uploadRef.current.click()
                                }
                            />
                            <Input
                                ref={uploadRef}
                                type="file"
                                hidden
                                accept="image/jpg;image/jpeg;image/png"
                                multiple={false}
                                name="avatar"
                                onChange={handleChange}
                            />
                        </Box>
                    )}
                </Box>
            </Center>

            <Text fontWeight={"medium"} align={"center"}>
                {user.displayName}
            </Text>
            <Text align={"center"}>{user.email}</Text>
        </Box>
    );
}
