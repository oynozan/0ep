import { model, Schema } from 'mongoose';
import type { IUser } from './userSchema';

type ChannelType = "individual" | "group";

export interface IMessage {
    by: Omit<IUser, "verified">;
    content: string;
    date: Date;
}

export interface IChannel {
    type: ChannelType;
    date: Date;
    messages: IMessage[];
    participants: Array<Omit<IUser, "verified"> & {
        joinDate: Date;
        isCreator: boolean;
        publicKey: string;
    }>;
    sharedKeys: Array<{
        wallet: string;
        key: string;
    }>;
    privateKey: string;
    publicKey: string;
}

const channelSchema = new Schema<IChannel>({
    type: String,
    date: Date,
    participants: [{
        wallet: String,
        joinDate: Date,
        publicKey: String,
        isCreator: {
            type: Boolean,
            default: false,
        },
    }],
    messages: [{
        by: Object,
        content: String,
        date: Date
    }],
    sharedKeys: [{
        wallet: String,
        key: String
    }],
    privateKey: String,
    publicKey: String,
})

const ChannelModel = model('channel', channelSchema);
export default ChannelModel;