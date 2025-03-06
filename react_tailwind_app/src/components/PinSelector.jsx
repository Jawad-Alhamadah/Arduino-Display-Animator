import React from 'react'

function PinSelector(props) {
    return (
        <>
            <label for="small" class="block mb-2 text-start text-sm font-medium text-gray-900 dark:text-white">{props.label}</label>
            <select

                onFocus={() => {

                    props.pinRef.current.style.backgroundColor = "red";
                    props.pinRef.current.style.transform = "scale(1.3)";
                    props.pinhighlightSetter(true)


                }}
                onBlur={() => {
                    props.pinRef.current.style.backgroundColor = "#9ca3af";
                    props.pinRef.current.style.transform = "scale(1)"
                    props.pinhighlightSetter(false)

                }}
                onChange={(e) => {
                    console.log(e.target.value); // Logs the selected value
                    props.pinSetter(e.target.value)
                  }}

                id="small" class=" block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option selected value="none">Pin</option>
                <option value="2">D2 Pin</option>
                <option value="3">D3 Pin</option>
                <option value="4">D4 Pin</option>
                <option value="5">D5 Pin</option>
                <option value="6">D6 Pin</option>
                <option value="7">D7 Pin</option>
                <option value="8">D8 Pin</option>
                <option value="9">D9 Pin</option>
                <option value="10">D10 Pin</option>
                <option value="11">D11 Pin</option>
                <option value="12">D12 Pin</option>
                <option value="13">D13 Pin</option>
            </select>
        </>

    )
}

export default PinSelector
