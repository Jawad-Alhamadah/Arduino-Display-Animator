import React from 'react'

function PinSelector(props) {
    return (
        <>
            <label for="small" class="block mb-2 text-start text-sm font-medium text-gray-900 dark:text-white">{props.label}</label>
            <select

                onFocus={() => {

                    pinDINRef.current.style.backgroundColor = "red";
                    pinDINRef.current.style.transform = "scale(1.3)";
                    props.pinSetter(true)


                }}
                onBlur={() => {
                    pinDINRef.current.style.backgroundColor = "#9ca3af";
                    pinDINRef.current.style.transform = "scale(1)"
                    props.pinSetter(false)

                }}

                id="small" class=" block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option selected>Pick Arduino Pin:</option>
                <option value="D2">D2 Pin</option>
                <option value="D3">D3 Pin</option>
                <option value="D4">D4 Pin</option>
                <option value="D5">D5 Pin</option>
                <option value="D6">D6 Pin</option>
                <option value="D7">D7 Pin</option>
                <option value="D8">D8 Pin</option>
                <option value="D9">D9 Pin</option>
                <option value="D10">D10 Pin</option>
                <option value="D11">D11 Pin</option>
                <option value="D12">D12 Pin</option>
                <option value="D13">D13 Pin</option>
            </select>
        </>

    )
}

export default PinSelector
