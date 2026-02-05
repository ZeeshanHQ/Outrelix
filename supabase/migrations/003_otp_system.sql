-- =====================================================
-- OUTRELIX: OTP Verification System
-- Custom OTP table for email verification using Resend API
-- =====================================================

-- OTP table for email verification
CREATE TABLE otp_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'email_verification', -- 'email_verification', 'password_reset', 'login'
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3
);

-- Index for performance
CREATE INDEX idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX idx_otp_verifications_otp_code ON otp_verifications(otp_code);
CREATE INDEX idx_otp_verifications_expires_at ON otp_verifications(expires_at);

-- Enable RLS
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can only access their own OTPs
CREATE POLICY "Users can access own OTPs" ON otp_verifications
    FOR ALL USING (email = auth.jwt() ->> 'email');

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_verifications 
    WHERE expires_at < NOW() OR (created_at < NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;

-- Function to generate OTP
CREATE OR REPLACE FUNCTION generate_otp()
RETURNS TEXT AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to validate OTP
CREATE OR REPLACE FUNCTION validate_otp(
    p_email TEXT,
    p_otp_code TEXT,
    p_purpose TEXT DEFAULT 'email_verification'
)
RETURNS JSONB AS $$
DECLARE
    otp_record RECORD;
    result JSONB;
BEGIN
    -- Find the OTP record
    SELECT * INTO otp_record 
    FROM otp_verifications 
    WHERE email = p_email 
    AND otp_code = p_otp_code 
    AND purpose = p_purpose 
    AND is_used = FALSE 
    AND expires_at > NOW()
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Check if OTP exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', 'Invalid or expired OTP'
        );
    END IF;
    
    -- Check attempts
    IF otp_record.attempts >= otp_record.max_attempts THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', 'Maximum attempts exceeded'
        );
    END IF;
    
    -- Mark OTP as used
    UPDATE otp_verifications 
    SET is_used = TRUE 
    WHERE id = otp_record.id;
    
    RETURN jsonb_build_object(
        'valid', true,
        'message', 'OTP verified successfully'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to create OTP
CREATE OR REPLACE FUNCTION create_otp(
    p_email TEXT,
    p_purpose TEXT DEFAULT 'email_verification',
    p_expiry_minutes INTEGER DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
    otp_code TEXT;
    expires_at TIMESTAMPTZ;
    result JSONB;
BEGIN
    -- Generate OTP
    otp_code := generate_otp();
    expires_at := NOW() + (p_expiry_minutes || ' minutes')::INTERVAL;
    
    -- Clean up old OTPs for this email
    DELETE FROM otp_verifications 
    WHERE email = p_email AND purpose = p_purpose;
    
    -- Insert new OTP
    INSERT INTO otp_verifications (email, otp_code, purpose, expires_at)
    VALUES (p_email, otp_code, p_purpose, expires_at);
    
    RETURN jsonb_build_object(
        'otp_code', otp_code,
        'expires_at', expires_at,
        'expires_in_minutes', p_expiry_minutes
    );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_otp() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_otp(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_otp(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_otps() TO authenticated;

-- Create a scheduled job to clean up expired OTPs (if using pg_cron)
-- SELECT cron.schedule('cleanup-expired-otps', '0 * * * *', 'SELECT cleanup_expired_otps();');
