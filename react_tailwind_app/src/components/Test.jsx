import React from 'react'

function Test() {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const eventSource = new EventSource('http://localhost:3000/process-file/status');
    
        eventSource.onmessage = (event) => {
            const { progress } = JSON.parse(event.data);
          
            setProgress(progress);
        };
    
        eventSource.onerror = () => {
            eventSource.close();
        };
    
        return () => {
            eventSource.close();
        };
    }, []);
    
    return (
        <div>
            <p>Processing: {progress}%</p>
            <progress className='bg-blue-300 text-blue-300-' value={progress} max="100">{progress}%</progress>
        </div>
    )
}

export default Test
