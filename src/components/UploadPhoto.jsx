import { useState, useRef } from 'react'
import {
  Box,
  Button,
  VStack,
  useToast,
  Progress,
  Text,
  Input,
} from '@chakra-ui/react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'https://r2-photo-worker.haydonge.workers.dev'

const UploadPhoto = () => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const currentBucket = searchParams.get('bucket') || 'photo'

  const handleUpload = async (event) => {
    const files = event.target.files
    if (!files.length) return

    setUploading(true)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', currentBucket)

        await axios.post(`${API_URL}/api/upload`, formData, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setProgress(percentCompleted)
          },
        })

        setProgress(((i + 1) / files.length) * 100)
      }

      toast({
        title: '上传成功',
        status: 'success',
        duration: 2000,
      })

      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 上传完成后跳转到照片列表
      navigate('/')
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Box w="100%" maxW="500px" mx="auto">
      <VStack spacing={6}>
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          ref={fileInputRef}
          disabled={uploading}
        />

        {uploading && (
          <Box w="100%">
            <Text mb={2}>上传进度: {progress}%</Text>
            <Progress value={progress} size="sm" colorScheme="blue" />
          </Box>
        )}

        <Button
          w="100%"
          colorScheme="blue"
          onClick={() => fileInputRef.current?.click()}
          isLoading={uploading}
          loadingText="上传中..."
        >
          选择照片
        </Button>
      </VStack>
    </Box>
  )
}

export default UploadPhoto
