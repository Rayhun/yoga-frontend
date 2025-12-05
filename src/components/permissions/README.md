# Group Permissions Management

This module provides a complete CRUD interface for managing group permissions in the application.

## Features

- ✅ **Create**: Add new group permissions
- ✅ **Read**: View list of all group permissions with details
- ✅ **Update**: Edit existing group permissions
- ✅ **Delete**: Remove group permissions
- ✅ **View**: Detailed view of individual permissions

## Components

### GroupPermissionsPage
Main page component located at `/portal/admin/permissions` that displays:
- List of all group permissions in a table format
- Quick actions (Refresh, Add Permission)
- CRUD operations for each permission

### GroupPermissionModal
Modal component for creating, editing, and viewing permissions with:
- Form validation
- Error handling
- Loading states
- View-only mode

## API Endpoints

The following endpoints are used for CRUD operations:

- `POST /api/v1/permissions/group-permissions/` - Create new permission
- `GET /api/v1/permissions/group-permissions/` - List all permissions
- `GET /api/v1/permissions/group-permissions/{id}/` - Get permission details
- `PUT /api/v1/permissions/group-permissions/{id}/` - Update permission
- `PATCH /api/v1/permissions/group-permissions/{id}/` - Partial update
- `DELETE /api/v1/permissions/group-permissions/{id}/` - Delete permission

## Navigation

The permissions tab has been added to the sidebar navigation for:
- Admin users
- Staff users

Access via: **Sidebar > Permissions**

## Permission Guards

The following permission checks are implemented:
- `view_group_permissions` - View permissions
- `create_group_permissions` - Create new permissions
- `edit_group_permissions` - Edit existing permissions
- `delete_group_permissions` - Delete permissions

## Usage

1. Navigate to the Permissions tab in the sidebar
2. View the list of existing group permissions
3. Use the "Add Group Permission" button to create new permissions
4. Click the eye icon to view permission details
5. Click the edit icon to modify permissions
6. Click the trash icon to delete permissions

## Data Structure

Each group permission contains:
- `name` - Display name of the permission
- `codename` - Unique identifier (e.g., "can_view_users")
- `description` - Optional description
- `category` - Permission category (User Management, Content Management, etc.)
- `is_active` - Boolean status
- `created_at` - Creation timestamp

## Error Handling

- Form validation with real-time error display
- API error handling with user-friendly messages
- Loading states for all operations
- Confirmation dialogs for destructive actions
