import {compChatItemClassName, compChatItemDirectionClassName} from '@nlux/core';
import {FC, forwardRef, ReactElement, Ref, useImperativeHandle, useMemo, useRef} from 'react';
import {StreamContainerComp} from '../../logic/StreamContainer/StreamContainerComp';
import {AvatarComp} from '../Avatar/AvatarComp';
import {MessageComp} from '../Message/MessageComp';
import {ChatItemImperativeProps, ChatItemProps} from './props';

export const ChatItemComp: <MessageType>(
    props: ChatItemProps<MessageType>,
    ref: Ref<ChatItemImperativeProps>,
) => ReactElement = function <MessageType>(
    props: ChatItemProps<MessageType>,
    ref: Ref<ChatItemImperativeProps>,
): ReactElement {
    const picture = useMemo(() => {
        if (props.picture === undefined && props.name === undefined) {
            return null;
        }

        return <AvatarComp name={props.name} picture={props.picture}/>;
    }, [props.picture, props.name]);

    const streamContainer = useRef<{
        streamChunk: (chunk: string) => void;
    } | null>(null);

    useImperativeHandle(ref, () => ({
        streamChunk: (chunk: string) => {
            if (streamContainer?.current) {
                streamContainer.current.streamChunk(chunk);
            }
        },
    }), []);

    const isStreaming = useMemo(
        () => props.status === 'streaming',
        [props.status],
    );

    const compDirectionClassName = props.direction
        ? compChatItemDirectionClassName[props.direction]
        : compChatItemDirectionClassName['incoming'];

    const className = `${compChatItemClassName} ${compDirectionClassName}`;
    const TheMessage: FC<{message: MessageType}> = useMemo(() => {
        if (props.customRenderer) {
            if (props.message === undefined) {
                return () => null;
            }

            return () => props.customRenderer ? props.customRenderer({
                message: props.message as MessageType,
            }) : null;
        }

        return () => <>{props.message !== undefined ? props.message : ''}</>;
    }, [props.customRenderer, props.message]);

    const ForwardRefStreamContainerComp = forwardRef(
        StreamContainerComp,
    );

    return (
        <div className={className}>
            {picture}
            {isStreaming && (
                <ForwardRefStreamContainerComp
                    key={'do-not-change'}
                    uid={props.uid}
                    status={'streaming'}
                    direction={props.direction}
                    ref={streamContainer}
                />
            )}
            {!isStreaming && (
                <MessageComp
                    uid={props.uid}
                    message={TheMessage}
                    status={props.status}
                    loader={props.loader}
                    direction={props.direction}
                />
            )}
        </div>
    );
};
