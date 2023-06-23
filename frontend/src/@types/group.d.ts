type CreateGroupPayload = {
    groupName: string;
    groupAvatar: string | null;
    participants: UserId[];
};
