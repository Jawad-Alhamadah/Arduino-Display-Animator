import { useRef } from 'react';
import ToolMainFrame from './ToolMainFrame';
import {MdKeyboardDoubleArrowLeft} from "react-icons/md"

 function HoldButton({ onHold, interval = 100, children }) {
  const intervalRef = useRef(null);

  const startHold = () => {
    console.log("sdf")
    if (intervalRef.current) return; // Prevent multiple intervals
    onHold(); // Trigger once immediately
    intervalRef.current = setInterval(onHold, interval);
  };

  const stopHold = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  return (

    <ToolMainFrame
      Icon={MdKeyboardDoubleArrowLeft}
      target="shiftleft"
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      tooltip={["shift left", "Press `Ctrl` for No Wrap shift"]}

    ></ToolMainFrame>


  );
}

export default HoldButton