UPDATE blog_posts
SET content = replace(content, '''', '’'),
    excerpt = replace(excerpt, '''', '’'),
    title = replace(title, '''', '’')
WHERE id = 'cab94b55-3767-4e08-bc10-928bf2167ab6';