-- =====================================================
-- OUTRELIX: AI Functions & Edge Functions
-- Advanced Database Functions for AI-Powered Features
-- =====================================================

-- Function to generate AI-powered email suggestions
CREATE OR REPLACE FUNCTION generate_email_suggestions(
    p_campaign_id UUID,
    p_lead_id UUID,
    p_template_type TEXT DEFAULT 'cold_outreach'
)
RETURNS JSONB AS $$
DECLARE
    campaign_record RECORD;
    lead_record RECORD;
    suggestions JSONB := '[]'::jsonb;
    subject_suggestion TEXT;
    content_suggestion TEXT;
BEGIN
    -- Get campaign and lead data
    SELECT * INTO campaign_record FROM campaigns WHERE id = p_campaign_id;
    SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
    
    -- Generate subject line suggestions based on industry and company
    subject_suggestion := CASE 
        WHEN lead_record.industry = 'Technology' THEN 
            'Quick question about ' || lead_record.company_name || '''s growth strategy'
        WHEN lead_record.industry = 'Healthcare' THEN 
            'Improving patient outcomes at ' || lead_record.company_name
        WHEN lead_record.industry = 'Finance' THEN 
            'Streamlining operations at ' || lead_record.company_name
        ELSE 
            'Partnership opportunity with ' || lead_record.company_name
    END;
    
    -- Generate content suggestions
    content_suggestion := 'Hi ' || COALESCE(lead_record.first_name, 'there') || ',

I''ve been following ' || lead_record.company_name || '''s work in the ' || 
COALESCE(lead_record.industry, 'industry') || ' space and I''m impressed by your recent growth.

I have a proven strategy that has helped similar companies increase their ' || 
CASE 
    WHEN campaign_record.industry = 'Technology' THEN 'user acquisition'
    WHEN campaign_record.industry = 'Healthcare' THEN 'patient engagement'
    WHEN campaign_record.industry = 'Finance' THEN 'customer retention'
    ELSE 'business growth'
END || ' by 40% in just 30 days.

Would you be interested in a brief 15-minute call to discuss how this could work for ' || 
lead_record.company_name || '?

Best regards,
[Your Name]';
    
    -- Build suggestions array
    suggestions := jsonb_build_array(
        jsonb_build_object(
            'type', 'subject_line',
            'title', 'Personalized Subject Line',
            'content', subject_suggestion,
            'confidence', 0.85
        ),
        jsonb_build_object(
            'type', 'email_content',
            'title', 'AI-Generated Email Content',
            'content', content_suggestion,
            'confidence', 0.78
        )
    );
    
    -- Insert suggestions into database
    INSERT INTO ai_suggestions (user_id, campaign_id, suggestion_type, title, description, content, confidence_score)
    SELECT 
        campaign_record.user_id,
        p_campaign_id,
        'email_suggestions',
        'AI Email Suggestions',
        'Generated suggestions for this lead',
        suggestions,
        0.82;
    
    RETURN suggestions;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze email performance and suggest optimizations
CREATE OR REPLACE FUNCTION analyze_email_performance(p_campaign_id UUID)
RETURNS JSONB AS $$
DECLARE
    campaign_record RECORD;
    performance_data JSONB;
    suggestions JSONB := '[]'::jsonb;
    avg_open_rate DECIMAL;
    avg_click_rate DECIMAL;
    avg_reply_rate DECIMAL;
BEGIN
    -- Get campaign data
    SELECT * INTO campaign_record FROM campaigns WHERE id = p_campaign_id;
    
    -- Calculate average rates
    SELECT 
        AVG(CASE WHEN es.status = 'delivered' THEN 
            (SELECT COUNT(*) FROM email_events ee WHERE ee.email_send_id = es.id AND ee.event_type = 'opened')::DECIMAL / 1
        ELSE 0 END) as open_rate,
        AVG(CASE WHEN es.status = 'delivered' THEN 
            (SELECT COUNT(*) FROM email_events ee WHERE ee.email_send_id = es.id AND ee.event_type = 'clicked')::DECIMAL / 1
        ELSE 0 END) as click_rate,
        AVG(CASE WHEN es.status = 'delivered' THEN 
            (SELECT COUNT(*) FROM email_events ee WHERE ee.email_send_id = es.id AND ee.event_type = 'replied')::DECIMAL / 1
        ELSE 0 END) as reply_rate
    INTO avg_open_rate, avg_click_rate, avg_reply_rate
    FROM email_sends es
    WHERE es.campaign_id = p_campaign_id;
    
    -- Generate performance suggestions
    IF avg_open_rate < 0.20 THEN
        suggestions := suggestions || jsonb_build_object(
            'type', 'optimization',
            'title', 'Improve Open Rates',
            'description', 'Your open rate is below industry average. Try more compelling subject lines.',
            'priority', 'high'
        );
    END IF;
    
    IF avg_click_rate < 0.05 THEN
        suggestions := suggestions || jsonb_build_object(
            'type', 'optimization',
            'title', 'Increase Click Rates',
            'description', 'Add more compelling call-to-actions and relevant links.',
            'priority', 'medium'
        );
    END IF;
    
    IF avg_reply_rate < 0.02 THEN
        suggestions := suggestions || jsonb_build_object(
            'type', 'optimization',
            'title', 'Improve Reply Rates',
            'description', 'Make emails more conversational and ask specific questions.',
            'priority', 'high'
        );
    END IF;
    
    -- Build performance data
    performance_data := jsonb_build_object(
        'campaign_id', p_campaign_id,
        'open_rate', COALESCE(avg_open_rate, 0),
        'click_rate', COALESCE(avg_click_rate, 0),
        'reply_rate', COALESCE(avg_reply_rate, 0),
        'suggestions', suggestions,
        'analyzed_at', NOW()
    );
    
    RETURN performance_data;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically score leads based on behavior
