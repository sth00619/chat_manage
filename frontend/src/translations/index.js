const translations = {
  ko: {
    // Navigation
    nav: {
      dashboard: '대시보드',
      aiAssistant: 'AI 비서',
      schedule: '일정',
      notes: '노트',
      album: '앨범',
      admin: '관리자',
      logout: '로그아웃',
    },
    
    // Notes page tabs
    notes: {
      title: '노트',
      tabs: {
        contacts: '연락처',
        credentials: 'ID & 비밀번호',
        goals: '목표',
        numericalInfo: '수치 정보',
      },
    },
    
    // Admin page
    admin: {
      title: '관리자 대시보드',
      tabs: {
        overview: '개요',
        analytics: '분석',
        userManagement: '사용자 관리',
      },
      stats: {
        totalUsers: '전체 사용자',
        newUsers: '신규',
        activeUsers: '활성 사용자 (24h)',
        activityRate: '활성률',
        totalData: '총 데이터 수',
        storageCapacity: '저장 용량',
        systemStatus: '시스템 상태',
        healthy: '정상',
        needsCheck: '점검필요',
        memory: '메모리',
      },
      charts: {
        usageTrend: '사용량 추이 (최근 30일)',
        totalActions: '총 액션',
        uniqueUsers: '고유 사용자',
        dataDistribution: '데이터 분포',
        contacts: '연락처',
        credentials: '계정정보',
        goals: '목표',
        schedules: '일정',
        numericalInfo: '수치정보',
        hourlyPattern: '시간대별 사용 패턴',
        topActiveUsers: '가장 활발한 사용자 TOP 10',
        activities: '활동',
        featureUsage: '기능별 사용 통계',
        usageCount: '사용 횟수',
        topStorageUsers: '저장 용량 상위 사용자',
        files: '파일',
        activityByType: '활동 유형별 통계 (최근 7일)',
      },
    },
    
    // Schedule page
    schedule: {
      title: '일정 관리',
      addSchedule: '일정 추가',
      editSchedule: '일정 수정',
      deleteConfirm: '이 일정을 삭제하시겠습니까?',
      legend: '범례',
      daysWithSchedules: '일정이 있는 날',
      scheduleFor: '일정',
      noSchedules: '이 날짜에는 일정이 없습니다.',
      at: '시',
    },
    
    // Dashboard
    dashboard: {
      title: '대시보드',
      greeting: {
        morning: '좋은 아침입니다',
        afternoon: '좋은 오후입니다',
        evening: '좋은 저녁입니다',
      },
      subtitle: '오늘도 생산적인 하루 보내세요. AI 비서가 도와드립니다.',
      quickActions: '빠른 작업',
      statusSummary: '상태 요약',
      keyInfo: '핵심 정보',
      accountInfo: '계정 정보',
      recentSchedule: '최근 일정',
      aiTips: 'AI 비서 팁',
      aiTipsDesc: '자연스러운 대화로 일정과 정보를 관리하세요:',
      stats: {
        contacts: '연락처',
        todaySchedule: '오늘 일정',
        activeGoals: '활성 목표',
        savedPhotos: '저장된 사진',
        savedContacts: '저장된 연락처',
        todayEvents: '오늘의 이벤트',
        activeGoalsDesc: '활성 목표',
        albumPhotos: '앨범 사진',
      },
    },
    
    // Login/Register
    auth: {
      login: '로그인',
      register: '회원가입',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      name: '이름',
      loginTitle: 'Personal Assistant',
      loginSubtitle: 'AI 기반 개인 비서 서비스',
      loginButton: '로그인',
      registerButton: '회원가입',
      googleLogin: 'Google로 로그인',
      naverLogin: 'Naver로 로그인',
      noAccount: '계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?',
      loginFailed: '로그인에 실패했습니다.',
      registerFailed: '회원가입에 실패했습니다.',
      passwordMismatch: '비밀번호가 일치하지 않습니다.',
      orContinueWith: '또는 다음으로 계속하기',
    },
    
    // Payment
    payment: {
      title: '요금제 선택',
      subtitle: '당신에게 맞는 플랜을 선택하세요',
      currentSubscription: '현재 구독 상태',
      plan: '플랜',
      aiRequestsRemaining: 'AI 요청 남은 횟수',
      unlimited: '무제한',
      selectPaymentMethod: '결제 방법 선택',
      paymentMethods: {
        card: '신용/체크카드',
        kakaoPay: '카카오페이',
        naverPay: '네이버페이',
        toss: '토스',
        bankTransfer: '계좌이체',
      },
      popular: '인기',
      month: '월',
      selectPlan: '선택하기',
      startFree: '무료 시작',
      processing: '처리 중...',
      backToDashboard: '대시보드로 돌아가기',
      changeAnytime: '모든 플랜은 언제든지 변경하거나 취소할 수 있습니다.',
      freePlanAlert: '무료 플랜은 별도의 결제가 필요하지 않습니다.',
      paymentError: '결제 처리 중 오류가 발생했습니다.',
      paymentReady: '플랜 결제 준비가 완료되었습니다.\n결제 게이트웨이 연동이 필요합니다.',
      plans: {
        free: {
          name: 'Free Plan',
          features: [
            '월 10회 AI 채팅',
            '기본 일정 관리',
            '5GB 저장공간',
            '기본 지원',
          ],
        },
        basic: {
          name: 'Basic Plan',
          features: [
            '월 100회 AI 채팅',
            '고급 일정 관리',
            '50GB 저장공간',
            '이메일 지원',
            '캘린더 통합',
          ],
        },
        premium: {
          name: 'Premium Plan',
          features: [
            '무제한 AI 채팅',
            '모든 기능 이용',
            '무제한 저장공간',
            '24/7 지원',
            'API 접근',
            '커스텀 AI 모델',
          ],
        },
      },
    },
    
    // Common
    common: {
      loading: '로딩 중...',
      personalAssistant: 'Personal Assistant',
      days: '일',
      hour: '시',
    },
  },
  
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      aiAssistant: 'AI Assistant',
      schedule: 'Schedule',
      notes: 'Notes',
      album: 'Album',
      admin: 'Admin',
      logout: 'Logout',
    },
    
    // Notes page tabs
    notes: {
      title: 'Notes',
      tabs: {
        contacts: 'Contacts',
        credentials: 'ID & Password',
        goals: 'Goals',
        numericalInfo: 'Numerical Info',
      },
    },
    
    // Admin page
    admin: {
      title: 'Admin Dashboard',
      tabs: {
        overview: 'Overview',
        analytics: 'Analytics',
        userManagement: 'User Management',
      },
      stats: {
        totalUsers: 'Total Users',
        newUsers: 'New',
        activeUsers: 'Active Users (24h)',
        activityRate: 'Activity Rate',
        totalData: 'Total Data',
        storageCapacity: 'Storage',
        systemStatus: 'System Status',
        healthy: 'Healthy',
        needsCheck: 'Needs Check',
        memory: 'Memory',
      },
      charts: {
        usageTrend: 'Usage Trend (Last 30 days)',
        totalActions: 'Total Actions',
        uniqueUsers: 'Unique Users',
        dataDistribution: 'Data Distribution',
        contacts: 'Contacts',
        credentials: 'Credentials',
        goals: 'Goals',
        schedules: 'Schedules',
        numericalInfo: 'Numerical Info',
        hourlyPattern: 'Hourly Usage Pattern',
        topActiveUsers: 'Top 10 Active Users',
        activities: 'activities',
        featureUsage: 'Feature Usage Statistics',
        usageCount: 'Usage Count',
        topStorageUsers: 'Top Storage Users',
        files: 'files',
        activityByType: 'Activity by Type (Last 7 days)',
      },
    },
    
    // Schedule page
    schedule: {
      title: 'Schedule Management',
      addSchedule: 'Add Schedule',
      editSchedule: 'Edit Schedule',
      deleteConfirm: 'Are you sure you want to delete this schedule?',
      legend: 'Legend',
      daysWithSchedules: 'Days with schedules',
      scheduleFor: 'Schedule',
      noSchedules: 'No schedules for this date.',
      at: '',
    },
    
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      greeting: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
      },
      subtitle: 'Have a productive day. Your AI assistant is here to help.',
      quickActions: 'Quick Actions',
      statusSummary: 'Status Summary',
      keyInfo: 'Key Information',
      accountInfo: 'Account Information',
      recentSchedule: 'Recent Schedule',
      aiTips: 'AI Assistant Tips',
      aiTipsDesc: 'Manage your schedule and information with natural conversation:',
      stats: {
        contacts: 'Contacts',
        todaySchedule: "Today's Schedule",
        activeGoals: 'Active Goals',
        savedPhotos: 'Saved Photos',
        savedContacts: 'Saved contacts',
        todayEvents: "Today's events",
        activeGoalsDesc: 'Active goals',
        albumPhotos: 'Album photos',
      },
    },
    
    // Login/Register
    auth: {
      login: 'Login',
      register: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Name',
      loginTitle: 'Personal Assistant',
      loginSubtitle: 'AI-powered personal assistant service',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      googleLogin: 'Continue with Google',
      naverLogin: 'Continue with Naver',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginFailed: 'Login failed.',
      registerFailed: 'Registration failed.',
      passwordMismatch: 'Passwords do not match.',
      orContinueWith: 'Or continue with',
    },
    
    // Payment
    payment: {
      title: 'Choose Your Plan',
      subtitle: 'Select the plan that suits you best',
      currentSubscription: 'Current Subscription',
      plan: 'Plan',
      aiRequestsRemaining: 'AI Requests Remaining',
      unlimited: 'Unlimited',
      selectPaymentMethod: 'Select Payment Method',
      paymentMethods: {
        card: 'Credit/Debit Card',
        kakaoPay: 'Kakao Pay',
        naverPay: 'Naver Pay',
        toss: 'Toss',
        bankTransfer: 'Bank Transfer',
      },
      popular: 'Popular',
      month: 'month',
      selectPlan: 'Select',
      startFree: 'Start Free',
      processing: 'Processing...',
      backToDashboard: 'Back to Dashboard',
      changeAnytime: 'All plans can be changed or cancelled anytime.',
      freePlanAlert: 'The free plan does not require payment.',
      paymentError: 'An error occurred during payment processing.',
      paymentReady: 'Payment preparation completed.\nPayment gateway integration required.',
      plans: {
        free: {
          name: 'Free Plan',
          features: [
            '10 AI chats per month',
            'Basic schedule management',
            '5GB storage',
            'Basic support',
          ],
        },
        basic: {
          name: 'Basic Plan',
          features: [
            '100 AI chats per month',
            'Advanced schedule management',
            '50GB storage',
            'Email support',
            'Calendar integration',
          ],
        },
        premium: {
          name: 'Premium Plan',
          features: [
            'Unlimited AI chats',
            'All features included',
            'Unlimited storage',
            '24/7 support',
            'API access',
            'Custom AI models',
          ],
        },
      },
    },
    
    // Common
    common: {
      loading: 'Loading...',
      personalAssistant: 'Personal Assistant',
      days: 'days',
      hour: 'h',
    },
  },
  
  zh: {
    // Navigation
    nav: {
      dashboard: '仪表板',
      aiAssistant: 'AI助手',
      schedule: '日程',
      notes: '笔记',
      album: '相册',
      admin: '管理员',
      logout: '退出',
    },
    
    // Notes page tabs
    notes: {
      title: '笔记',
      tabs: {
        contacts: '联系人',
        credentials: 'ID和密码',
        goals: '目标',
        numericalInfo: '数值信息',
      },
    },
    
    // Admin page
    admin: {
      title: '管理员仪表板',
      tabs: {
        overview: '概览',
        analytics: '分析',
        userManagement: '用户管理',
      },
      stats: {
        totalUsers: '总用户数',
        newUsers: '新用户',
        activeUsers: '活跃用户（24小时）',
        activityRate: '活跃率',
        totalData: '总数据量',
        storageCapacity: '存储容量',
        systemStatus: '系统状态',
        healthy: '正常',
        needsCheck: '需要检查',
        memory: '内存',
      },
      charts: {
        usageTrend: '使用趋势（最近30天）',
        totalActions: '总操作数',
        uniqueUsers: '独立用户',
        dataDistribution: '数据分布',
        contacts: '联系人',
        credentials: '账户信息',
        goals: '目标',
        schedules: '日程',
        numericalInfo: '数值信息',
        hourlyPattern: '每小时使用模式',
        topActiveUsers: '最活跃用户TOP 10',
        activities: '活动',
        featureUsage: '功能使用统计',
        usageCount: '使用次数',
        topStorageUsers: '存储使用最多的用户',
        files: '文件',
        activityByType: '按类型划分的活动（最近7天）',
      },
    },
    
    // Schedule page
    schedule: {
      title: '日程管理',
      addSchedule: '添加日程',
      editSchedule: '编辑日程',
      deleteConfirm: '您确定要删除此日程吗？',
      legend: '图例',
      daysWithSchedules: '有日程的日期',
      scheduleFor: '日程',
      noSchedules: '该日期没有日程。',
      at: '时',
    },
    
    // Dashboard
    dashboard: {
      title: '仪表板',
      greeting: {
        morning: '早上好',
        afternoon: '下午好',
        evening: '晚上好',
      },
      subtitle: '祝您今天工作顺利。AI助手随时为您服务。',
      quickActions: '快速操作',
      statusSummary: '状态摘要',
      keyInfo: '关键信息',
      accountInfo: '账户信息',
      recentSchedule: '最近日程',
      aiTips: 'AI助手提示',
      aiTipsDesc: '通过自然对话管理您的日程和信息：',
      stats: {
        contacts: '联系人',
        todaySchedule: '今日日程',
        activeGoals: '活跃目标',
        savedPhotos: '已保存照片',
        savedContacts: '已保存联系人',
        todayEvents: '今日事件',
        activeGoalsDesc: '活跃目标',
        albumPhotos: '相册照片',
      },
    },
    
    // Login/Register
    auth: {
      login: '登录',
      register: '注册',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      name: '姓名',
      loginTitle: 'Personal Assistant',
      loginSubtitle: '基于AI的个人助理服务',
      loginButton: '登录',
      registerButton: '创建账户',
      googleLogin: '使用Google登录',
      naverLogin: '使用Naver登录',
      noAccount: '还没有账户？',
      hasAccount: '已有账户？',
      loginFailed: '登录失败。',
      registerFailed: '注册失败。',
      passwordMismatch: '密码不匹配。',
      orContinueWith: '或使用以下方式继续',
    },
    
    // Payment
    payment: {
      title: '选择套餐',
      subtitle: '选择最适合您的方案',
      currentSubscription: '当前订阅状态',
      plan: '套餐',
      aiRequestsRemaining: 'AI请求剩余次数',
      unlimited: '无限制',
      selectPaymentMethod: '选择支付方式',
      paymentMethods: {
        card: '信用卡/借记卡',
        kakaoPay: 'Kakao Pay',
        naverPay: 'Naver Pay',
        toss: 'Toss',
        bankTransfer: '银行转账',
      },
      popular: '热门',
      month: '月',
      selectPlan: '选择',
      startFree: '免费开始',
      processing: '处理中...',
      backToDashboard: '返回仪表板',
      changeAnytime: '所有套餐都可以随时更改或取消。',
      freePlanAlert: '免费套餐不需要付款。',
      paymentError: '支付处理过程中出现错误。',
      paymentReady: '支付准备完成。\n需要支付网关集成。',
      plans: {
        free: {
          name: '免费套餐',
          features: [
            '每月10次AI对话',
            '基础日程管理',
            '5GB存储空间',
            '基础支持',
          ],
        },
        basic: {
          name: '基础套餐',
          features: [
            '每月100次AI对话',
            '高级日程管理',
            '50GB存储空间',
            '邮件支持',
            '日历集成',
          ],
        },
        premium: {
          name: '高级套餐',
          features: [
            '无限AI对话',
            '所有功能',
            '无限存储空间',
            '24/7支持',
            'API访问',
            '自定义AI模型',
          ],
        },
      },
    },
    
    // Common
    common: {
      loading: '加载中...',
      personalAssistant: 'Personal Assistant',
      days: '天',
      hour: '时',
    },
  },
};

export default translations;