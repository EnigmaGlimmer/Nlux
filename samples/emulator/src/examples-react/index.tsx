import {ConvoPit} from '@nlux/nlux-react';
import {useAdapter} from '@nlux/openai-react';
import React, {useCallback, useState} from 'react';
import {createRoot} from 'react-dom/client';

const apiKey = 'YOUR_API_KEY_HERE';

const ExampleWrapper = () => {
    const [height, setHeight] = useState<number>(550);
    const [key, setKey] = useState<number>(0);
    const handleRandomContainerHeight = useCallback(() => {
        const newHeight = Math.floor(Math.random() * 1000);
        setHeight(newHeight);
    }, []);

    const adapter = useAdapter('openai/gpt', {
        apiKey,
        // model: 'gpt-3.5-turbo',
        dataExchangeMode: 'stream',
        // dataExchangeMode: 'fetch',
        initialSystemMessage: 'Act as a Nobel Prize in Physics winner who is helping a PHD student in their research',
    });

    if (!adapter) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <span>{key}</span>
            <button onClick={() => setKey(key + 1)}>Reset</button>
            <button onClick={handleRandomContainerHeight}>Random Container Height</button>
            <ConvoPit
                key={key}
                className="chat-emulator"
                adapter={adapter}
                containerMaxHeight={height}
                // Optional: Instruct ChatGPT how to behave during the conversation.
                promptBoxOptions={{
                    placeholder: 'Tell me ?',
                    autoFocus: true,
                }}
            />,
        </>
    );
};

export default () => {
    const root = document.getElementById('convopit-root');
    if (!root) {
        throw new Error('Root element not found');
    }

    const reactRoot = createRoot(root);
    reactRoot.render(
        <React.StrictMode>
            <ExampleWrapper/>
        </React.StrictMode>,
    );
};
