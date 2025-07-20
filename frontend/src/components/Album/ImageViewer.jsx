import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { format, isValid, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const ImageViewer = ({ image, images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(image);

  useEffect(() => {
    const index = images.findIndex(img => img.id === image.id);
    setCurrentIndex(index);
  }, [image, images]);

  useEffect(() => {
    setCurrentImage(images[currentIndex]);
  }, [currentIndex, images]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDownload = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const imageUrl = currentImage.url.startsWith('/uploads/') 
        ? currentImage.url 
        : `/uploads/${currentImage.url}`;
      
      const fullUrl = `${baseUrl}${imageUrl}`;
      console.log('Downloading from:', fullUrl);
      
      // fetch를 사용해 이미지 다운로드
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = currentImage.original_name || `image_${currentImage.id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 메모리 정리
      window.URL.revokeObjectURL(url);
      
      console.log('Download completed');
    } catch (error) {
      console.error('Download failed:', error);
      alert('다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 안전한 날짜 포맷팅 함수
  const formatCreatedAt = (dateString) => {
    if (!dateString) {
      return '날짜 정보 없음';
    }

    try {
      // 다양한 날짜 형식 처리
      let date;
      
      // ISO 문자열인 경우 (2025-07-18T14:13:41.830Z)
      if (typeof dateString === 'string' && (dateString.includes('T') || dateString.includes('Z'))) {
        date = parseISO(dateString);
      } 
      // MySQL datetime 형식인 경우 (2025-07-18 14:13:41)
      else if (typeof dateString === 'string' && dateString.includes(' ')) {
        // MySQL datetime을 로컬 시간으로 처리 (UTC 변환하지 않음)
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split(':');
        
        // 로컬 시간으로 Date 객체 생성 (UTC 변환 방지)
        date = new Date(year, month - 1, day, hour, minute, second);
      } 
      // 일반적인 날짜 문자열인 경우
      else {
        date = new Date(dateString);
      }

      // 유효한 날짜인지 확인
      if (!isValid(date)) {
        console.warn('Invalid date:', dateString);
        return '날짜 형식 오류';
      }

      // 한국 시간으로 포맷팅 (시간대 변환 없이)
      return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch (error) {
      console.error('Date formatting error:', error, 'Original date:', dateString);
      return '날짜 파싱 오류';
    }
  };

  // currentImage가 없는 경우 처리
  if (!currentImage) {
    return null;
  }

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-90 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleDownload}
                      className="text-white hover:text-gray-300 transition-colors"
                      title="다운로드"
                    >
                      <ArrowDownTrayIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="text-white text-sm">
                    {currentIndex + 1} / {images.length}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Main Image */}
                <div className="relative flex items-center justify-center">
                  {(() => {
                    // URL 생성 로직: 이미 /uploads/가 포함된 경우 중복 추가하지 않음
                    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                    
                    // currentImage.url이 이미 /uploads/로 시작하는지 확인
                    const imageUrl = currentImage.url.startsWith('/uploads/') 
                      ? currentImage.url 
                      : `/uploads/${currentImage.url}`;
                    
                    const fullUrl = `${baseUrl}${imageUrl}`;
                    
                    console.log('Image URL Debug:', {
                      baseUrl,
                      originalUrl: currentImage.url,
                      processedUrl: imageUrl,
                      fullUrl,
                      envVars: {
                        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
                        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
                      }
                    });
                    
                    return (
                      <img
                        src={fullUrl}
                        alt={currentImage.original_name || 'Image'}
                        className="max-h-[80vh] max-w-[90vw] object-contain"
                        onLoad={() => console.log('Image loaded successfully:', fullUrl)}
                        onError={(e) => {
                          console.error('Image load error details:', {
                            originalSrc: fullUrl,
                            currentImage: currentImage,
                            error: e
                          });
                          // 간단한 SVG 플레이스홀더로 대체
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3E이미지를 불러올 수 없습니다%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    );
                  })()}
                  
                  {/* Navigation buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRightIcon className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <div className="text-white">
                    <p className="font-medium">{currentImage.original_name || '이름 없음'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>
                        {currentImage.size 
                          ? `${(currentImage.size / 1024 / 1024).toFixed(2)} MB`
                          : '크기 정보 없음'
                        }
                      </span>
                      <span>
                        {(() => {
                          // 디버깅을 위한 로그
                          console.log('Date debug:', {
                            createdAt: currentImage.createdAt,
                            created_at: currentImage.created_at,
                            updatedAt: currentImage.updatedAt,
                            updated_at: currentImage.updated_at,
                            fullObject: currentImage
                          });
                          
                          // Sequelize underscored 설정으로 인해 필드명이 달라질 수 있음
                          // 여러 가능한 필드명 확인
                          const dateToFormat = currentImage.createdAt || 
                                             currentImage.created_at || 
                                             currentImage.updatedAt || 
                                             currentImage.updated_at ||
                                             currentImage.createddate ||
                                             currentImage.created_date;
                          
                          return formatCreatedAt(dateToFormat);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
                    {images.map((img, idx) => {
                      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                      const imageUrl = img.url.startsWith('/uploads/') 
                        ? img.url 
                        : `/uploads/${img.url}`;
                      
                      return (
                        <button
                          key={img.id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`relative overflow-hidden rounded transition-all flex-shrink-0 ${
                            idx === currentIndex
                              ? 'ring-2 ring-white w-16 h-16'
                              : 'w-12 h-12 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={`${baseUrl}${imageUrl}`}
                            alt={img.original_name || 'Thumbnail'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 썸네일용 작은 SVG 플레이스홀더
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f3f4f6'/%3E%3Ctext x='24' y='28' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='10'%3E✕%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ImageViewer;