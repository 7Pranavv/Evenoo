/*
  # Fix security and performance issues

  1. Missing Foreign Key Indexes
    - Add index on `bookmarks.event_id` (bookmarks_event_id_fkey)
    - Add index on `events.subcategory_id` (events_subcategory_id_fkey)
    - Add index on `registrations.team_leader_uid` (registrations_team_leader_uid_fkey)
    - Add index on `subcategories.category_id` (subcategories_category_id_fkey)
    - Add index on `submissions.event_id` (submissions_event_id_fkey)
    - Add index on `submissions.participant_uid` (submissions_participant_uid_fkey)
    - Add index on `tickets.checked_in_by` (tickets_checked_in_by_fkey)
    - Add index on `tickets.registration_id` (tickets_registration_id_fkey)
    - Add index on `vendor_bookings.event_id` (vendor_bookings_event_id_fkey)
    - Add index on `vendor_bookings.inventory_item_id` (vendor_bookings_inventory_item_id_fkey)
    - Add index on `vendor_bookings.organizer_uid` (vendor_bookings_organizer_uid_fkey)
    - Add index on `wallet_transactions.event_id` (wallet_transactions_event_id_fkey)

  2. RLS Policy Performance Fixes
    - Replace all `auth.uid()` with `(select auth.uid())` to avoid per-row re-evaluation
    - Affects 33 policies across: users, events, registrations, tickets, submissions,
      wallet_transactions, vendors, vendor_inventory, vendor_bookings, bookmarks, notifications

  3. RLS Policy Security Fixes
    - `notifications.System can insert notifications` - restrict to owner only
    - `tickets.Organizers can update ticket check-in` - restrict WITH CHECK to event owner
    - `tickets.Users can insert tickets` - restrict to ticket owner
    - `vendor_bookings.Vendors can update booking status` - restrict WITH CHECK to vendor owner
*/

