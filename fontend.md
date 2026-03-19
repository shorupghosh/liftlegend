{
  "app": {
    "name": "LiftLegend",
    "type": "Gyms",
    "framework": "React (Vite)",
    "navigation": {
      "landing": "LandingPage.tsx",
      "auth": ["Login.tsx", "ResetPassword.tsx"],
      "subscriptionLock": "SubscriptionLock.tsx",
      "dashboards": {
        "tenantAdmin": [
          "AdminDashboard.tsx",
          "AdminMembers.tsx",
          "AdminPlans.tsx",
          "AdminPayments.tsx",
          "AdminAttendance.tsx",
          "AdminAnalytics.tsx",
          "AdminNotifications.tsx",
          "AdminStaff.tsx",
          "AdminSettings.tsx"
        ],
        "superAdmin": [
          "PlatformOverview.tsx",
          "GymsManagement.tsx",
          "RevenueDashboard.tsx",
          "SystemHealth.tsx",
          "UsageAnalytics.tsx",
          "SubscriptionManagement.tsx",
          "SupportTickets.tsx",
          "AuditLogs.tsx"
        ]
      }
    },
    "globalState": [
      "tenant",
      "user",
      "userRole",
      "members",
      "plans",
      "subscriptions",
      "attendance",
      "payments",
      "staff",
      "notifications",
      "analytics"
    ],
    "pages": {
      "LandingPage": {
        "purpose": "Marketing & conversion",
        "majorComponents": ["HeroBanner", "FeaturesSection", "PricingSection", "ProductDemo", "CustomerReviews", "FAQ", "CallToAction", "ROICalculator"]
      },
      "AuthPages": {
        "majorComponents": ["EmailPasswordLogin", "MagicLinkLogin", "GoogleLogin", "TenantDiscovery"]
      },
      "SubscriptionLock": {
        "majorComponents": ["PlanDetails", "BillingInfo", "NextPayment", "UpgradeButton"]
      },
      "TenantAdmin": {
        "AdminDashboard": ["MetricsCards", "ChartsSection"],
        "AdminMembers": ["MembersTable", "SearchFilter", "ImportExportActions"],
        "AdminPlans": ["PlansTable", "CRUDActions"],
        "AdminPayments": ["PaymentsTable", "PaymentActions"],
        "AdminAttendance": ["AttendanceReport", "CheckInLogs"],
        "AdminAnalytics": ["RevenueCharts", "RetentionCharts", "PeakHoursCharts"],
        "AdminNotifications": ["MessageComposer", "TargetFilters", "ChannelSelectors"],
        "AdminStaff": ["StaffTable", "InviteStaffButton", "RoleAssignment"],
        "AdminSettings": ["ProfileForm", "BrandingUploader", "BillingInfo", "Integrations"]
      },
      "SuperAdmin": {
        "PlatformOverview": ["TotalGymsMetrics", "ActiveGymsMetrics", "ChartsSection"],
        "GymsManagement": ["GymsTable", "GymActions"],
        "RevenueDashboard": ["MRRCard", "ARRCard", "ChurnRateCard", "RevenueCharts"],
        "SystemHealth": ["APIMonitoring", "DBMonitoring", "ErrorLogs", "ActiveUsersChart"],
        "UsageAnalytics": ["MembersCreatedChart", "CheckInsChart", "TopGymsList"],
        "SubscriptionManagement": ["SubscriptionTable", "UpdatePlanActions"],
        "SupportTickets": ["TicketsTable", "TicketActions"],
        "AuditLogs": ["AuditTable", "FilterLogs"]
      }
    },
    "performanceOptimizations": [
      "Network Request Debouncing",
      "DOM Virtualization",
      "Render Cycle Memoization",
      "Optimistic UI Updates",
      "Lazy Loading",
      "Query Caching"
    ],
    "uxComponents": [
      "ToastNotifications",
      "LoadingSpinners",
      "ErrorBoundaries",
      "ModalDialogs",
      "ConfirmationDialogs",
      "ResponsiveLayouts"
    ],
    "fileStructure": {
      "src": {
        "pages": ["landing", "auth", "admin", "super-admin"],
        "components": [],
        "context": [],
        "hooks": [],
        "services": [],
        "utils": [],
        "assets": []
      }
    },
    "productRecommendations": [
      "Remove Food Tracking for MVP",
      "Focus on Members, Payments, Attendance, Plans",
      "Implement Super Admin features early",
      "Include Payment & Analytics Dashboards",
      "Use tenant-aware components"
    ]
  }
}