/**
 * Global state management
 */

import { create } from "zustand";
import { Wallet, type IWallet } from "./wallet";

// User States
export interface IUser {
    wallet: string;
    verified: boolean;
}

interface UserStore {
    user: IUser | null;
    setUser: (user: IUser | null) => void;
}

export const useUserStore = create<UserStore>(set => ({
    user: null,
    setUser: (user: IUser | null) => set(() => ({ user })),
}));

// Wallet State
interface WalletStore {
    wallet: IWallet;
    setWallet: (wallet: IWallet) => void;
}

export const useWalletStore = create<WalletStore>(set => ({
    wallet: new Wallet("keplr"), // Keplr is the default wallet for now
    setWallet: (wallet: IWallet) => set(() => ({ wallet })),
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
    setChat: (chat: ChatStoreWithoutSet) => set(() => ({ ...chat })),
}));

interface IRoom {
    id: string;
    key: CryptoKey;
}

interface IRooms {
    rooms: IRoom[];
    addRoom: (room: IRoom) => void;
}

export const useRoomsStore = create<IRooms>(set => ({
    rooms: [],
    addRoom: (room: IRoom) => set((state: IRooms) => ({
        rooms: [...state.rooms, room]
    }))
}))

// Filter States
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
