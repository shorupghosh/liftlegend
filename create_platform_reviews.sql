-- Create platform_reviews table
CREATE TABLE IF NOT EXISTS platform_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_name TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE platform_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published reviews
CREATE POLICY "Public can view published reviews" 
ON platform_reviews FOR SELECT 
USING (is_published = true);

-- Allow public insert (since this is an open form link)
CREATE POLICY "Public can insert reviews" 
ON platform_reviews FOR INSERT 
WITH CHECK (true);

-- Allow authenticated admins (if needed) to manage all reviews
CREATE POLICY "Admins can manage reviews" 
ON platform_reviews FOR ALL 
USING (auth.role() = 'authenticated');
