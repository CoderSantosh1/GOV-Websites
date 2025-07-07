"use client";
import React, { useEffect, useState } from "react";

export const ClientAdBanner = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);
  if (!show) return null;
  return <div id="container-1102a47cc48fb96e807695825f07ed3e"></div>;
};
