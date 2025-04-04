import { useState } from "react";
import { ScanQRModal } from "./ScanQRModal";

export function FloatingActionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <div 
        className="fixed bottom-24 md:bottom-6 right-6 w-14 h-14 rounded-full bg-[#FF5722] text-white flex items-center justify-center shadow-md cursor-pointer z-30"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="material-icons">qr_code_scanner</span>
      </div>
      
      <ScanQRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
