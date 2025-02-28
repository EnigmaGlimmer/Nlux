import {compPromptBoxClassName, compPromptBoxStatusClassName} from '@nlux/core';
import React from 'react';
import {LoaderComp} from '../Loader/LoaderComp';
import {SendIconComp} from '../SendIcon/SendIconComp';
import {PromptBoxProps} from './props';

export const PromptBoxComp = (props: PromptBoxProps) => {
    const compClassNameFromStats = compPromptBoxStatusClassName[props.status] || '';
    const className = `${compPromptBoxClassName} ${compClassNameFromStats}`;

    const disableTextarea = props.status === 'submitting';
    const disableButton = !props.hasValidInput || props.status === 'submitting' || props.status === 'waiting';
    const showSendIcon = props.status === 'typing';

    return (
        <div className={className}>
            <textarea
                disabled={disableTextarea}
                placeholder={props.placeholder}
                value={props.prompt}
                autoFocus={props.autoFocus}
                onChange={(e) => props.onChange?.(e.target.value)}
            />
            <button
                disabled={disableButton}
                onClick={() => props.onSubmit?.()}
            >
                {showSendIcon && <SendIconComp/>}
                {!showSendIcon && <LoaderComp/>}
            </button>
        </div>
    );
};
