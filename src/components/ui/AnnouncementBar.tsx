import React from "react";

interface AnnouncementBarProps {
  title: string;
  children: React.ReactNode;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ title, children }) => (
  <div className="my-4 ">
    <div className=" text-red-500 text-2xl md:text-3xl font-bold text-center py-2 rounded-t">
      {title}
    </div>
    <div className="bg-white text-black text-base md:text-lg px-4 py-3 border border-[#f6f7f4] border-t-0 rounded-b shadow">
      {children}
    </div>
  </div>
);

export default AnnouncementBar; 