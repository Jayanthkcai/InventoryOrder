//

"use client"; // Add this at the top

import { useEffect, useState } from "react";

export default function hooktestPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Component Mounted");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      this is hook test
      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </div>
  );
}
