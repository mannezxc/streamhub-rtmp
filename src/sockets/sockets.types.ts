export type OnlineUser = {
    socketId: string
    user: {
        userId: string
        login: string
        color: string
    } | null
}