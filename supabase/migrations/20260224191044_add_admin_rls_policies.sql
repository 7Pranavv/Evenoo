/*
  # Add Admin RLS Policies
  
  This migration adds RLS policies to allow admins to:
  1. Read all events (including pending_approval) for review
  2. Update event status for approvals/rejections
  3. View all users in the system
  4. Create notifications for approval updates
  
  Admin users have role='admin' in the users table.
*/

-- Events: Allow admins to read all events including pending approvals
DROP POLICY IF EXISTS "Admins can read all events" ON events;
CREATE POLICY "Admins can read all events"
  ON events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  );

-- Events: Allow admins to update event status
DROP POLICY IF EXISTS "Admins can update event status" ON events;
CREATE POLICY "Admins can update event status"
  ON events FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  );

-- Users: Allow admins to read all users
DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  );

-- Notifications: Allow system to create notifications for admins
DROP POLICY IF EXISTS "System can create admin notifications" ON notifications;
CREATE POLICY "System can create admin notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Notifications: Allow users to read their own notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (recipient_uid = (select auth.uid()));
