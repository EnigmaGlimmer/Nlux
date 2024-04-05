import './App.css';
import {AiChatExpo} from './comp/AiChatExpo.tsx';
import {AvatarExpo} from './comp/AvatarExpo.tsx';
import {ConvItemExpo} from './comp/ConvItemExpo.tsx';
import {LoaderExpo} from './comp/LoaderExpo.tsx';
import {MessageExpo} from './comp/MessageExpo.tsx';
import {PromptBoxExpo} from './comp/PromptBoxExpo.tsx';
import {WelcomeMessageExpo} from './comp/WelcomeMessageExpo.tsx';

function App() {

    return (
        <>
            <h1>Comp React Expo</h1>
            <LoaderExpo/>
            <MessageExpo/>
            <AvatarExpo/>
            <ConvItemExpo/>
            <PromptBoxExpo/>
            <WelcomeMessageExpo/>
            <AiChatExpo/>
        </>
    );
}

export default App;
