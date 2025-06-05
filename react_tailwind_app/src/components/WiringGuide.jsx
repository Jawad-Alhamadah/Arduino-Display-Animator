import React from 'react'




function WiringGuide() {

    const guide_I2C = [
        ['I2C OLED Pin', 'Uno / Nano', 'Mega 2560', 'Leonardo / Micro', 'Arduino Every'],
        ['VCC', '5V', '5V', '5V', '5V'],
        ['GND', 'GND', 'GND', 'GND', 'GND'],
        ['SCL', 'A5', '21', '3', 'Pin 21 (default)'],
        ['SDA', 'A4', '20', '2', 'Pin 20 (default)']
    ];

    const guide_SPI = [
        ['SPI OLED Pin', 'Uno / Nano', 'Mega 2560', 'Leonardo / Micro', 'Arduino Every'],
        ['VCC', '5V', '5V', '5V', '5V'],
        ['GND', 'GND', 'GND', 'GND', 'GND'],
        ['SCL (CLK)', 'D13', 'D52', 'D15', 'D13'],
        ['SDA (MOSI)', 'D11', 'D51', 'D16', 'D11'],
        ['RES', 'D9 (or any free)', 'Any digital', 'Any digital', 'Any digital'],
        ['DC', 'D8 (or any free)', 'Any digital', 'Any digital', 'Any digital'],
        ['CS', 'D10 (or any free)', 'D53 (default SS)', 'Any digital', 'D10 (default SS)'],
    ];


    return (
        <div id="tooltip_guide" role="tooltip" className="  whitespace-pre grid capitalize absolute z-10 invisible  py-2 text-sm font-medium text-white transition-opacity duration-300 delay-[300ms] bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            <table className=" max-750:text-[8px] table-auto text-left border-collapse text-white ">
                <thead>
                    <tr>
                        {guide_I2C[0].map((col, i) => (
                            <th key={i} className="text-yellow-400 px-2 py-1 font-bold border-b border-gray-600">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {guide_I2C.slice(1).map((row, rIdx) => (
                        <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-2 py-1">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <table className="mt-2 max-750:text-[8px] table-auto text-left border-collapse text-white ">
                <thead>
                    <tr>
                        {guide_SPI[0].map((col, i) => (
                            <th key={i} className="text-yellow-400 px-2 py-1 font-bold border-b border-gray-600">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {guide_SPI.slice(1).map((row, rIdx) => (
                        <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-2 py-1">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default WiringGuide
