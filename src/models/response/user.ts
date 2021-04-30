export interface IFriend {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
}

export interface IGroup {
    id: string;
    name: string;
    userIds: string[];
    createdUserId: string;
}
