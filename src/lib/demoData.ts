import type { Attendance, Member, Payment, Plan } from '../types';

export type DemoStaffRole = 'OWNER' | 'MANAGER' | 'TRAINER';

export type DemoStaffMember = {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string;
  role: DemoStaffRole;
  status: 'ACTIVE' | 'INVITED' | 'PENDING';
  joined_at: string | null;
  invited_at: string | null;
  created_at: string;
};

export type DemoNotification = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
  related_member_id?: string | null;
};

export type DemoState = {
  gymName: string;
  plans: Plan[];
  members: Member[];
  payments: Payment[];
  attendance: Attendance[];
  staff: DemoStaffMember[];
  notifications: DemoNotification[];
};

const DEMO_GYM_ID = 'demo-gym-id';
const now = new Date();

const isoDate = (offsetDays = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const isoDateTime = (offsetDays = 0, hour = 9, minute = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const plans: Plan[] = [
  {
    id: 'plan-elite',
    gym_id: DEMO_GYM_ID,
    name: 'Premium',
    price: 4500,
    duration_days: 30,
    duration_type: 'DAYS',
    description: 'Unlimited access with premium trainer support.',
    is_popular: true,
    created_at: isoDateTime(-120, 10, 30),
  },
  {
    id: 'plan-power',
    gym_id: DEMO_GYM_ID,
    name: 'Advanced',
    price: 3200,
    duration_days: 30,
    duration_type: 'DAYS',
    description: 'Great for regular gym members with flexible hours.',
    created_at: isoDateTime(-110, 10, 30),
  },
  {
    id: 'plan-starter',
    gym_id: DEMO_GYM_ID,
    name: 'Basic',
    price: 2200,
    duration_days: 30,
    duration_type: 'DAYS',
    description: 'Affordable entry plan for new members.',
    created_at: isoDateTime(-100, 10, 30),
  },
];

type MemberSeed = {
  name: string;
  phone: string;
  email: string;
  planId: string;
  joinOffset: number;
  expiryOffset: number;
  status: Member['status'];
  dueAmount?: number;
};

const memberSeeds: MemberSeed[] = [
  { name: 'Ahmed Sharif', phone: '01711223344', email: 'ahmed@pulsepeak.demo', planId: 'plan-elite', joinOffset: -150, expiryOffset: 24, status: 'ACTIVE' },
  { name: 'Nusrat Jahan', phone: '01822334455', email: 'nusrat@pulsepeak.demo', planId: 'plan-power', joinOffset: -120, expiryOffset: 5, status: 'ACTIVE', dueAmount: 0 },
  { name: 'Rakibul Islam', phone: '01933445566', email: 'rakib@pulsepeak.demo', planId: 'plan-starter', joinOffset: -90, expiryOffset: -9, status: 'INACTIVE', dueAmount: 2200 },
  { name: 'Tanvir Rahman', phone: '01544556677', email: 'tanvir@pulsepeak.demo', planId: 'plan-elite', joinOffset: -88, expiryOffset: 2, status: 'ACTIVE' },
  { name: 'Sumaiya Akter', phone: '01655667788', email: 'sumaiya@pulsepeak.demo', planId: 'plan-power', joinOffset: -80, expiryOffset: 0, status: 'ACTIVE', dueAmount: 500 },
  { name: 'Mahir Faisal', phone: '01366778899', email: 'mahir@pulsepeak.demo', planId: 'plan-starter', joinOffset: -72, expiryOffset: 16, status: 'ACTIVE' },
  { name: 'Faria Mahmud', phone: '01721112233', email: 'faria@pulsepeak.demo', planId: 'plan-power', joinOffset: -68, expiryOffset: 12, status: 'ACTIVE' },
  { name: 'Sadia Rahman', phone: '01831112233', email: 'sadia@pulsepeak.demo', planId: 'plan-elite', joinOffset: -61, expiryOffset: 31, status: 'ACTIVE' },
  { name: 'Sohan Kabir', phone: '01941112233', email: 'sohan@pulsepeak.demo', planId: 'plan-power', joinOffset: -54, expiryOffset: 6, status: 'ACTIVE', dueAmount: 1200 },
  { name: 'Mst Tania', phone: '01551112233', email: 'tania@pulsepeak.demo', planId: 'plan-starter', joinOffset: -49, expiryOffset: -2, status: 'INACTIVE', dueAmount: 2200 },
  { name: 'Raihan Ahmed', phone: '01661112233', email: 'raihan@pulsepeak.demo', planId: 'plan-power', joinOffset: -47, expiryOffset: 9, status: 'ACTIVE' },
  { name: 'Jannatul Ferdous', phone: '01771112233', email: 'jannat@pulsepeak.demo', planId: 'plan-elite', joinOffset: -43, expiryOffset: 18, status: 'ACTIVE' },
  { name: 'Arif Hasan', phone: '01881112233', email: 'arif@pulsepeak.demo', planId: 'plan-starter', joinOffset: -39, expiryOffset: -5, status: 'INACTIVE', dueAmount: 2200 },
  { name: 'Mehjabin Noor', phone: '01991112233', email: 'mehjabin@pulsepeak.demo', planId: 'plan-power', joinOffset: -35, expiryOffset: 4, status: 'ACTIVE', dueAmount: 800 },
  { name: 'Farhan Chowdhury', phone: '01591112233', email: 'farhan@pulsepeak.demo', planId: 'plan-elite', joinOffset: -34, expiryOffset: 28, status: 'ACTIVE' },
  { name: 'Puja Sarker', phone: '01601112233', email: 'puja@pulsepeak.demo', planId: 'plan-starter', joinOffset: -28, expiryOffset: 14, status: 'ACTIVE' },
  { name: 'Israt Jahan', phone: '01711112234', email: 'israt@pulsepeak.demo', planId: 'plan-power', joinOffset: -25, expiryOffset: 3, status: 'ACTIVE' },
  { name: 'Tariq Islam', phone: '01811112234', email: 'tariq@pulsepeak.demo', planId: 'plan-elite', joinOffset: -22, expiryOffset: 20, status: 'ACTIVE' },
  { name: 'Rima Akter', phone: '01911112234', email: 'rima@pulsepeak.demo', planId: 'plan-power', joinOffset: -20, expiryOffset: 1, status: 'ACTIVE', dueAmount: 500 },
  { name: 'Shuvo Paul', phone: '01511112234', email: 'shuvo@pulsepeak.demo', planId: 'plan-starter', joinOffset: -18, expiryOffset: -1, status: 'INACTIVE', dueAmount: 2200 },
  { name: 'Sabbir Hossain', phone: '01611112234', email: 'sabbir@pulsepeak.demo', planId: 'plan-elite', joinOffset: -14, expiryOffset: 25, status: 'ACTIVE' },
  { name: 'Mim Rahman', phone: '01711112235', email: 'mim@pulsepeak.demo', planId: 'plan-starter', joinOffset: -12, expiryOffset: 8, status: 'ACTIVE' },
  { name: 'Nabil Hasan', phone: '01811112235', email: 'nabil@pulsepeak.demo', planId: 'plan-power', joinOffset: -10, expiryOffset: 7, status: 'ACTIVE' },
  { name: 'Tahmid Alif', phone: '01911112235', email: 'tahmid@pulsepeak.demo', planId: 'plan-elite', joinOffset: -9, expiryOffset: 27, status: 'ACTIVE' },
  { name: 'Tasnia Islam', phone: '01511112235', email: 'tasnia@pulsepeak.demo', planId: 'plan-power', joinOffset: -7, expiryOffset: 11, status: 'ACTIVE' },
  { name: 'Zarin Tasnim', phone: '01611112235', email: 'zarin@pulsepeak.demo', planId: 'plan-starter', joinOffset: -6, expiryOffset: 13, status: 'ACTIVE' },
];

const memberByIdPlan = Object.fromEntries(plans.map((plan) => [plan.id, plan]));

const members: Member[] = memberSeeds.map((seed, index) => ({
  id: `demo-member-${index + 1}`,
  gym_id: DEMO_GYM_ID,
  full_name: seed.name,
  phone: seed.phone,
  email: seed.email,
  status: seed.status,
  plan_id: seed.planId,
  join_date: isoDate(seed.joinOffset),
  expiry_date: isoDate(seed.expiryOffset),
  created_at: isoDateTime(seed.joinOffset, 9 + (index % 4), 15),
  qr_code_value: `DEMO:${DEMO_GYM_ID}:demo-member-${index + 1}`,
  qr_generated_at: isoDateTime(seed.joinOffset, 11, 0),
  plans: memberByIdPlan[seed.planId],
  notes: seed.dueAmount ? `Outstanding balance: ${seed.dueAmount}` : undefined,
  ...(seed.dueAmount ? ({ due_amount: seed.dueAmount } as object) : {}),
})) as Member[];

const payments: Payment[] = members.slice(0, 18).map((member, index) => {
  const plan = memberByIdPlan[member.plan_id || ''] ?? plans[0];
  const createdAt = isoDateTime(-(index % 14), 8 + (index % 8), 10);
  return {
    id: `demo-payment-${index + 1}`,
    gym_id: DEMO_GYM_ID,
    member_id: member.id,
    plan_id: plan.id,
    price_paid: index % 5 === 0 ? Math.max(plan.price - 600, 800) : plan.price,
    payment_method: ['BKASH', 'CASH', 'CARD', 'BANK_TRANSFER'][index % 4],
    start_date: member.join_date || isoDate(-30),
    end_date: member.expiry_date || isoDate(0),
    created_at: createdAt,
    members: { full_name: member.full_name },
    plans: { name: plan.name },
  };
});

const attendanceMembers = members.filter((member) => member.status === 'ACTIVE').slice(0, 16);
const attendance: Attendance[] = attendanceMembers.flatMap((member, index) => {
  const todayRecord: Attendance = {
    id: `demo-attendance-today-${index + 1}`,
    gym_id: DEMO_GYM_ID,
    member_id: member.id,
    check_in_time: isoDateTime(0, 6 + (index % 10), (index * 7) % 60),
    method: index % 3 === 0 ? 'MANUAL' : 'QR_CODE',
    members: {
      full_name: member.full_name,
      plan_id: member.plan_id,
      status: member.status,
      plans: member.plans ? { name: member.plans.name } : undefined,
    },
  };
  const earlierRecord: Attendance = {
    id: `demo-attendance-history-${index + 1}`,
    gym_id: DEMO_GYM_ID,
    member_id: member.id,
    check_in_time: isoDateTime(-((index % 6) + 1), 18 - (index % 5), (index * 9) % 60),
    method: index % 2 === 0 ? 'QR_CODE' : 'MANUAL',
    members: {
      full_name: member.full_name,
      plan_id: member.plan_id,
      status: member.status,
      plans: member.plans ? { name: member.plans.name } : undefined,
    },
  };
  return [todayRecord, earlierRecord];
});

const staff: DemoStaffMember[] = [
  {
    id: 'demo-staff-1',
    user_id: 'demo-owner',
    email: 'owner@pulsepeak.demo',
    display_name: 'Shafin Alam',
    role: 'OWNER',
    status: 'ACTIVE',
    joined_at: isoDateTime(-180, 10, 0),
    invited_at: isoDateTime(-181, 15, 0),
    created_at: isoDateTime(-181, 15, 0),
  },
  {
    id: 'demo-staff-2',
    user_id: 'demo-manager',
    email: 'manager@pulsepeak.demo',
    display_name: 'Rupa Karim',
    role: 'MANAGER',
    status: 'ACTIVE',
    joined_at: isoDateTime(-90, 10, 0),
    invited_at: isoDateTime(-92, 13, 0),
    created_at: isoDateTime(-92, 13, 0),
  },
  {
    id: 'demo-staff-3',
    user_id: 'demo-trainer-1',
    email: 'trainer1@pulsepeak.demo',
    display_name: 'Sagar Ahmed',
    role: 'TRAINER',
    status: 'ACTIVE',
    joined_at: isoDateTime(-70, 8, 0),
    invited_at: isoDateTime(-72, 10, 30),
    created_at: isoDateTime(-72, 10, 30),
  },
  {
    id: 'demo-staff-4',
    user_id: null,
    email: 'trainer2@pulsepeak.demo',
    display_name: 'Nasrin Sultana',
    role: 'TRAINER',
    status: 'INVITED',
    joined_at: null,
    invited_at: isoDateTime(-2, 16, 20),
    created_at: isoDateTime(-2, 16, 20),
  },
];

const notifications: DemoNotification[] = [
  {
    id: 'demo-note-1',
    title: 'Renewals due today',
    body: '4 memberships are due for renewal before closing.',
    created_at: isoDateTime(0, 8, 10),
    read: false,
    related_member_id: members[1]?.id,
  },
  {
    id: 'demo-note-2',
    title: 'Attendance peak incoming',
    body: 'Evening check-ins are trending 18% above last Friday.',
    created_at: isoDateTime(0, 14, 30),
    read: false,
  },
  {
    id: 'demo-note-3',
    title: 'Trainer invite pending',
    body: 'Nasrin has not yet accepted the trainer invitation.',
    created_at: isoDateTime(-1, 18, 15),
    read: true,
  },
];

export const DEMO_GYM = {
  id: DEMO_GYM_ID,
  name: 'PulsePeak Fitness',
};

export const createInitialDemoState = (): DemoState => ({
  gymName: DEMO_GYM.name,
  plans: plans.map((plan) => ({ ...plan })),
  members: members.map((member) => ({ ...member, plans: member.plans ? { ...member.plans } : undefined })),
  payments: payments.map((payment) => ({
    ...payment,
    members: payment.members ? { ...payment.members } : undefined,
    plans: payment.plans ? { ...payment.plans } : undefined,
  })),
  attendance: attendance.map((entry) => ({
    ...entry,
    members: entry.members
      ? {
          ...entry.members,
          plans: entry.members.plans ? { ...entry.members.plans } : undefined,
        }
      : undefined,
  })),
  staff: staff.map((item) => ({ ...item })),
  notifications: notifications.map((item) => ({ ...item })),
});

export type DemoMetrics = {
  totalMembers: number;
  activeMembers: number;
  expiringSoon: number;
  revenue: number;
  todayCheckins: number;
  retentionRate: number;
  churnRisk: number;
};

export const getDemoMetrics = (state: DemoState): DemoMetrics => {
  const activeMembers = state.members.filter((member) => member.status === 'ACTIVE').length;
  const expiringSoon = state.members.filter((member) => {
    if (!member.expiry_date) return false;
    const expiry = new Date(member.expiry_date);
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7;
  }).length;
  const revenue = state.payments.reduce((sum, payment) => sum + payment.price_paid, 0);
  const todayDate = isoDate(0);
  const todayCheckins = state.attendance.filter((entry) => entry.check_in_time.startsWith(todayDate)).length;

  return {
    totalMembers: state.members.length,
    activeMembers,
    expiringSoon,
    revenue,
    todayCheckins,
    retentionRate: 92,
    churnRisk: 7,
  };
};