CREATE OR REPLACE FUNCTION auto_score_lead(p_lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
    lead_record RECORD;
    score INTEGER := 0;
    email_count INTEGER;
    open_count INTEGER;
    click_count INTEGER;
    reply_count INTEGER;
BEGIN
    -- Get lead data
    SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
    
    -- Count email interactions
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE ee.event_type = 'opened'),
        COUNT(*) FILTER (WHERE ee.event_type = 'clicked'),
        COUNT(*) FILTER (WHERE ee.event_type = 'replied')
    INTO email_count, open_count, click_count, reply_count
    FROM email_sends es
    LEFT JOIN email_events ee ON es.id = ee.email_send_id
    WHERE es.lead_id = p_lead_id;
    
    -- Base score from company size
    CASE lead_record.company_size
        WHEN '1-10' THEN score := score + 10;
        WHEN '11-50' THEN score := score + 20;
        WHEN '51-200' THEN score := score + 30;
        WHEN '201-1000' THEN score := score + 40;
        WHEN '1000+' THEN score := score + 50;
    END CASE;
    
    -- Score from job title
    IF lead_record.job_title ILIKE '%ceo%' OR lead_record.job_title ILIKE '%founder%' THEN
        score := score + 30;
    ELSIF lead_record.job_title ILIKE '%director%' OR lead_record.job_title ILIKE '%vp%' THEN
        score := score + 25;
    ELSIF lead_record.job_title ILIKE '%manager%' THEN
        score := score + 15;
    END IF;
    
    -- Score from email engagement
    score := score + (open_count * 5);
    score := score + (click_count * 10);
    score := score + (reply_count * 25);
    
    -- Update lead score
    UPDATE leads SET lead_score = GREATEST(0, LEAST(100, score)) WHERE id = p_lead_id;
    
    RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized email timing suggestions
CREATE OR REPLACE FUNCTION get_optimal_email_timing(p_lead_id UUID)
RETURNS JSONB AS $$
DECLARE
    lead_record RECORD;
    timezone_offset INTEGER;
    optimal_times JSONB;
BEGIN
    -- Get lead data
    SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
    
    -- Determine timezone offset (simplified)
    timezone_offset := CASE lead_record.country
        WHEN 'US' THEN -5  -- EST
        WHEN 'UK' THEN 0   -- GMT
        WHEN 'DE' THEN 1   -- CET
        WHEN 'AU' THEN 10  -- AEST
        ELSE 0
    END;
    
    -- Generate optimal times based on industry and timezone
    optimal_times := jsonb_build_object(
        'timezone', COALESCE(lead_record.country, 'UTC'),
        'best_times', jsonb_build_array(
            jsonb_build_object('day', 'Tuesday', 'time', '10:00', 'confidence', 0.85),
            jsonb_build_object('day', 'Wednesday', 'time', '14:00', 'confidence', 0.82),
            jsonb_build_object('day', 'Thursday', 'time', '11:00', 'confidence', 0.80)
        ),
        'worst_times', jsonb_build_array(
            jsonb_build_object('day', 'Monday', 'time', '09:00', 'reason', 'Busy start of week'),
            jsonb_build_object('day', 'Friday', 'time', '16:00', 'reason', 'End of week fatigue')
        )
    );
    
    RETURN optimal_times;
END;
$$ LANGUAGE plpgsql;

-- Function to detect email replies and categorize them
CREATE OR REPLACE FUNCTION categorize_email_reply(p_email_send_id UUID, p_reply_content TEXT)
RETURNS TEXT AS $$
DECLARE
    category TEXT;
    positive_keywords TEXT[] := ARRAY['interested', 'yes', 'sounds good', 'let''s talk', 'schedule', 'meeting', 'call'];
    negative_keywords TEXT[] := ARRAY['not interested', 'no thanks', 'unsubscribe', 'stop', 'don''t contact'];
    neutral_keywords TEXT[] := ARRAY['maybe', 'later', 'busy', 'not now'];
