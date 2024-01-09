import React from "react";
interface SpinnerProps {
  className?: string;
  classNameInner?: string;
}

// Helper component to show a spinner
const Spinner: React.FC<SpinnerProps> = ({
    className = "",
    classNameInner = "",
}) => (
    <div className={`flex justify-center items-center ${className}`}>
        <div
            className={`animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 ${classNameInner}`}
        ></div>
    </div>
);

export default Spinner;
