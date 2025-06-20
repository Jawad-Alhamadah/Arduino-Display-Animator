import React from 'react';
import { twMerge } from 'tailwind-merge';
import { setToPlaying, setToStopped } from '../reducers/isAnimationPlaying'
import { useSelector, useDispatch } from 'react-redux'
import { Tooltip as ReactTooltip } from "react-tooltip";


function Tool({ Icon, onClick, target, tooltip = [""], classes = '', interval=300,shortCutKey }) {


  React.useEffect(() => {
    const handleKeyDown = (e) => {
        // Find the shortcut key and onClick for this Tool instance
        if (shortCutKey && isClickable && e.code === shortCutKey) {
            console.log("Shortcut triggered", { shortCutKey, val:e.code });
            onClick && onClick();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // Only run once on mount/unmount
}, []);


    let isAnimationPlaying = useSelector((state) => state.isAnimationPlaying.value)


    const tooltip_data_target = `tooltip-${target}`
    const default_tool_class = 'active:scale-110 active:text-[#0763a4] focus:outline-none hover:scale-125 cursor-pointer hover:text-iconColorHover size-7  text-iconColor'


    const isClickable =
        (target === 'stop' && isAnimationPlaying) ||
        (target !== 'stop' && !isAnimationPlaying);

    const mergeClasses = isClickable ? classes : twMerge(classes, 'hover:cursor-default hover:scale-100 hover:text-slate-500 text-slate-500')

    const handleClick = isClickable ? onClick : undefined;


    return (
        <>
            <ReactTooltip
                id={tooltip_data_target}
                place="top"
                delayShow={interval}
                delayHide={45}

                className="grid capitalize absolute bg-green-400 z-10  px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[300ms] rounded-lg shadow-xs tooltip "
                style={{ backgroundColor: "#374151" }} 

                content={
                    <>
                        {tooltip.map((tip, index) => (
                            <React.Fragment key={index}>
                                {tip}
                                {index !== tooltip.length - 1 && <br />}
                                {<br />}
                                {shortCutKey? `ShortCut: ${shortCutKey}`:""}
                            </React.Fragment>
                        ))}
                    </>

                }
            />

            <Icon

                data-tooltip-id={tooltip_data_target}
                className={twMerge(default_tool_class, mergeClasses)}
                onClick={handleClick}
            />

        </>

    );
}

export default Tool



