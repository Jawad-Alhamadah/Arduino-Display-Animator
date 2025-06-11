import React from 'react';
import { twMerge } from 'tailwind-merge';
import { setToPlaying, setToStopped } from '../reducers/isAnimationPlaying'
import { useSelector, useDispatch } from 'react-redux'
import { Tooltip as ReactTooltip } from "react-tooltip";

function ToolMainFrame({ Icon, onClick, target, tooltip = [""], classes = '', onHold, interval = 300, shortCutKey }) {
    const intervalRef = React.useRef(null);
    let currentKeyboardKey = useSelector((state) => state.currentKeyboardKey.value)

    React.useEffect(() => {
        console.log("Effect ran", { shortCutKey, onClick });
        if (!shortCutKey || !onClick) return;
      
        const handleKeyDown = (e) => {
             
            // e.code is like "KeyD", "ControlLeft", etc.
            if (e.code === shortCutKey) {
                onClick();
               
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortCutKey, onClick]);

    const startHold = () => {

        if (!onHold) return
        if (intervalRef.current) return; // Prevent multiple intervals
        onHold(); // Trigger once immediately
        intervalRef.current = setInterval(onHold, interval);
    };

    const stopHold = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    };

    let isAnimationPlaying = useSelector((state) => state.isAnimationPlaying.value)
    const tooltip_data_target = `tooltip-${target}`
    const default_tool_class = 'active:scale-110 active:text-[#0763a4] focus:outline-none hover:scale-125 hover:text-iconColorHover rounded-full  text-iconColor hover:cursor-pointer size-5'

    const isClickable =
        (target === 'stop' && isAnimationPlaying) ||
        (target !== 'stop' && !isAnimationPlaying);

    const mergeClasses = isClickable ? classes : twMerge(classes, 'hover:cursor-default hover:scale-100 hover:text-slate-500 text-slate-500')

    const handleClick = isClickable ? onClick : undefined;


    return (
        <>

            <ReactTooltip
                id={`my-tooltip-${target}`}
                place="top"
                delayShow={interval}
                delayHide={45}
                style={{ backgroundColor: "#374151" }}

                className='capitalize'
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
            {/* 
            <div id={tooltip_data_target} role="tooltip" className="grid capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[300ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                {tooltip.map((tip, index) => <span key={index}>{tip}</span>)}
                <div className="tooltip-arrow" data-popper-arrow></div>
            </div> */}

            <div className='flex'>

                <Icon

                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    // data-tooltip-target={tooltip_data_target}
                    data-tooltip-id={`my-tooltip-${target}`}
                    className={twMerge(default_tool_class, mergeClasses)}
                    onClick={handleClick}
                />
            </div>

        </>

    );
}

export default ToolMainFrame