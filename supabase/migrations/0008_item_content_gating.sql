-- Paid content was readable by anyone: `items` is publicly selectable for published rows,
-- and source_html / prompt_text lived on that table. Move them into their own table whose
-- RLS only lets the creator, a buyer, or anyone (for free items) read the content.

create table item_content (
  item_id uuid primary key references items(id) on delete cascade,
  source_html text,
  prompt_text text
);

insert into item_content (item_id, source_html, prompt_text)
select id, source_html, prompt_text
from items
where source_html is not null or prompt_text is not null;

alter table items drop column source_html;
alter table items drop column prompt_text;

alter table item_content enable row level security;

create policy "content readable by creator, buyers, or anyone if free" on item_content
  for select using (
    exists (
      select 1 from items i
      where i.id = item_content.item_id
        and (
          i.creator_id = auth.uid()
          or (i.status = 'published' and i.price_cents = 0)
          or exists (
            select 1 from purchases p
            where p.item_id = i.id
              and p.buyer_id = auth.uid()
              and p.status = 'completed'
          )
        )
    )
  );

create policy "creators can insert own item content" on item_content
  for insert with check (
    exists (select 1 from items i where i.id = item_content.item_id and i.creator_id = auth.uid())
  );

create policy "creators can update own item content" on item_content
  for update using (
    exists (select 1 from items i where i.id = item_content.item_id and i.creator_id = auth.uid())
  );

create policy "creators can delete own item content" on item_content
  for delete using (
    exists (select 1 from items i where i.id = item_content.item_id and i.creator_id = auth.uid())
  );
