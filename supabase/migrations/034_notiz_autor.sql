-- Notiz-Autor: E-Mail des eingeloggten Admins, serverseitig gesetzt.
-- Nullable — Alt-Notizen haben keinen Autor.
alter table lead_notes add column autor text;
