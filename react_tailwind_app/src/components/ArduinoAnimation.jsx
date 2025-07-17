import React from 'react';

const ArduinoAnimation = () => {
    return (
        <div className="theme-blue w-screen h-screen flex justify-center items-center flex-col bg-gray-900">
            <div className="relative mb-8">
                <div className="w-32 h-20 bg-green-600 rounded-md shadow-lg relative overflow-hidden">
                    <div className="absolute -left-2 top-6 w-4 h-8 bg-gray-300 rounded-l-md"></div>
                    <div className="absolute -left-1 top-2 w-3 h-4 bg-black rounded-sm"></div>
                    <div className="absolute top-1 left-6 flex space-x-1">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-black rounded-full"></div>
                        ))}
                    </div>
                    <div className="absolute bottom-1 left-6 flex space-x-1">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-black rounded-full"></div>
                        ))}
                    </div>
                    <div className="absolute top-3 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-6 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
                    <div className="absolute top-7 left-12 w-8 h-6 bg-black rounded-sm">
                        <div className="text-[6px] text-white text-center leading-6 font-mono">ATMEGA</div>
                    </div>
                    <div className="absolute top-14 left-8 w-2 h-3 bg-blue-400 rounded-full"></div>
                    <div className="absolute top-14 left-12 w-2 h-3 bg-blue-400 rounded-full"></div>
                    <div className="absolute top-2 left-20 w-4 h-1 bg-yellow-300 rounded-full"></div>
                    <div className="absolute top-4 left-20 w-4 h-1 bg-red-400 rounded-full"></div>
                </div>
                <div className="absolute -top-4 left-16 w-px h-8 bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-pulse"></div>
                <div className="absolute -bottom-4 left-16 w-px h-8 bg-gradient-to-t from-transparent via-green-400 to-transparent animate-pulse delay-500"></div>
                <div className="absolute -right-8 top-8 w-12 h-px bg-red-500 animate-pulse delay-200"></div>
                <div className="absolute -right-8 top-10 w-12 h-px bg-blue-500 animate-pulse delay-700"></div>
                <div className="absolute -right-8 top-12 w-12 h-px bg-green-500 animate-pulse delay-400"></div>
            </div>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-green-400 font-mono text-xs opacity-30 animate-pulse"
                        style={{
                            left: `${10 + i * 12}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: '3s'
                        }}
                    >
                        {['01010011', '11001010', '10101101', '01110100'][i % 4]}
                    </div>
                ))}
            </div>
            <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-gray-600 rounded-full animate-spin">
                    <div className="absolute inset-2 border-2 border-blue-400 rounded-full animate-spin-reverse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2 animate-pulse">
                    Arduino Screen Converter
                </div>
                <div className="text-blue-400 font-mono text-sm mb-4 animate-pulse">
                    Initializing hardware...
                </div>
                <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="mt-4 text-gray-400 text-xs font-mono animate-pulse">
                    Loading display drivers...
                </div>
            </div>
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full animate-bounce opacity-50"
                    style={{
                        left: `${20 + i * 10}%`,
                        top: `${30 + (i % 3) * 20}%`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '2s'
                    }}
                ></div>
            ))}
        </div>
    );
};

export default ArduinoAnimation;