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
type ChatType = "individual" | "group" | "imported" | null;
type ChatName = string | null;
type ChatUser = string; // Wallet Address

interface IParticipant {
    wallet: ChatUser;
}

export interface IMessage {
    message: string;
    by: string;
    date: Date; // Date that message was sent
}

interface IChat {
    id: string | null;
    secret: string | null;
    users: Array<IParticipant>; // Chat Participants
    messages: Array<IMessage>;
    read: { [wallet: string]: Date };
}

type EnforceNullFields<T> = T extends { id: null }
    ? {
          type: null;
          title: null;
      }
    : {
          type: ChatType;
          title: ChatName;
      };

type ChatStoreWithoutSet = IChat & EnforceNullFields<IChat>;
type ChatStore = ChatStoreWithoutSet & {
    setChat: (chat: ChatStoreWithoutSet) => void;
    setChatID: (id: string) => void;
    resetChat: () => void;
};

export const useChatStore = create<ChatStore>(set => ({
    id: null,
    type: null,
    title: null,
    secret: null,
    users: [],
    messages: [],
    read: {},
    setChat: (chat: ChatStoreWithoutSet) => set(() => ({ ...chat })),
    setChatID: (id: string) => set(() => ({ id })),
    resetChat: () =>
        set(() => ({
            id: null,
            type: null,
            title: null,
            secret: null,
            users: [],
            messages: [],
        })),
}));

interface IRoom {
    id: string;
    type: string;
    secret: string;
    title: string;
    lastMessage?: IMessage;
}

interface IRooms {
    rooms: IRoom[];
    setRooms: (rooms: IRoom[]) => void;
    addRoom: (room: IRoom) => void;
}

export const useRoomsStore = create<IRooms>(set => ({
    rooms: [],
    setRooms: (rooms: IRoom[]) => set({ rooms }),
    addRoom: (room: IRoom) =>
        set((state: IRooms) => ({
            rooms: [...state.rooms, room],
        })),
}));

// Filter States
interface FilterStore {
    search: string;
    listFilter: "all" | ChatType;
    setListFilter: (type: "all" | ChatType) => void;
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
