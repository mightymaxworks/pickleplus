import React from 'react';

// The official Pickle+ logo component
export function OfficialPicklePlusLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 1024 295" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* PICKLE text in orange */}
      <path
        d="M12.288 12.288h70.144c57.344 0 94.72 32.768 94.72 88.064 0 55.296-37.888 88.064-94.72 88.064H51.2v79.36H12.288V12.288zm70.144 139.264c35.84 0 55.296-19.968 55.296-51.2 0-31.232-19.456-51.2-55.296-51.2H51.2v102.4h31.232zm122.368-139.264h38.912v218.112h109.056v37.376H204.8V12.288zm186.88 0h38.912v218.112h109.056v37.376H391.68V12.288zm186.88 0h38.912v255.488h-38.912V12.288zm109.056 128.512v-16.384h125.44v16.384h-125.44zm171.52-128.512h149.504v37.376H898.048v71.68h99.84v37.376h-99.84v109.056h-38.912V12.288z"
        fill="#FF5722"
      />
      {/* + sign in blue */}
      <path
        d="M945.152 20.48h57.344v57.344h-57.344z M945.152 135.168v-57.344h-57.344v57.344z M945.152 135.168h57.344v57.344h-57.344z"
        fill="#40C4FF"
      />
    </svg>
  );
}

// White version for dark backgrounds
export function OfficialPicklePlusWhiteLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 1024 295" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* PICKLE text in white */}
      <path
        d="M12.288 12.288h70.144c57.344 0 94.72 32.768 94.72 88.064 0 55.296-37.888 88.064-94.72 88.064H51.2v79.36H12.288V12.288zm70.144 139.264c35.84 0 55.296-19.968 55.296-51.2 0-31.232-19.456-51.2-55.296-51.2H51.2v102.4h31.232zm122.368-139.264h38.912v218.112h109.056v37.376H204.8V12.288zm186.88 0h38.912v218.112h109.056v37.376H391.68V12.288zm186.88 0h38.912v255.488h-38.912V12.288zm109.056 128.512v-16.384h125.44v16.384h-125.44zm171.52-128.512h149.504v37.376H898.048v71.68h99.84v37.376h-99.84v109.056h-38.912V12.288z"
        fill="white"
      />
      {/* + sign in blue */}
      <path
        d="M945.152 20.48h57.344v57.344h-57.344z M945.152 135.168v-57.344h-57.344v57.344z M945.152 135.168h57.344v57.344h-57.344z"
        fill="#40C4FF"
      />
    </svg>
  );
}