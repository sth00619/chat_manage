import { useState } from 'react';
import { Tab } from '@headlessui/react';
import Head from 'next/head';
import ContactsList from '@/components/Notes/ContactsList';
import GoalsList from '@/components/Notes/GoalsList';
import NumericalInfoList from '@/components/Notes/NumericalInfoList';
import CredentialsList from '@/components/Notes/CredentialsList';
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  CalculatorIcon,
  KeyIcon 
} from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Notes() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const categories = [
    {
      name: '연락처',
      icon: UserGroupIcon,
      component: ContactsList,
    },
    {
      name: 'ID & 비밀번호',
      icon: KeyIcon,
      component: CredentialsList,
    },
    {
      name: '목표',
      icon: ClipboardDocumentListIcon,
      component: GoalsList,
    },
    {
      name: '수치 정보',
      icon: CalculatorIcon,
      component: NumericalInfoList,
    },
  ];

  return (
    <>
      <Head>
        <title>노트 - Personal Assistant</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">노트</h1>
          
          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {categories.map((category) => (
                <Tab
                  key={category.name}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-900'
                    )
                  }
                >
                  <div className="flex items-center justify-center">
                    <category.icon className="h-5 w-5 mr-2" />
                    {category.name}
                  </div>
                </Tab>
              ))}
            </Tab.List>
            
            <Tab.Panels className="mt-6">
              {categories.map((category, idx) => (
                <Tab.Panel
                  key={idx}
                  className={classNames(
                    'rounded-xl bg-white p-3',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                  )}
                >
                  <category.component />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </>
  );
}