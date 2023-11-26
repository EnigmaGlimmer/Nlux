import {AdapterBuilder, DataTransferMode, StandardAdapter} from '@nlux/nlux';

export interface OpenAiAdapterBuilder extends AdapterBuilder<any, any> {
    /**
     * Create a new ChatGPT API adapter.
     * Adapter users don't need to call this method directly. It will be called by Nlux when the adapter is expected
     * to be created.
     *
     * @returns {StandardAdapter}
     */
    create(): StandardAdapter<any, any>;
    /**
     * The API key to use to connect to ChatGPT API.
     * This is secret and should not be shared publicly or hosted when deploying your application.
     *
     * @optional
     * @param {string} apiKey
     * @returns {AdapterBuilder}
     */
    withApiKey(apiKey: string): OpenAiAdapterBuilder;
    /**
     * Instruct the adapter to connect to API and load data either in streaming mode or in fetch mode.
     * The `stream` mode would use protocols such as websockets or server-side events, and Nlux will display data as
     * it's being generated by the server. The `fetch` mode would use a single request to fetch data, and the response
     * would only be displayed once the entire message is loaded.
     *
     * @optional
     * @default 'stream'
     * @returns {AdapterBuilder}
     */
    withDataTransferMode(mode: DataTransferMode): OpenAiAdapterBuilder;
    /**
     * The model or the endpoint to use for ChatGPT Inference API.
     * You should provide either a model or an endpoint, but not both.
     * For more information, please refer to the
     * [Nlux ChatGPT documentation](https://docs.nlux.ai/category/nlux-with-openai-face).
     *
     * @param {string} model
     * @returns {AdapterBuilder}
     */
    withModel(model: string): OpenAiAdapterBuilder;
    /**
     * The initial system to send to ChatGPT API.
     *
     * @optional
     * @param {string} message
     * @returns {AdapterBuilder}
     */
    withSystemMessage(message: string): OpenAiAdapterBuilder;
}
