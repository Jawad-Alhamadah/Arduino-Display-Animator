import React from 'react'

function CoffeeButton() {
    return (
        <div className='w-full mt-10 flex justify-center '>


            {/* <a
                href="https://www.buymeacoffee.com/vienspark"
                className="block min-w-[200px] outline outline-1 outline-[#FFDD00] rounded-xl"
            >
                <img
                   //  src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&slug=vienspark&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
                    src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&slug=vienspark&button_colour=000000&font_colour=FFDD00&font_family=Cookie&outline_colour=FFDD00&coffee_colour=ffffff"
                    alt="Buy me a coffee"
                    className="w-full h-auto"
                />
            </a>
			 */}

             <a href="https://www.buymeacoffee.com/vienspark" target="_blank">
             <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" / >
             </a>
			
        </div>
    )
}

export default CoffeeButton