-- ============================================================
-- 1. Add missing foreign key indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_bookmarks_event_id ON bookmarks (event_id);
CREATE INDEX IF NOT EXISTS idx_events_subcategory_id ON events (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_registrations_team_leader_uid ON registrations (team_leader_uid);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories (category_id);
CREATE INDEX IF NOT EXISTS idx_submissions_event_id ON submissions (event_id);
CREATE INDEX IF NOT EXISTS idx_submissions_participant_uid ON submissions (participant_uid);
CREATE INDEX IF NOT EXISTS idx_tickets_checked_in_by ON tickets (checked_in_by);
CREATE INDEX IF NOT EXISTS idx_tickets_registration_id ON tickets (registration_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_event_id ON vendor_bookings (event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_inventory_item_id ON vendor_bookings (inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bookings_organizer_uid ON vendor_bookings (organizer_uid);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_event_id ON wallet_transactions (event_id);

-- ============================================================
-- 2. Fix RLS policies: use (select auth.uid()) pattern
-- ============================================================

-- --- users ---
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- --- events ---
DROP POLICY IF EXISTS "Live events are readable by authenticated users" ON events;
CREATE POLICY "Live events are readable by authenticated users"
  ON events FOR SELECT TO authenticated
  USING (status = 'live' OR created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can insert events" ON events;
CREATE POLICY "Organizers can insert events"
  ON events FOR INSERT TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can update own events" ON events;
CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE TO authenticated
  USING (created_by = (select auth.uid()))
  WITH CHECK (created_by = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can delete own draft/cancelled events" ON events;
CREATE POLICY "Organizers can delete own draft/cancelled events"
  ON events FOR DELETE TO authenticated
  USING (created_by = (select auth.uid()) AND status IN ('draft', 'cancelled'));

-- --- registrations ---
DROP POLICY IF EXISTS "Users can read own registrations" ON registrations;
CREATE POLICY "Users can read own registrations"
  ON registrations FOR SELECT TO authenticated
  USING (registered_by = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can read event registrations" ON registrations;
CREATE POLICY "Organizers can read event registrations"
  ON registrations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = registrations.event_id AND e.created_by = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Users can insert own registrations" ON registrations;
CREATE POLICY "Users can insert own registrations"
  ON registrations FOR INSERT TO authenticated
  WITH CHECK (registered_by = (select auth.uid()));

-- --- tickets ---
DROP POLICY IF EXISTS "Users can read own tickets" ON tickets;
CREATE POLICY "Users can read own tickets"
  ON tickets FOR SELECT TO authenticated
  USING (uid = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can read event tickets" ON tickets;
CREATE POLICY "Organizers can read event tickets"
  ON tickets FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = tickets.event_id AND e.created_by = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Users can insert tickets" ON tickets;
CREATE POLICY "Users can insert tickets"
  ON tickets FOR INSERT TO authenticated
  WITH CHECK (uid = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can update ticket check-in" ON tickets;
CREATE POLICY "Organizers can update ticket check-in"
  ON tickets FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = tickets.event_id AND e.created_by = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = tickets.event_id AND e.created_by = (select auth.uid())
  ));

-- --- submissions ---
DROP POLICY IF EXISTS "Users can read own submissions" ON submissions;
CREATE POLICY "Users can read own submissions"
  ON submissions FOR SELECT TO authenticated
  USING (participant_uid = (select auth.uid()));

DROP POLICY IF EXISTS "Organizers can read event submissions" ON submissions;
CREATE POLICY "Organizers can read event submissions"
  ON submissions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = submissions.event_id AND e.created_by = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Users can insert own submissions" ON submissions;
CREATE POLICY "Users can insert own submissions"
  ON submissions FOR INSERT TO authenticated
  WITH CHECK (participant_uid = (select auth.uid()));

-- --- wallet_transactions ---
DROP POLICY IF EXISTS "Users can read own transactions" ON wallet_transactions;
CREATE POLICY "Users can read own transactions"
  ON wallet_transactions FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own transactions" ON wallet_transactions;
CREATE POLICY "Users can insert own transactions"
  ON wallet_transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- --- vendors ---
DROP POLICY IF EXISTS "Vendors can read own vendor profile" ON vendors;
CREATE POLICY "Vendors can read own vendor profile"
  ON vendors FOR SELECT TO authenticated
  USING (uid = (select auth.uid()));

DROP POLICY IF EXISTS "Vendors can insert own profile" ON vendors;
CREATE POLICY "Vendors can insert own profile"
  ON vendors FOR INSERT TO authenticated
  WITH CHECK (uid = (select auth.uid()));

DROP POLICY IF EXISTS "Vendors can update own profile" ON vendors;
CREATE POLICY "Vendors can update own profile"
  ON vendors FOR UPDATE TO authenticated
  USING (uid = (select auth.uid()))
  WITH CHECK (uid = (select auth.uid()));

-- --- vendor_inventory ---
DROP POLICY IF EXISTS "Vendors can read own inventory" ON vendor_inventory;
CREATE POLICY "Vendors can read own inventory"
  ON vendor_inventory FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = vendor_inventory.vendor_id AND v.uid = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Vendors can insert inventory" ON vendor_inventory;
CREATE POLICY "Vendors can insert inventory"
  ON vendor_inventory FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = vendor_inventory.vendor_id AND v.uid = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Vendors can update own inventory" ON vendor_inventory;
CREATE POLICY "Vendors can update own inventory"
  ON vendor_inventory FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = vendor_inventory.vendor_id AND v.uid = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = vendor_inventory.vendor_id AND v.uid = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Vendors can delete own inventory" ON vendor_inventory;
CREATE POLICY "Vendors can delete own inventory"
  ON vendor_inventory FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = vendor_inventory.vendor_id AND v.uid = (select auth.uid())
  ));

-- --- vendor_bookings ---
DROP POLICY IF EXISTS "Organizers can read own booking requests" ON vendor_bookings;
CREATE POLICY "Organizers can read own booking requests"
  ON vendor_bookings FOR SELECT TO authenticated
  USING (organizer_uid = (select auth.uid()));

DROP POLICY IF EXISTS "Vendors can read own bookings" ON vendor_bookings;
CREATE POLICY "Vendors can read own bookings"
  ON vendor_bookings FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = vendor_bookings.vendor_id AND v.uid = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Organizers can create bookings" ON vendor_bookings;
CREATE POLICY "Organizers can create bookings"
  ON vendor_bookings FOR INSERT TO authenticated
  WITH CHECK (organizer_uid = (select auth.uid()));

DROP POLICY IF EXISTS "Vendors can update booking status" ON vendor_bookings;
CREATE POLICY "Vendors can update booking status"
  ON vendor_bookings FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = vendor_bookings.vendor_id AND v.uid = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM vendors v
    WHERE v.id = vendor_bookings.vendor_id AND v.uid = (select auth.uid())
  ));

-- --- bookmarks ---
DROP POLICY IF EXISTS "Users can read own bookmarks" ON bookmarks;
CREATE POLICY "Users can read own bookmarks"
  ON bookmarks FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- --- notifications ---
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (recipient_uid = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (recipient_uid = (select auth.uid()))
  WITH CHECK (recipient_uid = (select auth.uid()));

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (recipient_uid = (select auth.uid()));
