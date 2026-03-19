{
  "backend": {
    "name": "LiftLegend Backend",
    "type": "BaaS + Edge Functions",
    "framework": "Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)",
    "authentication": {
      "method": "Supabase Auth",
      "providers": ["Email/Password", "OAuth (Google optional)"],
      "tenantMapping": "user_roles -> gym_id",
      "RBAC": ["SUPER_ADMIN", "OWNER", "MANAGER", "TRAINER"]
    },
    "multiTenantArchitecture": {
      "model": "Single Database, Shared Schema",
      "tenantIdentity": "gyms table",
      "isolation": "PostgreSQL Row Level Security (RLS) per gym_id"
    },
    "databaseSchema": {
      "masterTables": {
        "gyms": {
          "columns": ["id", "owner_id", "name", "contact_phone", "subscription_tier", "status", "branding", "trial_ends_at", "next_billing_date"]
        },
        "user_roles": {
          "columns": ["id", "user_id", "gym_id", "role"],
          "triggers": ["assign OWNER role to gym creator automatically"]
        }
      },
      "tenantTables": {
        "members": ["id", "gym_id", "full_name", "phone", "email", "date_of_birth", "gender", "status", "notes", "plan"],
        "plans": ["id", "gym_id", "name", "price", "duration_days", "duration_type", "description"],
        "membership_history": ["id", "gym_id", "member_id", "plan_id", "start_date", "end_date", "price_paid", "payment_method"],
        "attendance": ["id", "gym_id", "member_id", "check_in_time", "method"],
        "notifications": ["id", "gym_id", "user_id", "title", "message", "is_read"]
      }
    },
    "coreWorkflows": {
      "authentication": "Supabase Auth + RLS via user_roles",
      "tenantProvisioning": "Trigger creates OWNER role on gym creation",
      "checkIn": "QR scan → verify active membership → insert into attendance",
      "membershipRenewal": "Update members + insert into membership_history",
      "realTimeUpdates": [
        "member-{gym_id}",
        "attendance-{gym_id}",
        "plan-{gym_id}"
      ]
    },
    "security": {
      "RLSPolicies": [
        "Gym owners can access only their gym's data",
        "Roles limit access to rows in user_roles",
        "Business tables accessible only if gym_id matches user_roles.gym_id"
      ],
      "EdgeFunctions": [
        "Secure payment processing (Stripe, bKash, bank callbacks)",
        "Automated email/SMS notifications",
        "Bulk CSV import/export",
        "Soft delete logic"
      ]
    },
    "performanceScalability": {
      "indexing": [
        "members: gym_id, (gym_id,status)",
        "attendance: gym_id, check_in_time DESC",
        "plans: gym_id"
      ],
      "connectionPooling": "Supavisor / PgBouncer",
      "materializedViews": [
        "daily_revenue_by_gym",
        "daily_checkins_by_gym"
      ],
      "paginatedFetching": true,
      "eventDrivenState": true
    },
    "backendStructure": {
      "services": ["membershipService", "attendanceService", "plansService", "notificationsService", "billingService"],
      "controllers": ["authController", "gymController", "memberController", "planController", "attendanceController", "analyticsController"],
      "repositories": ["gymRepository", "memberRepository", "planRepository", "attendanceRepository", "membershipHistoryRepository"],
      "middleware": ["authMiddleware", "roleMiddleware", "errorHandler", "rateLimiter"],
      "apiRoutes": ["REST endpoints via Supabase RPC/REST", "Edge Functions for sensitive logic"],
      "backgroundWorkers": ["paymentReminders", "membershipExpiry", "analyticsAggregation", "notificationDispatch"]
    },
    "infrastructure": {
      "frontendHosting": "Vercel / CDN",
      "backendHosting": "Supabase + Edge Functions",
      "databaseHosting": "Supabase PostgreSQL",
      "storage": "Supabase Storage (images, CSVs)",
      "monitoring": ["Sentry", "Logtail", "Supabase Logs"],
      "CI/CD": ["GitHub Actions → Vercel Deploy", "Edge Functions auto-deploy"]
    },
    "mvpFocus": [
      "Tenant Management",
      "Members CRUD",
      "Plans CRUD",
      "Attendance Tracking",
      "Payments Tracking",
      "Super Admin Dashboard",
      "Real-Time Updates via Channels"
    ]
  }
}