import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { isDemoModeActive } from '../lib/demoUtils';

type TableName = 'members' | 'plans' | 'attendance' | 'membership_history' | 'notifications' | 'user_roles' | 'gyms';

interface UseRealtimeOptions {
    table: TableName;
    gymId: string | null;
    onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onChange?: () => void; // Simple refetch callback
    enabled?: boolean;
    /** Debounce delay in ms for onChange (default 300ms) */
    debounceMs?: number;
}

/**
 * Subscribes to Supabase Realtime changes on a table filtered by gym_id.
 * Automatically unsubscribes on cleanup.
 */
export function useRealtimeSubscription({
    table,
    gymId,
    onInsert,
    onUpdate,
    onDelete,
    onChange,
    enabled = true,
    debounceMs = 300,
}: UseRealtimeOptions) {
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!gymId || !enabled || isDemoModeActive()) return;

        const channelName = `${table}-${gymId}`;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: table === 'gyms' ? `id=eq.${gymId}` : `gym_id=eq.${gymId}`,
                },
                (payload: RealtimePostgresChangesPayload<any>) => {
                    if (import.meta.env.DEV) {
                        console.log(`[Realtime] ${table}:`, payload.eventType, payload);
                    }

                    if (payload.eventType === 'INSERT' && onInsert) {
                        onInsert(payload);
                    } else if (payload.eventType === 'UPDATE' && onUpdate) {
                        onUpdate(payload);
                    } else if (payload.eventType === 'DELETE' && onDelete) {
                        onDelete(payload);
                    }

                    // Debounced onChange to prevent rapid-fire refetches
                    if (onChange) {
                        if (debounceTimerRef.current) {
                            clearTimeout(debounceTimerRef.current);
                        }
                        debounceTimerRef.current = setTimeout(() => {
                            onChange();
                            debounceTimerRef.current = null;
                        }, debounceMs);
                    }
                }
            )
            .subscribe((status) => {
                if (import.meta.env.DEV) {
                    console.log(`[Realtime] Channel "${channelName}" status:`, status);
                }
            });

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            supabase.removeChannel(channel);
        };
    }, [table, gymId, enabled, onInsert, onUpdate, onDelete, onChange, debounceMs]);
}
