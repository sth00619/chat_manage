import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/api';
import Head from 'next/head';
import ImageViewer from '@/components/Album/ImageViewer';
import { PhotoIcon, CloudArrowUpIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';

export default function Album() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const { data: albums, isLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: () => dataService.getAlbums(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('image', file);
      return dataService.uploadImage(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['albums']);
      setUploadProgress(0);
    },
    onError: (error) => {
      alert('업로드 실패: ' + (error.response?.data?.error || '알 수 없는 오류'));
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataService.deleteAlbum(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['albums']);
    },
  });

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      // Simulate upload progress
      setUploadProgress(10);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      uploadMutation.mutate(file, {
        onSuccess: () => {
          clearInterval(interval);
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(0), 1000);
        },
        onError: () => {
          clearInterval(interval);
          setUploadProgress(0);
        },
      });
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('이 이미지를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Head>
        <title>앨범 - Personal Assistant</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">앨범</h1>
          
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`mb-8 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? '여기에 파일을 놓으세요'
                : '클릭하거나 파일을 드래그하여 업로드하세요'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF, WEBP (최대 10MB)
            </p>
            
            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{uploadProgress}% 업로드 중...</p>
              </div>
            )}
          </div>

          {/* Gallery */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
            </div>
          ) : albums?.data?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {albums.data.map((album) => (
                <div
                  key={album.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedImage(album)}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${album.url}`}
                    alt={album.original_name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(album.id, e)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  
                  {/* File info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{album.original_name}</p>
                    <p className="text-white text-xs">
                      {(album.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">앨범이 비어있습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                위의 업로드 영역을 사용하여 이미지를 추가하세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <ImageViewer
          image={selectedImage}
          images={albums?.data || []}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}