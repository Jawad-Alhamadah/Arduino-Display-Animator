import React, { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { setToPlaying, setToStopped } from '../reducers/isAnimationPlaying';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip as ReactTooltip } from "react-tooltip";

function ToolMainFrame({ Icon, onClick, target, tooltip = [""], classes = '', onHold, interval = 100, shortCutKey }) {
    const buttonRef = useRef(null);
    const intervalRef = useRef(null);
    const isHoldingRef = useRef(false);
    let currentKeyboardKey = useSelector((state) => state.currentKeyboardKey.value);

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            // Find the shortcut key and onClick for this Tool instance
            if (shortCutKey && isClickable && e.code === shortCutKey) {
                console.log("Shortcut triggered", { shortCutKey, val: e.code });
                onClick && onClick();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // Only run once on mount/unmount
    }, []);

    // Add continuous action on mouse hold
    useEffect(() => {
        if (!onHold) return;

        const handleMouseDown = () => {
            isHoldingRef.current = true;
            
            // Immediate action
            onHold();
            
            // Continuous action
            intervalRef.current = setInterval(() => {
                if (isHoldingRef.current) {
                    onHold();
                }
            }, interval);
        };

        const handleMouseUp = () => {
            isHoldingRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        // Add event listeners to the actual DOM element, not the Icon component
        const button = buttonRef.current;
        if (button) {
            button.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mouseup', handleMouseUp); // Use document for mouseup to catch all cases
        }

        return () => {
            if (button) {
                button.removeEventListener('mousedown', handleMouseDown);
            }
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Clear any active interval on unmount
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [onHold, interval]);

    let isAnimationPlaying = useSelector((state) => state.isAnimationPlaying.value);
    const tooltip_data_target = `tooltip-${target}`;
    const default_tool_class = 'active:scale-110 active:text-[#0763a4] focus:outline-none hover:scale-125 hover:text-iconColorHover rounded-full text-iconColor hover:cursor-pointer size-5';

    const isClickable =
        (target === 'stop' && isAnimationPlaying) ||
        (target !== 'stop' && !isAnimationPlaying);

    const mergeClasses = isClickable ? classes : twMerge(classes, 'hover:cursor-default hover:scale-100 hover:text-slate-500 text-slate-500');

    const handleClick = isClickable ? onClick : undefined;

    return (
        <>
            <div 
                className='flex' 
                ref={buttonRef} // Apply ref to the div, not the Icon
            >
                <Icon
                    data-tooltip-id={`my-tooltip-${target}`}
                    className={twMerge(default_tool_class, mergeClasses)}
                    onClick={handleClick}
                />
            </div>

            <ReactTooltip
                id={`my-tooltip-${target}`}
                place="top"
                delayShow={interval}
                delayHide={45}
                style={{ backgroundColor: "#374151" }}
                className='capitalize z-50'
                content={
                    <>
                        {tooltip.map((tip, index) => (
                            <React.Fragment key={index}>
                                {tip}
                                {index !== tooltip.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </>
                }
            />
        </>
    );
}

export default ToolMainFrame;