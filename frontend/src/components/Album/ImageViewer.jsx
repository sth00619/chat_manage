import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${currentImage.url}`;
    link.download = currentImage.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${currentImage.url}`}
                    alt={currentImage.original_name}
                    className="max-h-[80vh] max-w-[90vw] object-contain"
                  />
                  
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
                    <p className="font-medium">{currentImage.original_name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>{(currentImage.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>
                        {format(new Date(currentImage.created_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex space-x-2 p-2 bg-black/50 rounded-lg">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative overflow-hidden rounded transition-all ${
                          idx === currentIndex
                            ? 'ring-2 ring-white w-16 h-16'
                            : 'w-12 h-12 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img.url}`}
                          alt={img.original_name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
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