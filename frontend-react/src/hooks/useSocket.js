import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../constants/api";

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true, transports: ["websocket"] });
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const joinOrderRoom = useCallback((orderId) => {
    socketRef.current?.emit("join:order", orderId);
  }, []);

  const joinRestaurantRoom = useCallback((restaurantId) => {
    socketRef.current?.emit("join:restaurant", restaurantId);
  }, []);

  const onOrderStatusUpdate = useCallback((handler) => {
    socketRef.current?.on("order:status_updated", handler);
    return () => socketRef.current?.off("order:status_updated", handler);
  }, []);

  const onNewOrder = useCallback((handler) => {
    socketRef.current?.on("order:new", handler);
    return () => socketRef.current?.off("order:new", handler);
  }, []);

  return { joinOrderRoom, joinRestaurantRoom, onOrderStatusUpdate, onNewOrder };
};

export default useSocket;
