import React, { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { setToPlaying, setToStopped } from '../reducers/isAnimationPlaying';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip as ReactTooltip } from "react-tooltip";

function ToolMainFrame({ Icon, onClick, target, tooltip = [""], classes = '', onHold, interval = 10, shortCutKey }) {
    const buttonRef = useRef(null);
    const intervalRef = useRef(null);
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

    // Functions to handle continuous action on hold
    const startHold = () => {
        if (!onHold) return;
        
        // Execute immediately
        onHold();
        
        // Clear any existing interval first to prevent duplicates
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        
        // Set up interval for continuous action
        intervalRef.current = setInterval(() => {
            onHold();
        }, interval);
    };

    const stopHold = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

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
                ref={buttonRef}
            >
                <Icon
                    data-tooltip-id={`my-tooltip-${target}`}
                    className={twMerge(default_tool_class, mergeClasses)}
                    onClick={handleClick}
                    onMouseDown={isClickable && onHold ? startHold : undefined}
                    onMouseUp={isClickable && onHold ? stopHold : undefined}
                    onMouseLeave={isClickable && onHold ? stopHold : undefined}
                    onTouchStart={isClickable && onHold ? startHold : undefined}
                    onTouchEnd={isClickable && onHold ? stopHold : undefined}
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