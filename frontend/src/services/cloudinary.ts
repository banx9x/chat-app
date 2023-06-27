export const uploadAvatar = (file: File) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "chat-app");
};
