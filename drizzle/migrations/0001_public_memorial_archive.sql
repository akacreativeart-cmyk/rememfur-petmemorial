CREATE OR REPLACE FUNCTION public.browse_memorial_archive(_species text DEFAULT NULL, _name text DEFAULT '', _from date DEFAULT NULL, _to date DEFAULT NULL, _min_lamps integer DEFAULT 0, _max_lamps integer DEFAULT NULL, _sort text DEFAULT 'newest', _page integer DEFAULT 1)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
WITH visible AS (
 SELECT m.id, m.slug, m.pet_name, m.species, m.birth_date, m.passing_date, m.epitaph, m.hero_image_url, m.created_at,
 (SELECT count(*)::integer FROM public.candles c WHERE c.memorial_id=m.id AND c.is_hidden=false) AS paw_lamp_count
 FROM public.memorials m
 WHERE m.is_public=true AND m.deleted_at IS NULL
 AND (_species IS NULL OR m.species=_species)
 AND (coalesce(_name,'')='' OR position(lower(left(_name,80)) in lower(m.pet_name))>0)
 AND (_from IS NULL OR m.passing_date>=_from)
 AND (_to IS NULL OR m.passing_date<=_to)
), filtered AS (
 SELECT * FROM visible WHERE paw_lamp_count>=greatest(coalesce(_min_lamps,0),0) AND (_max_lamps IS NULL OR paw_lamp_count<=_max_lamps)
), page_rows AS (
 SELECT * FROM filtered
 ORDER BY CASE WHEN _sort='lamps' THEN paw_lamp_count END DESC,
 CASE WHEN _sort='oldest' THEN created_at END ASC,
 CASE WHEN _sort='passing' THEN passing_date END DESC NULLS LAST,
 created_at DESC, id
 LIMIT 24 OFFSET ((greatest(1,least(coalesce(_page,1),100000))-1)::bigint*24)
)
SELECT jsonb_build_object('rows',coalesce((SELECT jsonb_agg(p) FROM page_rows p),'[]'::jsonb),'total',(SELECT count(*) FROM filtered));
$$;
REVOKE ALL ON FUNCTION public.browse_memorial_archive(text,text,date,date,integer,integer,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.browse_memorial_archive(text,text,date,date,integer,integer,text,integer) TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.browse_memorial_archive(text,text,date,date,integer,integer,text,integer) IS 'Bounded public archive; only public non-deleted memorial fields and non-hidden lamp counts, never owner or visitor identities.';
CREATE INDEX IF NOT EXISTS memorials_archive_passing_date_idx ON public.memorials(passing_date) WHERE is_public=true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS candles_archive_visible_idx ON public.candles(memorial_id) WHERE is_hidden=false;