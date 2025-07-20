import React from 'react'
import { notifyUser } from './toastifyFunctions';
import { toast } from 'react-toastify';
import { setFrameDuration } from '../reducers/frameDurationSlice';
import { useSelector, useDispatch } from 'react-redux';
function FrameDurationInput() {
    let frameDuration = useSelector((state) => state.frameDuration.value)
    const dispatch = useDispatch()
    function frameDurationBlurHandle() {

        const num = Number(frameDuration);
        if (num < 10) {
            notifyUser("Duration can't be lower than 10", toast.warning)
            dispatch(setFrameDuration(10))
        }

    }
    function frameDurationChangeHandle(e) {
        let val = e.target.value
        if (/^\d*$/.test(val)) {
            dispatch(setFrameDuration(val));

        }

    }

    return (
        <div className='flex w-[15em] bg-slate-800 rounded-sm text-iconColor max-500:justify-center text-lg '>

            <span className='text-[0.8em] px-1'>Frame duration </span>
            <input

                type="text"
                min="10"
                inputMode="numeric"
                onChange={frameDurationChangeHandle}

                onBlur={frameDurationBlurHandle}
                maxLength={8}
                value={frameDuration}
                className=" no-spinner pl-2 text-blue-400 rounded-md  outline outline-1 outline-iconColor w-[35%] bg-slate-900  "></input>

            <span className='text-[0.8em] px-1'>ms </span>

        </div>
    )
}

export default FrameDurationInput
