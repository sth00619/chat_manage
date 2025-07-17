-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS personal_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personal_assistant;

-- 1. 사용자 테이블
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) COMMENT '로컬 회원가입시에만 사용',
    name VARCHAR(255),
    provider VARCHAR(50) COMMENT 'local, google, naver',
    provider_id VARCHAR(255) COMMENT 'OAuth 제공자의 사용자 ID',
    is_admin BOOLEAN DEFAULT FALSE COMMENT '관리자 권한 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_provider (provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 연락처 테이블
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 계정정보 테이블 (웹사이트 ID/PW)
CREATE TABLE credentials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    website VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT '암호화 권장',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_website (website)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 목표 테이블
CREATE TABLE goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_target_date (target_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 일정 테이블
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_start_time (start_time),
    INDEX idx_user_date (user_id, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 수치정보 테이블 (은행잔액, 건강정보 등)
CREATE TABLE numerical_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL COMMENT 'banking, health, finance, education, general',
    label VARCHAR(255) NOT NULL COMMENT '항목명 (예: 계좌잔액, 체중)',
    value VARCHAR(255) NOT NULL COMMENT '값',
    unit VARCHAR(50) COMMENT '단위 (예: 원, kg, mmHg)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_user_category (user_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 앨범 테이블 (이미지 저장)
CREATE TABLE albums (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL COMMENT '서버에 저장된 파일명',
    original_name VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    mimetype VARCHAR(100) NOT NULL,
    size INT NOT NULL COMMENT '파일 크기 (bytes)',
    url VARCHAR(500) NOT NULL COMMENT '접근 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 사용 통계 테이블 (관리자용)
CREATE TABLE usage_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL COMMENT 'chat_message, login, data_create, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_action_type (action_type),
    INDEX idx_user_action_date (user_id, action_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 샘플 관리자 계정 생성 (비밀번호: admin123)
-- bcrypt로 해시된 비밀번호: $2b$10$YourHashedPasswordHere
-- 실제 사용시에는 적절한 해시값으로 변경 필요
INSERT INTO users (email, password, name, provider, is_admin) 
VALUES ('admin@example.com', '$2b$10$8KmM5zKmDnW3x7kNY5qHZ.VQZMt5GZr5oK5Q3FqRVT1lKW1K.5rGS', 'Administrator', 'local', TRUE);

-- 테이블 정보 확인
SHOW TABLES;

-- 각 테이블의 구조 확인
DESCRIBE users;
DESCRIBE contacts;
DESCRIBE credentials;
DESCRIBE goals;
DESCRIBE schedules;
DESCRIBE numerical_info;
DESCRIBE albums;
DESCRIBE usage_stats;