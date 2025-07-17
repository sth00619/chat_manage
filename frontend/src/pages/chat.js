import ChatWindow from '@/components/Chat/ChatWindow';
import Head from 'next/head';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function Chat() {
  return (
    <>
      <Head>
        <title>AI 비서 - Personal Assistant</title>
      </Head>
      
      <div className="h-full flex flex-col">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">AI 비서</h1>
              <div className="flex items-center text-sm text-gray-500">
                <InformationCircleIcon className="h-5 w-5 mr-1" />
                <span>대화 내용에서 자동으로 정보를 추출합니다</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full max-w-4xl mx-auto">
            <ChatWindow />
          </div>
        </div>
      </div>
    </>
  );
}