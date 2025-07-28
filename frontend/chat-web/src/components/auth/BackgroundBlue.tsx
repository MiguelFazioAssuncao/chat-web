import React from "react";
import background from "../../assets/backgroundBlue.avif";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

const BackgroundBlue = ({ className = "", children }: Props) => {
  return (
    <div
      className={`hidden 2xl:block 2xl:w-1/2 min-h-screen bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${background})` }}
    >
      {children}
    </div>
  );
};

export default BackgroundBlue;
