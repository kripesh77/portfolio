"use client";

import ReactLenis from "lenis/react";
import React from "react";

export default function Page() {
  return (
    <ReactLenis className="projects" options={{ wrapper: undefined }}>
      <div className="project-container">
        <div className="images">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            alt=""
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
            alt=""
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
            alt=""
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1490750967868-88aa4486c946"
            alt=""
            loading="lazy"
          />
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b"
            alt=""
            loading="lazy"
          />
        </div>
      </div>
    </ReactLenis>
  );
}
