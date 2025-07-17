USE chat_manage;

DELIMITER $$

-- 1. 대시보드 메인 통계 프로시저
CREATE PROCEDURE sp_get_dashboard_stats()
BEGIN
    -- 전체 사용자 수
    SELECT COUNT(*) as total_users FROM users;
    
    -- 활성 사용자 수 (24시간 내)
    SELECT COUNT(DISTINCT user_id) as active_users_24h 
    FROM usage_stats 
    WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR);
    
    -- 신규 사용자 수 (30일)
    SELECT COUNT(*) as new_users_30d 
    FROM users 
    WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    -- 데이터 저장 통계
    SELECT 
        (SELECT COUNT(*) FROM contacts) as total_contacts,
        (SELECT COUNT(*) FROM credentials) as total_credentials,
        (SELECT COUNT(*) FROM goals) as total_goals,
        (SELECT COUNT(*) FROM schedules) as total_schedules,
        (SELECT COUNT(*) FROM numerical_info) as total_numerical_info,
        (SELECT COUNT(*) FROM albums) as total_albums,
        (SELECT COALESCE(SUM(size), 0) FROM albums) as total_storage_bytes;
END$$

-- 2. 사용량 추이 통계 (30일)
CREATE PROCEDURE sp_get_usage_trend(IN days INT)
BEGIN
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_actions,
        COUNT(DISTINCT user_id) as unique_users
    FROM usage_stats 
    WHERE created_at > DATE_SUB(NOW(), INTERVAL days DAY)
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
END$$

-- 3. 활동 유형별 통계
CREATE PROCEDURE sp_get_activity_by_type(IN days INT)
BEGIN
    SELECT 
        action_type,
        COUNT(*) as count
    FROM usage_stats 
    WHERE created_at > DATE_SUB(NOW(), INTERVAL days DAY)
    GROUP BY action_type
    ORDER BY count DESC;
END$$

-- 4. 사용자 목록 조회 (페이지네이션, 검색)
CREATE PROCEDURE sp_get_users_list(
    IN search_term VARCHAR(255),
    IN page_num INT,
    IN page_size INT
)
BEGIN
    DECLARE offset_val INT;
    SET offset_val = (page_num - 1) * page_size;
    
    -- 전체 카운트
    SELECT COUNT(*) as total_count
    FROM users
    WHERE (search_term IS NULL OR search_term = '' OR 
           email LIKE CONCAT('%', search_term, '%') OR 
           name LIKE CONCAT('%', search_term, '%'));
    
    -- 사용자 목록
    SELECT 
        u.id,
        u.email,
        u.name,
        u.provider,
        u.is_admin,
        u.created_at,
        COALESCE(us.total_actions, 0) as total_actions,
        us.last_activity
    FROM users u
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as total_actions,
            MAX(created_at) as last_activity
        FROM usage_stats
        GROUP BY user_id
    ) us ON u.id = us.user_id
    WHERE (search_term IS NULL OR search_term = '' OR 
           u.email LIKE CONCAT('%', search_term, '%') OR 
           u.name LIKE CONCAT('%', search_term, '%'))
    ORDER BY u.created_at DESC
    LIMIT page_size OFFSET offset_val;
END$$

-- 5. 사용자 상세 정보
CREATE PROCEDURE sp_get_user_details(IN user_id INT)
BEGIN
    -- 사용자 기본 정보
    SELECT id, email, name, provider, is_admin, created_at
    FROM users
    WHERE id = user_id;
    
    -- 데이터 통계
    SELECT 
        (SELECT COUNT(*) FROM contacts WHERE user_id = user_id) as contacts_count,
        (SELECT COUNT(*) FROM credentials WHERE user_id = user_id) as credentials_count,
        (SELECT COUNT(*) FROM goals WHERE user_id = user_id) as goals_count,
        (SELECT COUNT(*) FROM schedules WHERE user_id = user_id) as schedules_count,
        (SELECT COUNT(*) FROM numerical_info WHERE user_id = user_id) as numerical_info_count,
        (SELECT COUNT(*) FROM albums WHERE user_id = user_id) as albums_count,
        (SELECT COALESCE(SUM(size), 0) FROM albums WHERE user_id = user_id) as total_storage;
    
    -- 최근 활동 (최근 10개)
    SELECT id, action_type, created_at
    FROM usage_stats
    WHERE user_id = user_id
    ORDER BY created_at DESC
    LIMIT 10;
END$$

-- 6. 시간대별 사용 패턴
CREATE PROCEDURE sp_get_hourly_usage_pattern()
BEGIN
    SELECT 
        HOUR(created_at) as hour,
        COUNT(*) as action_count,
        COUNT(DISTINCT user_id) as unique_users
    FROM usage_stats
    WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY HOUR(created_at)
    ORDER BY hour;
END$$

-- 7. 가장 활발한 사용자 TOP 10
CREATE PROCEDURE sp_get_top_active_users()
BEGIN
    SELECT 
        u.id,
        u.email,
        u.name,
        COUNT(us.id) as action_count,
        MAX(us.created_at) as last_activity
    FROM users u
    LEFT JOIN usage_stats us ON u.id = us.user_id
    WHERE us.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY u.id, u.email, u.name
    ORDER BY action_count DESC
    LIMIT 10;
END$$

-- 8. 데이터 증가 추이 (월별)
CREATE PROCEDURE sp_get_data_growth_trend()
BEGIN
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        'contacts' as data_type,
        COUNT(*) as count
    FROM contacts
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    
    UNION ALL
    
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        'schedules' as data_type,
        COUNT(*) as count
    FROM schedules
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    
    UNION ALL
    
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        'goals' as data_type,
        COUNT(*) as count
    FROM goals
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    
    ORDER BY month DESC, data_type;
END$$

-- 9. 저장 용량 상위 사용자
CREATE PROCEDURE sp_get_top_storage_users()
BEGIN
    SELECT 
        u.id,
        u.email,
        u.name,
        COUNT(a.id) as file_count,
        COALESCE(SUM(a.size), 0) as total_size_bytes,
        ROUND(COALESCE(SUM(a.size), 0) / 1024 / 1024, 2) as total_size_mb
    FROM users u
    LEFT JOIN albums a ON u.id = a.user_id
    GROUP BY u.id, u.email, u.name
    HAVING total_size_bytes > 0
    ORDER BY total_size_bytes DESC
    LIMIT 10;
END$$

-- 10. 기능별 사용 통계
CREATE PROCEDURE sp_get_feature_usage_stats()
BEGIN
    SELECT 
        'Chat Messages' as feature,
        COUNT(*) as usage_count,
        COUNT(DISTINCT user_id) as unique_users
    FROM usage_stats
    WHERE action_type = 'chat_message'
    AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    
    UNION ALL
    
    SELECT 
        'Data Operations' as feature,
        COUNT(*) as usage_count,
        COUNT(DISTINCT user_id) as unique_users
    FROM usage_stats
    WHERE action_type LIKE 'data_%'
    AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    
    UNION ALL
    
    SELECT 
        'Login' as feature,
        COUNT(*) as usage_count,
        COUNT(DISTINCT user_id) as unique_users
    FROM usage_stats
    WHERE action_type = 'login'
    AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);
END$$

DELIMITER ;

-- 프로시저 목록 확인
SHOW PROCEDURE STATUS WHERE Db = 'chat_manage';