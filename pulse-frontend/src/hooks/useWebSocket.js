import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEmergencyStore } from '../stores/emergencyStore';
import { useAmbulanceStore } from '../stores/ambulanceStore';
import { useHospitalStore } from '../stores/hospitalStore';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import config, { logger } from '../config';

export function useWebSocket(token) {
  const clientRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  
  const queryClient = useQueryClient();
  const { addEmergency, updateEmergency, removeEmergency } = useEmergencyStore();
  const { updateAmbulance, updateAmbulancePosition } = useAmbulanceStore();
  const { updateHospital, updateHospitalCapacity } = useHospitalStore();
  const { setConnectionStatus, addToast } = useUIStore();
  const { user } = useAuthStore();

  const handleEmergencyMessage = useCallback((message) => {
    try {
      const data = JSON.parse(message.body);
      switch (data.type) {
        case 'NEW':
          addEmergency(data.emergency);
          addToast({
            type: 'warning',
            title: 'New Emergency',
            message: `Priority ${data.emergency.priority}: ${data.emergency.description}`,
            duration: 10000,
          });
          queryClient.invalidateQueries({ queryKey: ['emergencies'] });
          break;
        case 'UPDATE':
          updateEmergency(data.emergency.id, data.emergency);
          queryClient.invalidateQueries({ queryKey: ['emergencies', data.emergency.id] });
          break;
        case 'RESOLVED':
          removeEmergency(data.emergencyId);
          queryClient.invalidateQueries({ queryKey: ['emergencies'] });
          break;
        default:
          console.warn('Unknown emergency message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling emergency message:', error);
    }
  }, [addEmergency, updateEmergency, removeEmergency, addToast, queryClient]);

  const handleAmbulanceMessage = useCallback((message) => {
    try {
      const data = JSON.parse(message.body);
      if (data.type === 'POSITION') {
        updateAmbulancePosition(data.ambulanceId, data.lat, data.lng, data.heading);
      } else if (data.type === 'STATUS') {
        updateAmbulance(data.ambulanceId, { status: data.status });
        queryClient.invalidateQueries({ queryKey: ['ambulances'] });
      }
    } catch (error) {
      console.error('Error handling ambulance message:', error);
    }
  }, [updateAmbulance, updateAmbulancePosition, queryClient]);

  const handleHospitalCapacityMessage = useCallback((message) => {
    try {
      const data = JSON.parse(message.body);
      updateHospitalCapacity(data.hospitalId, data.capacity);
      queryClient.invalidateQueries({ queryKey: ['hospitals', data.hospitalId] });
    } catch (error) {
      console.error('Error handling hospital capacity message:', error);
    }
  }, [updateHospitalCapacity, queryClient]);

  const handleAlertMessage = useCallback((message) => {
    try {
      const data = JSON.parse(message.body);
      addToast({
        type: data.severity === 'CRITICAL' ? 'error' : 'info',
        title: data.title,
        message: data.message,
        duration: data.severity === 'CRITICAL' ? 0 : 8000,
      });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    } catch (error) {
      console.error('Error handling alert message:', error);
    }
  }, [addToast, queryClient]);

  const connect = useCallback(() => {
    if (!token || !config.websocket.enabled) return;

    // Don't spam console with connection attempts
    if (reconnectAttemptsRef.current === 0) {
      setConnectionStatus('connecting');
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(config.websocket.url),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        logger.debug('[STOMP]', str);
      },
      reconnectDelay: 0, // We handle reconnection manually
      heartbeatIncoming: config.websocket.heartbeatIncoming,
      heartbeatOutgoing: config.websocket.heartbeatOutgoing,
    });

    client.onConnect = () => {
      logger.info('WebSocket connected');
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;

      // Subscribe to topics
      client.subscribe('/topic/emergencies', handleEmergencyMessage);
      client.subscribe('/topic/ambulances', handleAmbulanceMessage);
      client.subscribe('/topic/hospital-capacity', handleHospitalCapacityMessage);
      
      // User-specific alerts
      if (user?.id) {
        client.subscribe(`/topic/alerts/${user.id}`, handleAlertMessage);
      }
    };

    client.onDisconnect = () => {
      logger.info('WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    client.onStompError = (frame) => {
      logger.error('STOMP error:', frame);
      setConnectionStatus('disconnected');
      scheduleReconnect();
    };

    client.onWebSocketClose = () => {
      logger.debug('WebSocket closed');
      setConnectionStatus('disconnected');
      scheduleReconnect();
    };

    client.activate();
    clientRef.current = client;
  }, [
    token,
    user,
    setConnectionStatus,
    handleEmergencyMessage,
    handleAmbulanceMessage,
    handleHospitalCapacityMessage,
    handleAlertMessage,
  ]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= config.websocket.maxReconnectAttempts) {
      // Silently give up - backend probably isn't running
      logger.debug('WebSocket: Max reconnection attempts reached. Backend may be unavailable.');
      setConnectionStatus('disconnected');
      return;
    }

    const delay = config.websocket.reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
    if (reconnectAttemptsRef.current === 0) {
      logger.debug(`WebSocket: Scheduling reconnect in ${delay}ms`);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect();
    }, delay);
  }, [connect, setConnectionStatus]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, [setConnectionStatus]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  return {
    isConnected: clientRef.current?.connected || false,
    reconnect: connect,
    disconnect,
  };
}

export default useWebSocket;
