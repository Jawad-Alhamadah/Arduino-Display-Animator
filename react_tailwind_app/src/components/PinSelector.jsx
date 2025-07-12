import React from 'react'

const BOARD_PINS = {
    nano:  { label: "Nano/Uno", pins: Array.from({length: 12}, (_, i) => i + 2) }, // D2-D13
    uno:   { label: "Uno", pins: Array.from({length: 12}, (_, i) => i + 2) },
    every: { label: "Every", pins: Array.from({length: 12}, (_, i) => i + 2) },
    micro: { label: "Leonardo/Micro", pins: Array.from({length: 12}, (_, i) => i + 2) },
    leonardo: { label: "Leonardo/Micro", pins: Array.from({length: 12}, (_, i) => i + 2) },
    mega:  { label: "Mega", pins: Array.from({length: 46}, (_, i) => i + 2) }, // D2-D47
};

function PinSelector(props) {
    // fallback to nano if board not found
    const boardKey = (props.board || "nano").toLowerCase();
    const boardInfo = BOARD_PINS[boardKey] || BOARD_PINS["nano"];
    const pinOptions = boardInfo.pins;
    
    return (
        <div className='w-[33%] max-750:w-full'>
            <label htmlFor="small" className="mb-2 text-start text-sm font-medium text-gray-900 dark:text-white">{props.label}</label>
            <select
                onFocus={() => {
                    if(!props.pinRef) return
                    if(!props.pinhighlightSetter) return
                    props.pinRef.current.style.backgroundColor = "red";
                    props.pinRef.current.style.transform = "scale(1.3)";
                    props.pinhighlightSetter(true)
                }}
                onBlur={() => {
                    if(!props.pinRef) return
                    if(!props.pinhighlightSetter) return
                    props.pinRef.current.style.backgroundColor = "#9ca3af";
                    props.pinRef.current.style.transform = "scale(1)"
                    props.pinhighlightSetter(false)
                }}
                onChange={(e) => {
                    if(!props.pinSetter) return
                    localStorage.setItem(props.label, e.target.value)
                    props.pinSetter(e.target.value)


                }}
                defaultValue={localStorage.getItem(props.label) || ''}
                id="small"
                className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
                <option value="none" selected>Pin</option>
                {pinOptions.map(pin => (
                    <option key={pin} value={pin}>{`D${pin}`}</option>
                ))}
                 <option value="none" >optional</option>
            </select>
        </div>
    )
}

export default PinSelector
