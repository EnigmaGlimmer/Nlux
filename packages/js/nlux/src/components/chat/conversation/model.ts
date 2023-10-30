import {Observable} from '../../../core/bus/observable.ts';
import {BaseComp} from '../../../core/comp/base.ts';
import {CompEventListener, Model} from '../../../core/comp/decorators.ts';
import {CompList} from '../../list/model.ts';
import {messageInList, textMessage} from '../chat-room/utils/textMessage.ts';
import {CompTextMessage} from '../text-message/model.ts';
import type {TextMessageContentLoadingStatus} from '../text-message/types.ts';
import {renderConversation} from './render.ts';
import {
    CompConversationActions,
    CompConversationElements,
    CompConversationEvents,
    CompConversationProps,
} from './types.ts';
import {updateConversation} from './update.ts';

@Model('conversation', renderConversation, updateConversation)
export class CompConversation extends BaseComp<
    CompConversationProps, CompConversationElements, CompConversationEvents, CompConversationActions
> {
    private autoScrollToStreamingMessage: boolean = true;

    private handleMessageStatusUpdatedFactory = (onMessageStatusUpdated?: (messageId: string, status: TextMessageContentLoadingStatus) => void) => {
        return (messageId: string, status: TextMessageContentLoadingStatus) => {
            onMessageStatusUpdated?.(messageId, status);
            if (status === 'streaming' || status === 'loading') {
                requestAnimationFrame(() => {
                    this.markMessageAsStreaming(messageId);
                });
            }

            if (status === 'loaded' || status === 'error') {
                requestAnimationFrame(() => {
                    this.markMessageAsNotStreaming(messageId);
                });
            }

            const message = this.getMessageById(messageId);
            if (status === 'loaded' && message && message.contentLoadingMode === 'promise') {
                message.scrollToMessage();
            }
        };
    };

    private messagesBeingStreamed: Set<string> = new Set();
    private messagesBeingStreamedResizeListeners: Map<string, Function> = new Map();
    private messagesList: CompList<CompTextMessage> | undefined;

    constructor(instanceId: string, props: CompConversationProps) {
        super(instanceId, props);
        this.addConversation();
    }

    public addMessage(
        direction: 'in' | 'out',
        source: string | Promise<string> | Observable<string>,
        createdAt: Date,
        onMessageStatusUpdated?: (messageId: string, status: TextMessageContentLoadingStatus) => void,
    ): string {
        const handleMessageStatusUpdated = this.handleMessageStatusUpdatedFactory(onMessageStatusUpdated);

        const message = textMessage(
            direction,
            source,
            createdAt,
            handleMessageStatusUpdated,
        );

        this.messagesList?.appendComponent(message, messageInList);
        requestAnimationFrame(() => message.scrollToMessage());

        return message.id;
    }

    public getMessageById(messageId: string): CompTextMessage | undefined {
        return this.messagesList?.getComponentById(messageId);
    }

    public markMessageAsNotStreaming(messageId: string) {
        const onResizeListener = this.messagesBeingStreamedResizeListeners.get(messageId);
        this.messagesBeingStreamed.delete(messageId);
        this.messagesBeingStreamedResizeListeners.delete(messageId);

        const message = this.getMessageById(messageId);
        if (!message || !onResizeListener) {
            return;
        }

        message.removeResizeListener(onResizeListener);
    }

    public removeMessage(messageId: string) {
        this.messagesList?.removeComponentById(messageId);
    }

    private addConversation() {
        this.messagesList = new CompList<CompTextMessage>('conversation', {});
        this.addSubComponent(this.messagesList.id, this.messagesList, 'messagesContainer');
    }

    private createMessageResizedListener(messageId: string) {
        const message = this.getMessageById(messageId);
        if (!message) {
            return;
        }

        return () => {
            if (this.autoScrollToStreamingMessage &&
                this.messagesBeingStreamed.size === 1 &&
                this.messagesBeingStreamed.has(messageId)
            ) {
                message.scrollToMessage();
            }
        };
    }

    @CompEventListener('user-scrolled')
    private handleUserScrolled({scrolledToBottom}: {scrolledToBottom: boolean}) {
        this.autoScrollToStreamingMessage = scrolledToBottom;
    }

    private markMessageAsStreaming(messageId: string) {
        const message = this.getMessageById(messageId);
        if (!message || this.messagesBeingStreamed.has(messageId)) {
            return;
        }

        this.messagesBeingStreamed.add(messageId);
        const messageResizedListener = this.createMessageResizedListener(messageId);
        if (messageResizedListener) {
            this.messagesBeingStreamedResizeListeners.set(messageId, messageResizedListener);
            message.onResize(messageResizedListener);

            // Max time to keep message marked as streaming is 2 minutes
            // If the message is not marked as not streaming after 2 minutes, it will be marked as not streaming
            // so that the conversation box does not keep scrolling to the end of the message forever.
            setTimeout(() => {
                this.markMessageAsNotStreaming(messageId);
            }, 120000);
        }
    }
}
