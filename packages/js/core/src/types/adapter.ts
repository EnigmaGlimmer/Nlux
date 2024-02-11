import {ConversationItem} from './conversation';
import {AiChatProps} from './props';

/**
 * This type is used to indicate the mode in which the adapter should request data from the API.
 */
export type DataTransferMode = 'stream' | 'fetch';

/**
 * This interface exposes methods that should be implemented by any adapter to connect the AiChat component
 * to any API or AI backend.
 */
export interface Adapter {
    /**
     * This method should be implemented by any adapter that wants to request data from the API in fetch mode.
     * It should return a promise that resolves to the response from the API.
     * Either this method or `streamText` (or both) should be implemented by any adapter.
     *
     * @param `string` message
     * @param `AdapterExtras` extras
     * @returns Promise<string>
     */
    fetchText?: (message: string, extras: AdapterExtras) => Promise<string>;

    /**
     * This method should be implemented by any adapter to be used with NLUX.
     * Either this method or `fetchText` (or both) should be implemented by any adapter.
     *
     * @param {string} message
     * @param {StreamingAdapterObserver} observer
     * @param {AdapterExtras} extras
     */
    streamText?: (message: string, observer: StreamingAdapterObserver, extras: AdapterExtras) => void;
}

/**
 * This interface is used to capture the stream of data being generated by the API and send it to the AiChat
 * user interface as it's being generated.
 */
export interface StreamingAdapterObserver {
    /**
     * This method should be called by the adapter when it has completed sending data to the AiChat user interface.
     * This will result in the AiChat component removing the loading indicator and resetting the conversation
     * text input.
     */
    complete(): void;

    /**
     * This method should be called by the adapter when it has an error to send to the AiChat user interface.
     * This will result in the AiChat component displaying an error message to the user, resetting the
     * conversation text input, removing the loading indicator, removing the sent message from the conversation.
     *
     * The error will be logged to the console but it will not be displayed to the user. A generic error message
     * will be displayed to the user instead.
     *
     * @param {Error} error
     */
    error(error: Error): void;

    /**
     * This method should be called by the adapter when it has new data to send to the AiChat user interface.
     * @param {string} message
     */
    next(message: string): void;
}

/**
 * Additional data sent to the adapter when a message is sent.
 */
export type AdapterExtras = {
    /**
     * This attribute contains the properties used with the AiChat component.
     */
    aiChatProps: AiChatProps;

    /**
     * This attribute contains the conversation history.
     * It's only included if the `conversationOptions.historyPayloadSize` is set to a positive number or 'all'.
     */
    conversationHistory?: Readonly<ConversationItem[]>;
}
