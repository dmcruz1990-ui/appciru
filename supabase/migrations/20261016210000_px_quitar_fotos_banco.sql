-- Se retiran las fotos de banco (Unsplash) de la semilla: algunas mostraban temas odontológicos.
-- Sin foto, el sitio muestra una composición abstracta propia. Las fotos reales se suben desde el panel.
update public.px_procedimientos set imagen_url = null where imagen_url like '%images.unsplash.com%';
update public.px_instituciones set imagen_url = null where imagen_url like '%images.unsplash.com%';
update public.px_profesionales set foto_url = null where foto_url like '%images.unsplash.com%';
