// Admin Portal Permissions Only - Focused on admin functionality
export const PORTAL_PERMISSIONS = [
  // === ADMIN NAVIGATION PERMISSIONS ===
  // Home & Dashboard
  { id: 1, name: 'Home Access', codename: 'home_access', category: 'Navigation', description: 'Access to admin home dashboard' },
  { id: 2, name: 'Dashboard View', codename: 'dashboard_view', category: 'Navigation', description: 'View admin dashboard' },
  
  // Inbox & Messages
  { id: 3, name: 'Inbox Access', codename: 'inbox_access', category: 'Navigation', description: 'Access to admin inbox and messages' },
  { id: 4, name: 'Inbox View', codename: 'inbox_view', category: 'Navigation', description: 'View inbox messages' },
  { id: 5, name: 'Inbox Send', codename: 'inbox_send', category: 'Navigation', description: 'Send messages in inbox' },
  
  // === USER MANAGEMENT PERMISSIONS ===
  { id: 6, name: 'Users Access', codename: 'users_access', category: 'User Management', description: 'Access to users section' },
  { id: 7, name: 'User View', codename: 'user_view', category: 'User Management', description: 'View user profiles and information' },
  { id: 8, name: 'User Add', codename: 'user_add', category: 'User Management', description: 'Add new users to the system' },
  { id: 9, name: 'User Edit', codename: 'user_edit', category: 'User Management', description: 'Edit existing user information' },
  { id: 10, name: 'User Delete', codename: 'user_delete', category: 'User Management', description: 'Delete users from the system' },
  { id: 11, name: 'User Profile View', codename: 'user_profile_view', category: 'User Management', description: 'View user profile details' },
  { id: 12, name: 'User Profile Edit', codename: 'user_profile_edit', category: 'User Management', description: 'Edit user profile information' },
  
  // === STAFF USER MANAGEMENT PERMISSIONS ===
  { id: 187, name: 'Staff Users Access', codename: 'staff_users_access', category: 'Staff Management', description: 'Access to staff users section' },
  { id: 188, name: 'Staff User View', codename: 'staff_user_view', category: 'Staff Management', description: 'View staff user profiles and information' },
  { id: 189, name: 'Staff User Add', codename: 'staff_user_add', category: 'Staff Management', description: 'Add new staff users to the system' },
  { id: 190, name: 'Staff User Edit', codename: 'staff_user_edit', category: 'Staff Management', description: 'Edit existing staff user information' },
  { id: 191, name: 'Staff User Delete', codename: 'staff_user_delete', category: 'Staff Management', description: 'Delete staff users from the system' },
  
  // === EXPERT MANAGEMENT PERMISSIONS ===
  { id: 13, name: 'Experts Access', codename: 'experts_access', category: 'Expert Management', description: 'Access to experts section' },
  { id: 14, name: 'Expert Dashboard', codename: 'expert_dashboard', category: 'Expert Management', description: 'Access expert dashboard' },
  { id: 15, name: 'Expert View', codename: 'expert_view', category: 'Expert Management', description: 'View expert profiles and information' },
  { id: 16, name: 'Expert Add', codename: 'expert_add', category: 'Expert Management', description: 'Add new experts to the system' },
  { id: 17, name: 'Expert Edit', codename: 'expert_edit', category: 'Expert Management', description: 'Edit existing expert information' },
  { id: 18, name: 'Expert Delete', codename: 'expert_delete', category: 'Expert Management', description: 'Delete experts from the system' },
  { id: 19, name: 'Expert Commission', codename: 'expert_commission', category: 'Expert Management', description: 'Manage expert commissions' },
  { id: 20, name: 'Expert Payment', codename: 'expert_payment', category: 'Expert Management', description: 'Manage expert payments' },
  
  // === AFFILIATE MANAGEMENT PERMISSIONS ===
  { id: 21, name: 'Affiliates Access', codename: 'affiliates_access', category: 'Affiliate Management', description: 'Access to affiliates section' },
  { id: 22, name: 'Affiliate Dashboard', codename: 'affiliate_dashboard', category: 'Affiliate Management', description: 'Access affiliate dashboard' },
  { id: 23, name: 'Affiliate Users', codename: 'affiliate_users', category: 'Affiliate Management', description: 'Manage affiliate users' },
  { id: 24, name: 'Affiliate Commission Type', codename: 'affiliate_commission_type', category: 'Affiliate Management', description: 'Manage commission types' },
  { id: 25, name: 'Affiliate Payout List', codename: 'affiliate_payout_list', category: 'Affiliate Management', description: 'View payout lists' },
  { id: 26, name: 'Affiliate View', codename: 'affiliate_view', category: 'Affiliate Management', description: 'View affiliate information' },
  { id: 27, name: 'Affiliate Add', codename: 'affiliate_add', category: 'Affiliate Management', description: 'Add new affiliates' },
  { id: 28, name: 'Affiliate Edit', codename: 'affiliate_edit', category: 'Affiliate Management', description: 'Edit affiliate information' },
  { id: 29, name: 'Affiliate Delete', codename: 'affiliate_delete', category: 'Affiliate Management', description: 'Delete affiliates' },
  
  // === LMS (Learning Management System) PERMISSIONS ===
  { id: 30, name: 'LMS Access', codename: 'lms_access', category: 'LMS', description: 'Access to LMS section' },
  { id: 31, name: 'Programs Access', codename: 'programs_access', category: 'LMS', description: 'Access to programs section' },
  { id: 32, name: 'Program View', codename: 'program_view', category: 'LMS', description: 'View programs' },
  { id: 33, name: 'Program Add', codename: 'program_add', category: 'LMS', description: 'Add new programs' },
  { id: 34, name: 'Program Edit', codename: 'program_edit', category: 'LMS', description: 'Edit existing programs' },
  { id: 35, name: 'Program Delete', codename: 'program_delete', category: 'LMS', description: 'Delete programs' },
  
  { id: 36, name: 'Modules Access', codename: 'modules_access', category: 'LMS', description: 'Access to modules section' },
  { id: 37, name: 'Module View', codename: 'module_view', category: 'LMS', description: 'View modules' },
  { id: 38, name: 'Module Add', codename: 'module_add', category: 'LMS', description: 'Add new modules' },
  { id: 39, name: 'Module Edit', codename: 'module_edit', category: 'LMS', description: 'Edit existing modules' },
  { id: 40, name: 'Module Delete', codename: 'module_delete', category: 'LMS', description: 'Delete modules' },
  
  { id: 41, name: 'Sessions Access', codename: 'sessions_access', category: 'LMS', description: 'Access to sessions section' },
  { id: 42, name: 'Video Sessions', codename: 'video_sessions', category: 'LMS', description: 'Access to video sessions' },
  { id: 43, name: 'Image Sessions', codename: 'image_sessions', category: 'LMS', description: 'Access to image sessions' },
  { id: 44, name: 'Audio Sessions', codename: 'audio_sessions', category: 'LMS', description: 'Access to audio sessions' },
  { id: 45, name: 'Session View', codename: 'session_view', category: 'LMS', description: 'View sessions' },
  { id: 46, name: 'Session Add', codename: 'session_add', category: 'LMS', description: 'Add new sessions' },
  { id: 47, name: 'Session Edit', codename: 'session_edit', category: 'LMS', description: 'Edit existing sessions' },
  { id: 48, name: 'Session Delete', codename: 'session_delete', category: 'LMS', description: 'Delete sessions' },
  
  { id: 49, name: 'Quiz Access', codename: 'quiz_access', category: 'LMS', description: 'Access to quiz section' },
  { id: 50, name: 'Quiz View', codename: 'quiz_view', category: 'LMS', description: 'View quizzes' },
  { id: 51, name: 'Quiz Add', codename: 'quiz_add', category: 'LMS', description: 'Add new quizzes' },
  { id: 52, name: 'Quiz Edit', codename: 'quiz_edit', category: 'LMS', description: 'Edit existing quizzes' },
  { id: 53, name: 'Quiz Delete', codename: 'quiz_delete', category: 'LMS', description: 'Delete quizzes' },
  
  { id: 54, name: 'Categories Access', codename: 'categories_access', category: 'LMS', description: 'Access to categories section' },
  { id: 55, name: 'Category View', codename: 'category_view', category: 'LMS', description: 'View categories' },
  { id: 56, name: 'Category Add', codename: 'category_add', category: 'LMS', description: 'Add new categories' },
  { id: 57, name: 'Category Edit', codename: 'category_edit', category: 'LMS', description: 'Edit existing categories' },
  { id: 58, name: 'Category Delete', codename: 'category_delete', category: 'LMS', description: 'Delete categories' },
  
  { id: 59, name: 'Tags Access', codename: 'tags_access', category: 'LMS', description: 'Access to tags section' },
  { id: 60, name: 'Tag View', codename: 'tag_view', category: 'LMS', description: 'View tags' },
  { id: 61, name: 'Tag Add', codename: 'tag_add', category: 'LMS', description: 'Add new tags' },
  { id: 62, name: 'Tag Edit', codename: 'tag_edit', category: 'LMS', description: 'Edit existing tags' },
  { id: 63, name: 'Tag Delete', codename: 'tag_delete', category: 'LMS', description: 'Delete tags' },
  
  // === SUBSCRIPTION MANAGEMENT PERMISSIONS ===
  { id: 64, name: 'Subscription Plans Access', codename: 'subscription_plans_access', category: 'Subscription Management', description: 'Access to subscription plans' },
  { id: 65, name: 'Subscription Plan View', codename: 'subscription_plan_view', category: 'Subscription Management', description: 'View subscription plans' },
  { id: 66, name: 'Subscription Plan Add', codename: 'subscription_plan_add', category: 'Subscription Management', description: 'Add new subscription plans' },
  { id: 67, name: 'Subscription Plan Edit', codename: 'subscription_plan_edit', category: 'Subscription Management', description: 'Edit subscription plans' },
  { id: 68, name: 'Subscription Plan Delete', codename: 'subscription_plan_delete', category: 'Subscription Management', description: 'Delete subscription plans' },
  
  { id: 69, name: 'Subscription Pages Access', codename: 'subscription_pages_access', category: 'Subscription Management', description: 'Access to subscription pages' },
  { id: 70, name: 'Subscription Page View', codename: 'subscription_page_view', category: 'Subscription Management', description: 'View subscription pages' },
  { id: 71, name: 'Subscription Page Add', codename: 'subscription_page_add', category: 'Subscription Management', description: 'Add new subscription pages' },
  { id: 72, name: 'Subscription Page Edit', codename: 'subscription_page_edit', category: 'Subscription Management', description: 'Edit subscription pages' },
  { id: 73, name: 'Subscription Page Delete', codename: 'subscription_page_delete', category: 'Subscription Management', description: 'Delete subscription pages' },
  
  // === GOAL TRACKING PERMISSIONS ===
  { id: 74, name: 'Insights Goal Access', codename: 'insights_goal_access', category: 'Goal Tracking', description: 'Access to insights goal section' },
  { id: 75, name: 'Goal View', codename: 'goal_view', category: 'Goal Tracking', description: 'View user goals and progress' },
  { id: 76, name: 'Goal Add', codename: 'goal_add', category: 'Goal Tracking', description: 'Add new goals' },
  { id: 77, name: 'Goal Edit', codename: 'goal_edit', category: 'Goal Tracking', description: 'Edit existing goals' },
  { id: 78, name: 'Goal Delete', codename: 'goal_delete', category: 'Goal Tracking', description: 'Delete goals' },
  { id: 79, name: 'Monthly Goal', codename: 'monthly_goal', category: 'Goal Tracking', description: 'Access monthly goal tracking' },
  { id: 80, name: 'Journal Access', codename: 'journal_access', category: 'Goal Tracking', description: 'Access to journal feature' },
  { id: 81, name: 'Sleep Tracker', codename: 'sleep_tracker', category: 'Goal Tracking', description: 'Access to sleep tracker' },
  { id: 82, name: 'Daily Insights', codename: 'daily_insights', category: 'Goal Tracking', description: 'Access to daily insights' },
  
  // === TRACKER PERMISSIONS ===
  { id: 83, name: 'Tracker Access', codename: 'tracker_access', category: 'Tracker', description: 'Access to tracker section' },
  { id: 84, name: 'Tracker View', codename: 'tracker_view', category: 'Tracker', description: 'View tracker data' },
  { id: 85, name: 'Tracker Add', codename: 'tracker_add', category: 'Tracker', description: 'Add tracker entries' },
  { id: 86, name: 'Tracker Edit', codename: 'tracker_edit', category: 'Tracker', description: 'Edit tracker entries' },
  { id: 87, name: 'Tracker Delete', codename: 'tracker_delete', category: 'Tracker', description: 'Delete tracker entries' },
  
  // === PERMISSIONS MANAGEMENT ===
  { id: 88, name: 'Permissions Access', codename: 'permissions_access', category: 'Permissions Management', description: 'Access to permissions section' },
  { id: 89, name: 'Group Permissions View', codename: 'group_permissions_view', category: 'Permissions Management', description: 'View group permissions' },
  { id: 90, name: 'Group Permissions Add', codename: 'group_permissions_add', category: 'Permissions Management', description: 'Add group permissions' },
  { id: 91, name: 'Group Permissions Edit', codename: 'group_permissions_edit', category: 'Permissions Management', description: 'Edit group permissions' },
  { id: 92, name: 'Group Permissions Delete', codename: 'group_permissions_delete', category: 'Permissions Management', description: 'Delete group permissions' },
  
  // === FAQ MANAGEMENT ===
  { id: 93, name: 'FAQ Access', codename: 'faq_access', category: 'FAQ Management', description: 'Access to FAQ section' },
  { id: 94, name: 'FAQ View', codename: 'faq_view', category: 'FAQ Management', description: 'View FAQs' },
  { id: 95, name: 'FAQ Add', codename: 'faq_add', category: 'FAQ Management', description: 'Add new FAQs' },
  { id: 96, name: 'FAQ Edit', codename: 'faq_edit', category: 'FAQ Management', description: 'Edit existing FAQs' },
  { id: 97, name: 'FAQ Delete', codename: 'faq_delete', category: 'FAQ Management', description: 'Delete FAQs' },
  
  // === ADMIN HEADER & DROPDOWN PERMISSIONS ===
  { id: 98, name: 'User Dropdown Access', codename: 'user_dropdown_access', category: 'Header & Navigation', description: 'Access to user dropdown menu' },
  { id: 99, name: 'Profile Access', codename: 'profile_access', category: 'Header & Navigation', description: 'Access to profile from dropdown' },
  { id: 100, name: 'Settings Access', codename: 'settings_access', category: 'Header & Navigation', description: 'Access to settings from dropdown' },
  { id: 101, name: 'Logout Access', codename: 'logout_access', category: 'Header & Navigation', description: 'Access to logout functionality' },
  
  { id: 102, name: 'Notification Dropdown', codename: 'notification_dropdown', category: 'Header & Navigation', description: 'Access to notification dropdown' },
  { id: 103, name: 'Notification View', codename: 'notification_view', category: 'Header & Navigation', description: 'View notifications' },
  { id: 104, name: 'Notification Mark Read', codename: 'notification_mark_read', category: 'Header & Navigation', description: 'Mark notifications as read' },
  
  // === ADMIN BUTTON & ACTION PERMISSIONS ===
  { id: 105, name: 'Add Button Access', codename: 'add_button_access', category: 'UI Actions', description: 'Access to add/create buttons' },
  { id: 106, name: 'Edit Button Access', codename: 'edit_button_access', category: 'UI Actions', description: 'Access to edit buttons' },
  { id: 107, name: 'Delete Button Access', codename: 'delete_button_access', category: 'UI Actions', description: 'Access to delete buttons' },
  { id: 108, name: 'View Button Access', codename: 'view_button_access', category: 'UI Actions', description: 'Access to view buttons' },
  { id: 109, name: 'Save Button Access', codename: 'save_button_access', category: 'UI Actions', description: 'Access to save buttons' },
  { id: 110, name: 'Cancel Button Access', codename: 'cancel_button_access', category: 'UI Actions', description: 'Access to cancel buttons' },
  { id: 111, name: 'Submit Button Access', codename: 'submit_button_access', category: 'UI Actions', description: 'Access to submit buttons' },
  { id: 112, name: 'Search Button Access', codename: 'search_button_access', category: 'UI Actions', description: 'Access to search buttons' },
  { id: 113, name: 'Filter Button Access', codename: 'filter_button_access', category: 'UI Actions', description: 'Access to filter buttons' },
  { id: 114, name: 'Export Button Access', codename: 'export_button_access', category: 'UI Actions', description: 'Access to export buttons' },
  { id: 115, name: 'Import Button Access', codename: 'import_button_access', category: 'UI Actions', description: 'Access to import buttons' },
  
  // === ADMIN TABLE & LIST PERMISSIONS ===
  { id: 116, name: 'Table View Access', codename: 'table_view_access', category: 'Data Display', description: 'Access to table views' },
  { id: 117, name: 'Table Row Actions', codename: 'table_row_actions', category: 'Data Display', description: 'Access to table row actions' },
  { id: 118, name: 'Table Pagination', codename: 'table_pagination', category: 'Data Display', description: 'Access to table pagination' },
  { id: 119, name: 'Table Sorting', codename: 'table_sorting', category: 'Data Display', description: 'Access to table sorting' },
  { id: 120, name: 'Table Filtering', codename: 'table_filtering', category: 'Data Display', description: 'Access to table filtering' },
  { id: 121, name: 'Table Search', codename: 'table_search', category: 'Data Display', description: 'Access to table search' },
  
  // === ADMIN FORM PERMISSIONS ===
  { id: 122, name: 'Form Access', codename: 'form_access', category: 'Forms', description: 'Access to forms' },
  { id: 123, name: 'Form Submit', codename: 'form_submit', category: 'Forms', description: 'Submit forms' },
  { id: 124, name: 'Form Reset', codename: 'form_reset', category: 'Forms', description: 'Reset forms' },
  { id: 125, name: 'Form Validation', codename: 'form_validation', category: 'Forms', description: 'Access to form validation' },
  { id: 126, name: 'Form Upload', codename: 'form_upload', category: 'Forms', description: 'Upload files in forms' },
  
  // === ADMIN MODAL & POPUP PERMISSIONS ===
  { id: 127, name: 'Modal Access', codename: 'modal_access', category: 'Modals & Popups', description: 'Access to modals' },
  { id: 128, name: 'Modal Close', codename: 'modal_close', category: 'Modals & Popups', description: 'Close modals' },
  { id: 129, name: 'Modal Confirm', codename: 'modal_confirm', category: 'Modals & Popups', description: 'Confirm modal actions' },
  { id: 130, name: 'Modal Cancel', codename: 'modal_cancel', category: 'Modals & Popups', description: 'Cancel modal actions' },
  
  // === ADMIN SYSTEM PERMISSIONS ===
  { id: 131, name: 'Admin Access', codename: 'admin_access', category: 'System Access', description: 'Full administrative access' },
  { id: 132, name: 'Staff Access', codename: 'staff_access', category: 'System Access', description: 'Staff level access' },
  
  // === ADMIN ADVANCED FEATURES ===
  { id: 133, name: 'Bulk Operations', codename: 'bulk_operations', category: 'Advanced Features', description: 'Perform bulk operations' },
  { id: 134, name: 'Data Export', codename: 'data_export', category: 'Advanced Features', description: 'Export data' },
  { id: 135, name: 'Data Import', codename: 'data_import', category: 'Advanced Features', description: 'Import data' },
  { id: 136, name: 'System Settings', codename: 'system_settings', category: 'Advanced Features', description: 'Access system settings' },
  { id: 137, name: 'User Management', codename: 'user_management', category: 'Advanced Features', description: 'Manage user accounts' },
  { id: 138, name: 'Role Management', codename: 'role_management', category: 'Advanced Features', description: 'Manage user roles' },
  { id: 139, name: 'Permission Management', codename: 'permission_management', category: 'Advanced Features', description: 'Manage permissions' },
  { id: 140, name: 'Audit Logs', codename: 'audit_logs', category: 'Advanced Features', description: 'View audit logs' },
  { id: 141, name: 'System Monitoring', codename: 'system_monitoring', category: 'Advanced Features', description: 'Monitor system performance' },
];