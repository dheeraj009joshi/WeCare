import React, { useRef, useState, useEffect } from "react";

export default function Collapse({ isOpen, children }) {
  const ref = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setContentHeight(ref.current.scrollHeight);
    }
  }, [children, isOpen]);

  return (
    <div
      className="overflow-hidden transition-[height] duration-300 ease-in-out"
      style={{ height: isOpen ? `${contentHeight}px` : 0 }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}