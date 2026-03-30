import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Attendance, Member, Payment } from '../types';
import type {
  DemoNotification,
  DemoStaffMember,
  DemoState,
  DemoMetrics,
} from '../lib/demoData';
import { isDemoModeActive } from '../lib/demoUtils';
import { formatBdt } from '../lib/currency';

const loadDemoData = () => import('../lib/demoData');

type InvitePayload = {
  email: string;
  role: DemoStaffMember['role'];
};

type DemoDataContextValue = {
  isDemoMode: boolean;
  state: DemoState;
  metrics: DemoMetrics;
  resetDemoData: () => void;
  addMember: (payload: Pick<Member, 'full_name' | 'email' | 'phone' | 'plan_id'>) => Member;
  updateMember: (memberId: string, payload: Partial<Member>) => Member | null;
  deleteMember: (memberId: string) => void;
  toggleMemberStatus: (memberId: string) => Member | null;
  addPayment: (payload: Pick<Payment, 'member_id' | 'plan_id' | 'price_paid' | 'payment_method' | 'start_date' | 'end_date'>) => Payment | null;
  addAttendance: (memberId: string, method?: Attendance['method']) => Attendance | null;
  inviteStaff: (payload: InvitePayload) => DemoStaffMember;
  updateStaffRole: (staffId: string, role: DemoStaffMember['role']) => DemoStaffMember | null;
  removeStaff: (staffId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
};

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

const findPlanForMember = (state: DemoState, planId?: string) =>
  state.plans.find((plan) => plan.id === planId) ?? null;

const DEMO_GYM_ID = 'demo-gym-id';

const EMPTY_STATE: DemoState = {
  gymName: '',
  plans: [],
  members: [],
  payments: [],
  attendance: [],
  staff: [],
  notifications: [],
};

const emptyMetrics = { totalMembers: 0, activeMembers: 0, expiringSoon: 0, revenue: 0, todayCheckins: 0, retentionRate: 0, churnRisk: 0 };

export function DemoDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(EMPTY_STATE);
  const [metricsCalc, setMetricsCalc] = useState<typeof emptyMetrics>(emptyMetrics);
  const [dataLoaded, setDataLoaded] = useState(false);
  const isDemoMode = isDemoModeActive();

  React.useEffect(() => {
    if (isDemoMode && !dataLoaded) {
      const savedState = localStorage.getItem('demo_state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setState(parsed);
          loadDemoData().then(({ getDemoMetrics }) => {
            setMetricsCalc(getDemoMetrics(parsed));
          });
          setDataLoaded(true);
          return;
        } catch (e) {
          console.error('Failed to parse demo state from localStorage', e);
        }
      }

      loadDemoData().then(({ createInitialDemoState, getDemoMetrics }) => {
        const initial = createInitialDemoState();
        setState(initial);
        setMetricsCalc(getDemoMetrics(initial));
        setDataLoaded(true);
      });
    }
  }, [isDemoMode, dataLoaded]);

  React.useEffect(() => {
    if (isDemoMode && dataLoaded) {
      localStorage.setItem('demo_state', JSON.stringify(state));
    }
  }, [state, isDemoMode, dataLoaded]);

  React.useEffect(() => {
    if (isDemoMode && dataLoaded) {
      loadDemoData().then(({ getDemoMetrics }) => {
        setMetricsCalc(getDemoMetrics(state));
      });
    }
  }, [state, isDemoMode, dataLoaded]);

  const pushNotification = (title: string, body: string, memberId?: string) => {
    setState((current) => {
      const notification: DemoNotification = {
        id: `demo-note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title,
        body,
        created_at: new Date().toISOString(),
        read: false,
        related_member_id: memberId,
      };
      return {
        ...current,
        notifications: [notification, ...current.notifications].slice(0, 50),
      };
    });
  };

  const resetDemoData = () => {
    loadDemoData().then(({ createInitialDemoState }) => {
      const initial = createInitialDemoState();
      setState(initial);
      localStorage.removeItem('demo_state');
    });
  };

  const addMember = (payload: Pick<Member, 'full_name' | 'email' | 'phone' | 'plan_id'>) => {
    const memberId = `demo-member-${Date.now()}`;
    let createdMember: Member | null = null;
    setState((current) => {
      const plan = findPlanForMember(current, payload.plan_id);
      const today = new Date().toISOString();
      const member: Member = {
        id: memberId,
        gym_id: DEMO_GYM_ID,
        full_name: payload.full_name.trim(),
        email: payload.email || undefined,
        phone: payload.phone || undefined,
        plan_id: payload.plan_id || undefined,
        join_date: today.split('T')[0],
        expiry_date: plan
          ? new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined,
        status: 'ACTIVE',
        created_at: today,
        qr_code_value: `DEMO:${DEMO_GYM_ID}:${memberId}`,
        qr_generated_at: today,
        plans: plan ? { name: plan.name, price: plan.price, duration_days: plan.duration_days } : undefined,
      };
      createdMember = member;
      return { ...current, members: [member, ...current.members] };
    });
    pushNotification('New Member Joined', `${payload.full_name} is now part of the gym.`, memberId);
    return createdMember!;
  };

  const updateMember = (memberId: string, payload: Partial<Member>) => {
    let updated: Member | null = null;
    setState((current) => {
      const nextMembers = current.members.map((member) => {
        if (member.id !== memberId) return member;
        const plan = payload.plan_id ? findPlanForMember(current, payload.plan_id) : findPlanForMember(current, member.plan_id);
        updated = {
          ...member,
          ...payload,
          plans: plan ? { name: plan.name, price: plan.price, duration_days: plan.duration_days } : member.plans,
        };
        return updated!;
      });
      return { ...current, members: nextMembers };
    });
    if (updated) {
      pushNotification('Profile Updated', `${(updated as Member).full_name}'s info has been updated.`, memberId);
    }
    return updated;
  };

  const deleteMember = (memberId: string) => {
    setState((current) => ({
      ...current,
      members: current.members.filter((member) => member.id !== memberId),
      payments: current.payments.filter((payment) => payment.member_id !== memberId),
      attendance: current.attendance.filter((entry) => entry.member_id !== memberId),
      notifications: current.notifications.filter((entry) => entry.related_member_id !== memberId),
    }));
  };

  const toggleMemberStatus = (memberId: string) => {
    let updated: Member | null = null;
    setState((current) => ({
      ...current,
      members: current.members.map((member) => {
        if (member.id !== memberId) return member;
        updated = {
          ...member,
          status: member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        };
        return updated!;
      }),
    }));
    return updated;
  };

  const addPayment = (payload: Pick<Payment, 'member_id' | 'plan_id' | 'price_paid' | 'payment_method' | 'start_date' | 'end_date'>) => {
    let created: Payment | null = null;
    let memName = '';
    setState((current) => {
      const member = current.members.find((item) => item.id === payload.member_id);
      const plan = current.plans.find((item) => item.id === payload.plan_id);
      if (!member || !plan) return current;
      memName = member.full_name;
      created = {
        id: `demo-payment-${Date.now()}`,
        gym_id: DEMO_GYM_ID,
        member_id: payload.member_id,
        plan_id: payload.plan_id,
        price_paid: payload.price_paid,
        payment_method: payload.payment_method,
        start_date: payload.start_date,
        end_date: payload.end_date,
        created_at: new Date().toISOString(),
        members: { full_name: member.full_name },
        plans: { name: plan.name },
      };
      const nextMembers = current.members.map((item) =>
        item.id === member.id
          ? {
              ...item,
              plan_id: plan.id,
              expiry_date: payload.end_date,
              status: 'ACTIVE',
              plans: { name: plan.name, price: plan.price, duration_days: plan.duration_days },
            }
          : item
      );
      return {
        ...current,
        members: nextMembers,
        payments: [created!, ...current.payments],
      };
    });
    if (created) pushNotification('Payment Received', `Collected ${formatBdt(payload.price_paid)} from ${memName}.`, payload.member_id);
    return created;
  };

  const addAttendance = (memberId: string, method: Attendance['method'] = 'MANUAL') => {
    let created: Attendance | null = null;
    let memName = '';
    setState((current) => {
      const member = current.members.find((item) => item.id === memberId);
      if (!member) return current;
      memName = member.full_name;
      created = {
        id: `demo-attendance-${Date.now()}`,
        gym_id: DEMO_GYM_ID,
        member_id: member.id,
        check_in_time: new Date().toISOString(),
        method,
        members: {
          full_name: member.full_name,
          plan_id: member.plan_id,
          status: member.status,
          plans: member.plans ? { name: member.plans.name } : undefined,
        },
      };
      return {
        ...current,
        attendance: [created!, ...current.attendance],
      };
    });
    if (created) pushNotification('Member Check-in', `${memName} checked in via ${method}.`, memberId);
    return created;
  };

  const inviteStaff = (payload: InvitePayload) => {
    const created: DemoStaffMember = {
      id: `demo-staff-${Date.now()}`,
      user_id: null,
      email: payload.email,
      display_name: payload.email,
      role: payload.role,
      status: 'INVITED',
      joined_at: null,
      invited_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setState((current) => ({
      ...current,
      staff: [...current.staff, created],
    }));
    pushNotification('Staff Invited', `${payload.email} was invited as ${payload.role}.`);
    return created;
  };

  const updateStaffRole = (staffId: string, role: DemoStaffMember['role']) => {
    let updated: DemoStaffMember | null = null;
    setState((current) => ({
      ...current,
      staff: current.staff.map((member) => {
        if (member.id !== staffId) return member;
        updated = { ...member, role };
        return updated!;
      }),
    }));
    if (updated) pushNotification('Role Changed', `Staff ${(updated as DemoStaffMember).email} is now an ${role}.`);
    return updated;
  };

  const removeStaff = (staffId: string) => {
    setState((current) => ({
      ...current,
      staff: current.staff.filter((member) => member.id !== staffId),
    }));
    pushNotification('Staff Removed', 'A staff member has been removed from the platform.');
  };

  const markNotificationRead = (notificationId: string) => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
    }));
  };

  const value = useMemo<DemoDataContextValue>(
    () => ({
      isDemoMode,
      state,
      metrics: metricsCalc,
      resetDemoData,
      addMember,
      updateMember,
      deleteMember,
      toggleMemberStatus,
      addPayment,
      addAttendance,
      inviteStaff,
      updateStaffRole,
      removeStaff,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [isDemoMode, state, metricsCalc]
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) throw new Error('useDemoData must be used within a DemoDataProvider.');
  return context;
}
