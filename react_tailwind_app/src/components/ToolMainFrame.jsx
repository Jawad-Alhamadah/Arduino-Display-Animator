import React from 'react';
import { twMerge } from 'tailwind-merge';
import { setToPlaying, setToStopped } from '../reducers/isAnimationPlaying'
import { useSelector, useDispatch } from 'react-redux'


function ToolMainFrame({ Icon, onClick, target, tooltip = "", classes = '' }) {

    let isAnimationPlaying = useSelector((state) => state.isAnimationPlaying.value)


    const tooltip_data_target = `tooltip-${target}`
    const default_tool_class =  'focus:outline-none hover:scale-125 hover:text-teal-200 rounded-full  text-green-600 hover:cursor-pointer'


    const isClickable =
        (target === 'stop' && isAnimationPlaying) ||
        (target !== 'stop' && !isAnimationPlaying);

    const mergeClasses = isClickable ? classes : twMerge(classes, 'hover:cursor-default hover:scale-100 hover:text-slate-500 text-slate-500')

    const handleClick = isClickable ? onClick : undefined;


    return (
        <>


            <div id={tooltip_data_target} role="tooltip" className="grid capitalize absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[300ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                {tooltip.map((tip, index) => <span key={index}>{tip}</span>)}
                <div className="tooltip-arrow" data-popper-arrow></div>
            </div>

            <Icon

                data-tooltip-target={tooltip_data_target}
                className={twMerge(default_tool_class, mergeClasses)}
                onClick={handleClick}
            />
        </>

    );
}

export default ToolMainFrame