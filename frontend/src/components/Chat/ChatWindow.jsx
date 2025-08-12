import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { chatService } from '@/services/api';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/components/Notification/NotificationProvider';

const ChatWindow = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const notification = useNotification();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: (response) => {
      const aiMessage = {
        type: 'bot',
        content: response.data.message,
        extractedData: response.data.extractedData,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setMessage('');
      
      // Show notification if data was extracted
      if (response.data.extractedData) {
        const items = [];
        const data = response.data.extractedData;
        if (data.schedules?.length) items.push(`${data.schedules.length}개의 일정`);
        if (data.contacts?.length) items.push(`${data.contacts.length}개의 연락처`);
        if (data.goals?.length) items.push(`${data.goals.length}개의 목표`);
        
        if (items.length > 0) {
          notification.success(`${items.join(', ')}이(가) 저장되었습니다`);
        }
      }
    },
    onError: (error) => {
      const errorMessage = {
        type: 'error',
        content: error.response?.data?.error || '메시지 전송 중 오류가 발생했습니다.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      notification.error('메시지 전송에 실패했습니다');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isLoading) {
      const userMessage = {
        type: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      sendMessageMutation.mutate(message);
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderExtractedData = (data) => {
    if (!data) return null;

    const items = [];
    if (data.contacts?.length > 0) items.push(`연락처 ${data.contacts.length}개`);
    if (data.credentials?.length > 0) items.push(`계정정보 ${data.credentials.length}개`);
    if (data.goals?.length > 0) items.push(`목표 ${data.goals.length}개`);
    if (data.schedules?.length > 0) items.push(`일정 ${data.schedules.length}개`);
    if (data.numerical_info?.length > 0) items.push(`수치정보 ${data.numerical_info.length}개`);

    if (items.length === 0) return null;

    return (
      <div className="mt-2 flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
        <CheckCircleIcon className="h-4 w-4 mr-1" />
        {items.join(', ')} 저장됨
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-medium mb-2">AI 비서와 대화를 시작하세요</p>
            <p className="text-sm">자연스럽게 일정, 연락처, 목표 등을 말씀해주세요.</p>
            <div className="mt-4 text-left max-w-md mx-auto">
              <p className="text-xs font-medium text-gray-600 mb-2">예시:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• "내일 오후 2시에 김철수 과장과 회의가 있어"</li>
                <li>• "엄마 전화번호는 010-1234-5678이야"</li>
                <li>• "네이버 아이디는 myid123이고 비밀번호는 pass456이야"</li>
                <li>• "이번 달 목표는 운동 주 3회 하기야"</li>
                <li>• "내 계좌 잔액은 1,500,000원이야"</li>
              </ul>
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : msg.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {renderExtractedData(msg.extractedData)}
              <p className={`text-xs mt-1 ${
                msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {sendMessageMutation.isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sendMessageMutation.isLoading}
          />
          <button
            type="submit"
            disabled={sendMessageMutation.isLoading || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;