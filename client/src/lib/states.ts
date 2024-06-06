/**
 * Global state management
 */

import { create } from "zustand";

// User States
export interface IUser {
    wallet: string;
}

interface UserStore {
    user: IUser | null;
    setUser: (user: IUser) => void
}

export const useUserStore = create<UserStore>(set => ({
    user: null,
    setUser: (user: IUser) => set(() => ({ user }))
}));

// Chat States
type ChatType = "single" | "group" | null;
type ChatName = string | null;
type ChatUser = string; // Wallet Address

interface IParticipant {
    username: ChatUser;
}

interface IMessage {
    message: string;
    from: ChatUser;
    chatID: string;
    time: Date; // Date that message was sent
}

interface IChat {
    id: string | null;
    users: Array<IParticipant>; // Chat Participants
    messages: Array<IMessage>;
}

type EnforceNullFields<T> = T extends { id: null }
    ? {
          type: null;
          name: null;
      }
    : {
          type: ChatType;
          name: ChatName;
      };

type ChatStoreWithoutSet = IChat & EnforceNullFields<IChat>;
type ChatStore = ChatStoreWithoutSet & {
    setChat: (chat: ChatStoreWithoutSet) => void;
};

export const useChatStore = create<ChatStore>(set => ({
    id: null,
    type: null,
    name: null,
    users: [],
    messages: [],
    setChat: (chat: ChatStoreWithoutSet) => set(() => ({ ...chat }))
}));

// Filters
interface FilterStore {
    search: string;
    listFilter: "all" | "groups" | "imported";
    setListFilter: (type: "all" | "groups" | "imported") => void;
    setSearch: (search: string) => void;
}

export const useFilterStore = create<FilterStore>(set => ({
    search: "",
    listFilter: "all",
    setListFilter: listFilter => set(() => ({ listFilter })),
    setSearch: search => set(() => ({ search })),
}));

// Modal States
interface ModalStore {
    modal: "custom" | "login" | null;
    options: any;
    loading: boolean;
    setModal: (type: "custom" | "login" | null, options: any) => void;
    setLoading: (loading: boolean) => void;
}

export const useModalStore = create<ModalStore>(set => ({
    modal: null,
    options: {},
    loading: false,
    setModal: (type, options = {}) =>
        set(() => ({
            modal: type,
            options: options,
        })),
    setLoading: loading => set(() => ({ loading })),
}));