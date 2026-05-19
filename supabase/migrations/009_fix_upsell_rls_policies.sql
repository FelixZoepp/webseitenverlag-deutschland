-- Kunden können eigene Upsell-Rejections sehen (für Chatbot-Kontext)
create policy "Users can view own upsell rejections" on upsell_rejections
  for select using (customer_id in (select id from customers where user_id = auth.uid()));

-- Kunden können eigene Email-Logs sehen
create policy "Users can view own email logs" on email_logs
  for select using (customer_id in (select id from customers where user_id = auth.uid()));

-- Kunden können eigene Rechnungsposten sehen
create policy "Users can view own rechnungs posten" on rechnungs_posten
  for select using (customer_id in (select id from customers where user_id = auth.uid()));

-- INSERT für upsell_rejections (Chatbot trackt Ablehnungen)
create policy "Users can insert own upsell rejections" on upsell_rejections
  for insert with check (customer_id in (select id from customers where user_id = auth.uid()));
