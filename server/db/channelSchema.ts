import { model, Schema } from "mongoose";

type ChannelType = "individual" | "group" | "imported";

export interface IMessage {
    by: string; // Wallet address
    message: string;
    date: Date;
}

export interface IChannel {
    type: ChannelType;
    date: Date;
    name?: string;
    messages: IMessage[];
    participants: Array<{
        wallet: string;
        joinDate: Date;
    }>;
    secret: string;
}

const channelSchema = new Schema<IChannel>({
    type: String,
    date: Date,
    name: String,
    messages: [
        new Schema(
            {
                by: Object,
                message: String,
                date: Date,
            },
            { _id: false }
        ),
    ],
    participants: [
        new Schema(
            {
                wallet: String,
                joinDate: Date,
            },
            { _id: false }
        ),
    ],
    secret: String,
});

const ChannelModel = model("channel", channelSchema);
export default ChannelModel;