BEGIN
    -- Convert to lowercase for case-insensitive matching
    p_reply_content := LOWER(p_reply_content);
    
    -- Check for positive keywords
    IF EXISTS (SELECT 1 FROM unnest(positive_keywords) AS keyword WHERE p_reply_content LIKE '%' || keyword || '%') THEN
        category := 'positive';
    -- Check for negative keywords
    ELSIF EXISTS (SELECT 1 FROM unnest(negative_keywords) AS keyword WHERE p_reply_content LIKE '%' || keyword || '%') THEN
        category := 'negative';
    -- Check for neutral keywords
    ELSIF EXISTS (SELECT 1 FROM unnest(neutral_keywords) AS keyword WHERE p_reply_content LIKE '%' || keyword || '%') THEN
        category := 'neutral';
    ELSE
        category := 'unclear';
    END IF;
    
    -- Update email send status
    UPDATE email_sends SET status = 'replied' WHERE id = p_email_send_id;
    
    -- Create email event
    INSERT INTO email_events (email_send_id, event_type, metadata)
    VALUES (p_email_send_id, 'replied', jsonb_build_object('category', category, 'content', p_reply_content));
    
    RETURN category;
END;
$$ LANGUAGE plpgsql;

-- Function to generate campaign insights
CREATE OR REPLACE FUNCTION generate_campaign_insights(p_campaign_id UUID)
RETURNS JSONB AS $$
DECLARE
    campaign_record RECORD;
    insights JSONB;
    total_leads INTEGER;
    contacted_leads INTEGER;
    replied_leads INTEGER;
    conversion_rate DECIMAL;
BEGIN
    -- Get campaign data
    SELECT * INTO campaign_record FROM campaigns WHERE id = p_campaign_id;
    
    -- Calculate metrics
    SELECT 
        COUNT(DISTINCT l.id),
        COUNT(DISTINCT l.id) FILTER (WHERE es.id IS NOT NULL),
        COUNT(DISTINCT l.id) FILTER (WHERE es.status = 'replied')
    INTO total_leads, contacted_leads, replied_leads
    FROM leads l
    LEFT JOIN email_sends es ON l.id = es.lead_id AND es.campaign_id = p_campaign_id
    WHERE l.user_id = campaign_record.user_id;
    
    -- Calculate conversion rate
    conversion_rate := CASE 
        WHEN contacted_leads > 0 THEN (replied_leads::DECIMAL / contacted_leads * 100)
        ELSE 0
    END;
    
    -- Generate insights
    insights := jsonb_build_object(
        'campaign_id', p_campaign_id,
        'total_leads', total_leads,
        'contacted_leads', contacted_leads,
        'replied_leads', replied_leads,
        'conversion_rate', conversion_rate,
        'insights', jsonb_build_array(
            jsonb_build_object(
                'type', 'performance',
                'title', 'Campaign Performance',
                'description', 'Your campaign has a ' || ROUND(conversion_rate, 2) || '% reply rate',
                'recommendation', CASE 
                    WHEN conversion_rate < 5 THEN 'Consider improving your subject lines and personalization'
                    WHEN conversion_rate < 15 THEN 'Good performance! Try A/B testing different approaches'
                    ELSE 'Excellent performance! Scale this campaign'
                END
            )
        ),
        'generated_at', NOW()
    );
    
    RETURN insights;
END;
$$ LANGUAGE plpgsql;

-- Function to schedule follow-up emails automatically
CREATE OR REPLACE FUNCTION schedule_follow_up(p_campaign_id UUID, p_lead_id UUID, p_delay_days INTEGER DEFAULT 3)
RETURNS UUID AS $$
DECLARE
    follow_up_id UUID;
    campaign_record RECORD;
    lead_record RECORD;
    template_record RECORD;
BEGIN
    -- Get campaign and lead data
    SELECT * INTO campaign_record FROM campaigns WHERE id = p_campaign_id;
    SELECT * INTO lead_record FROM leads WHERE id = p_lead_id;
    
    -- Get a follow-up template
    SELECT * INTO template_record FROM email_templates 
    WHERE category = 'follow_up' AND (industry = lead_record.industry OR industry IS NULL)
    ORDER BY success_rate DESC, usage_count DESC
    LIMIT 1;
    
    -- Create follow-up email
    INSERT INTO email_sends (
        campaign_id,
        lead_id,
        template_id,
        subject,
        content,
        status,
        scheduled_at
    ) VALUES (
        p_campaign_id,
        p_lead_id,
        template_record.id,
        template_record.subject,
        template_record.content,
        'pending',
        NOW() + INTERVAL '1 day' * p_delay_days
    ) RETURNING id INTO follow_up_id;
    
    -- Update lead status
    UPDATE leads SET status = 'contacted' WHERE id = p_lead_id;
    
    RETURN follow_up_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_campaign_id ON ai_suggestions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email_send_id ON email_events(email_send_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_email_suggestions(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_email_performance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_score_lead(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_optimal_email_timing(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION categorize_email_reply(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_campaign_insights(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_follow_up(UUID, UUID, INTEGER) TO authenticated;
