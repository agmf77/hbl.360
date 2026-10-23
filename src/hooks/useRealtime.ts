import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveEventItem } from '../types';

interface RealtimeHookOptions {
  onEvent?: (event: { type: string; payload: any; sourceUser?: string; timestamp: string }) => void;
  enableSound?: boolean;
}

export function useRealtime({ onEvent, enableSound = true }: RealtimeHookOptions = {}) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEventItem[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const pingIntervalRef = useRef<any>(null);
  const pingStartTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const onEventRef = useRef(onEvent);

  // Keep latest onEvent callback without triggering reconnection
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // Play subtle pleasant chime on live incoming events
  const playChime = useCallback(() => {
    if (!enableSound) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [enableSound]);

  const addLiveEvent = useCallback((title: string, details: string, type: string, sourceUser?: string) => {
    const item: LiveEventItem = {
      id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      type,
      title,
      details,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sourceUser
    };
    setLiveEvents(prev => [item, ...prev].slice(0, 30));
    playChime();
  }, [playChime]);

  const connect = useCallback(() => {
    // Check if hosted on serverless platform (e.g. Vercel) where persistent WebSockets aren't hosted
    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    if (isVercel && retryCountRef.current >= 2) {
      // Gracefully set disconnected status without spamming infinite connection loops
      setStatus('disconnected');
      return;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setStatus('connecting');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        retryCountRef.current = 0;
        setStatus('connected');
        // Start ping interval for latency measurement
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            pingStartTimeRef.current = performance.now();
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);

        // Immediate first ping
        pingStartTimeRef.current = performance.now();
        socket.send(JSON.stringify({ type: 'ping' }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'pong') {
            const roundTrip = Math.round(performance.now() - pingStartTimeRef.current);
            setLatencyMs(roundTrip);
            return;
          }

          if (data.type === 'user:presence_updated') {
            if (data.payload?.activeUsers !== undefined) {
              setActiveUsers(data.payload.activeUsers);
            }
          }

          if (data.type === 'system:stats_updated' && data.payload?.activeUsers !== undefined) {
            setActiveUsers(data.payload.activeUsers);
          }

          // Generate friendly Bangla descriptions for real-time notifications
          if (data.type === 'repayment:created') {
            const r = data.payload.repayment;
            addLiveEvent(
              `কিস্তি আদায় (${r.employeeNameBn})`,
              `মোট ৳${r.totalAmount.toLocaleString()} (আসল: ৳${r.principalPaid.toLocaleString()}, সুদ: ৳${r.interestPaid.toLocaleString()})`,
              data.type,
              data.sourceUser
            );
          } else if (data.type === 'repayment:batch_created') {
            addLiveEvent(
              `ব্যাচ বেতন কর্তন সম্পন্ন (${data.payload.month})`,
              `মোট ${data.payload.processedCount} জন কর্মচারীর ৳${data.payload.totalAmount.toLocaleString()} কিস্তি কর্তিত`,
              data.type,
              data.sourceUser
            );
          } else if (data.type === 'provision:run') {
            addLiveEvent(
              `সুদ প্রভিশন সম্পন্ন (${data.payload.month})`,
              `${data.payload.rate}% হারে মোট ${data.payload.processedCount} টি লোনে ৳${data.payload.totalInterestAdded.toLocaleString()} সুদ ধার্য`,
              data.type,
              data.sourceUser
            );
          } else if (data.type === 'remittance:created') {
            const adv = data.payload.bankAdvice;
            addLiveEvent(
              `ব্যাংক ট্রান্সফার অ্যাডভাইস প্রস্তুত`,
              `${adv.toPbs} বরাবর ৳${adv.totalAmount.toLocaleString()} এর ব্যাংক অ্যাডভাইস #${adv.adviceNo}`,
              data.type,
              data.sourceUser
            );
          } else if (data.type === 'loan:created') {
            const l = data.payload.loan;
            addLiveEvent(
              `নতুন গৃহ ঋণ মঞ্জুর`,
              `ঋণ নং ${l.loanNo} (${l.employeeNameBn}) - ৳${l.disbursementAmount.toLocaleString()}`,
              data.type,
              data.sourceUser
            );
          } else if (data.type === 'recycle:restored') {
            addLiveEvent(
              `রেকর্ড পুনরুদ্ধার`,
              `রিসাইকেল বিন হতে '${data.payload.restoredItem?.title}' পুনরুদ্ধার ও ব্যালেন্স সমন্বয় সম্পন্ন`,
              data.type,
              data.sourceUser
            );
          } else if (data.type === 'simulation:event') {
            addLiveEvent(
              `রিয়েলটাইম লাইভ টেস্ট ইভেন্ট`,
              data.payload.message || 'সার্ভার হতে সরাসরি লাইভ সিগন্যাল গৃহীত হয়েছে।',
              data.type,
              data.sourceUser
            );
          }

          if (onEventRef.current) {
            onEventRef.current(data);
          }
        } catch {
          // Ignore parse errors
        }
      };

      socket.onclose = () => {
        setStatus('disconnected');
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        retryCountRef.current++;

        // Exponential backoff to prevent console flood and UI lag
        const delay = isVercel 
          ? (retryCountRef.current > 2 ? 60000 : 5000)
          : Math.min(30000, 2000 * Math.pow(1.5, retryCountRef.current));

        if (!reconnectTimeoutRef.current && (!isVercel || retryCountRef.current <= 2)) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, delay);
        }
      };

      socket.onerror = () => {
        setStatus('error');
      };
    } catch {
      setStatus('error');
    }
  }, [addLiveEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    status,
    isConnected: status === 'connected',
    activeUsers,
    latencyMs,
    liveEvents,
    reconnect: connect
  };
}
