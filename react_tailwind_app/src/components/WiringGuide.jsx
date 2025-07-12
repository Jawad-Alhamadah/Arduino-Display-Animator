import React from 'react'
import { Tooltip as ReactTooltip } from "react-tooltip";
import { SiArduino } from "react-icons/si";
import { FaHireAHelper } from "react-icons/fa6";
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
        ['CS (Optional)', 'D10 (or any free)', 'D53 (default SS)', 'Any digital', 'D10 (default SS)'],
    ];

    return (
        <>
            <div
                data-tooltip-id="tooltip_guide"
                data-tooltip-place="top"
                className="flex items-center space-x-1 outline outline-slate-700 rounded-md bg-slate-900 outline-offset-2 cursor-pointer"
            >
                <SiArduino className='size-7 text-cyan-600' />
                <FaHireAHelper className='size-5 text-cyan-600  '></FaHireAHelper >
            </div>

            <ReactTooltip
                id="tooltip_guide"
                place="top"
                portal={true}
                style={{ backgroundColor: "#374151" }}
                className="w-auto max-w-[90vw] z-50 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs dark:bg-gray-700"
                content={
                    <div>
                        <table className="max-750:text-[8px] table-auto text-left border-collapse text-white mb-2">
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
                        <table className="mt-2 max-750:text-[8px] table-auto text-left border-collapse text-white">
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
                }
            />
        </>
    )
}

export default WiringGuide