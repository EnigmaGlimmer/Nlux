import {registerAllComponents} from '../components/components';
import {NluxAdapter} from '../types/adapter';
import {AdapterBuilder} from '../types/adapterBuilder';
import {Adapter, PromiseAdapter, StreamingAdapter} from '../types/adapterInterface';
import {NluxProps} from '../types/props';
import {debug, warn} from '../x/debug';
import {NluxController} from './controller/controller';
import {NluxRenderingError, NluxUsageError, NluxValidationError} from './error';
import {INluxConvo} from './interface';
import {ConversationOptions} from './options/conversationOptions';
import {LayoutOptions} from './options/layoutOptions';
import {PromptBoxOptions} from './options/promptBoxOptions';

export class NluxConvo implements INluxConvo {
    protected theAdapter: Adapter | null = null;
    protected theAdapterBuilder: NluxAdapter<any, any> | null = null;
    protected theAdapterType: 'builder' | 'instance' | null = null;
    protected theClassName: string | null = null;
    protected theConversationOptions: ConversationOptions | null = null;
    protected theLayoutOptions: LayoutOptions | null = null;
    protected thePromptBoxOptions: PromptBoxOptions | null = null;
    private controller: NluxController | null = null;

    public get mounted(): boolean {
        return this.controller?.mounted ?? false;
    }

    hide() {
        if (!this.controller) {
            throw new NluxRenderingError({
                source: this.constructor.name,
                message: 'Unable to hide. NLUX is not mounted.',
            });
        }

        this.controller.hide();
    }

    public mount(rootElement: HTMLElement) {
        if (this.mounted) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to create NLUX instance. NLUX is already mounted. '
                    + 'Make sure to call `unmount()` before mounting again.',
            });
        }

        const adapterToUser: Adapter | NluxAdapter<any, any> | null =
            this.theAdapter && this.theAdapterType === 'instance' ? this.theAdapter
                : (this.theAdapterType === 'builder' && this.theAdapterBuilder)
                    ? this.theAdapterBuilder
                    : null;

        if (!adapterToUser) {
            throw new NluxValidationError({
                source: this.constructor.name,
                message: 'Unable to create NLUX instance. Adapter is not properly set. '
                    + 'You should call `withAdapter(adapter)` method before mounting NLUX.',
            });
        }

        registerAllComponents();

        rootElement.innerHTML = '';
        const controller = new NluxController(
            adapterToUser,
            rootElement,
            {
                themeId: 'kensington', // Hardcoded for now - TODO: Make configurable
                className: this.theClassName ?? undefined,
                layoutOptions: this.theLayoutOptions ?? {},
                promptBoxOptions: this.thePromptBoxOptions ?? {},
                conversationOptions: this.theConversationOptions ?? {},
            },
        );

        controller.mount();

        if (controller.mounted) {
            this.controller = controller;
        } else {
            throw new NluxRenderingError({
                source: this.constructor.name,
                message: 'NluxConvo root component did not render.',
            });
        }
    };

    show() {
        if (!this.controller) {
            throw new NluxRenderingError({
                source: this.constructor.name,
                message: 'Unable to show. NLUX is not mounted.',
            });
        }

        this.controller.show();
    }

    public unmount() {
        debug('Unmounting NLUX.');

        if (!this.controller) {
            warn('Invalid call to nluxConvo.unmount() on an already unmounted NLUX instance!');
            return;
        }

        this.controller.unmount();
        if (this.controller.mounted) {
            throw new NluxRenderingError({
                source: this.constructor.name,
                message: 'Unable to unmount. Root component did not unmount.',
            });
        }

        this.controller = null;
    }

    public updateProps(props: NluxProps) {
        if (!this.controller) {
            throw new NluxRenderingError({
                source: this.constructor.name,
                message: 'Unable to update props. NLUX is not mounted.',
            });
        }

        this.controller.updateProps(props);
    }

    public withAdapter(adapter: StreamingAdapter | PromiseAdapter | AdapterBuilder<any, any>) {
        if (this.mounted) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to set adapter. NLUX is already mounted.',
            });
        }

        if (this.theAdapterBuilder || this.theAdapter) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to change config. A adapter or adapter builder was already set.',
            });
        }

        if (typeof adapter !== 'object' || adapter === null) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to set adapter. Invalid adapter or adapter-builder type.',
            });
        }

        const anAdapterOrAdapterBuilder = adapter as any;

        if (typeof anAdapterOrAdapterBuilder.create === 'function') {
            this.theAdapterType = 'builder';
            this.theAdapterBuilder = anAdapterOrAdapterBuilder.create();
            return this;
        }

        if (typeof anAdapterOrAdapterBuilder.send === 'function') {
            this.theAdapterType = 'instance';
            this.theAdapter = anAdapterOrAdapterBuilder;
            return this;
        }

        throw new NluxUsageError({
            source: this.constructor.name,
            message: 'Unable to set adapter. Invalid adapter or adapter-builder implementation.',
        });
    };

    public withClassName(className: string) {
        if (this.mounted) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to set class name. NLUX is already mounted.',
            });
        }

        if (this.theClassName) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to change config. A class name was already set.',
            });
        }

        this.theClassName = className;
        return this;
    }

    public withConversationOptions(conversationOptions: ConversationOptions) {
        if (this.mounted) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to set conversation options. NLUX is already mounted.',
            });
        }

        if (this.theConversationOptions) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to change config. Conversation options were already set.',
            });
        }

        this.theConversationOptions = conversationOptions;
        return this;
    }

    withLayoutOptions(layoutOptions: LayoutOptions) {
        if (this.mounted) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to set layout options. NLUX is already mounted.',
            });
        }

        if (this.theLayoutOptions) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to change config. Layout options were already set.',
            });
        }

        this.theLayoutOptions = layoutOptions;

        return this;
    }

    public withPromptBoxOptions(promptBoxOptions: PromptBoxOptions) {
        if (this.mounted) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to set prompt box options. NLUX is already mounted.',
            });
        }

        if (this.thePromptBoxOptions) {
            throw new NluxUsageError({
                source: this.constructor.name,
                message: 'Unable to change config. Prompt box options were already set.',
            });
        }

        this.thePromptBoxOptions = promptBoxOptions;
        return this;
    }
}
