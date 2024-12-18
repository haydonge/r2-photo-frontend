import { 
  Box, 
  Image, 
  SimpleGrid, 
  IconButton, 
  useToast, 
  Button, 
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  HStack,
  Text,
  Center,
  Spinner,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  ButtonGroup,
} from '@chakra-ui/react'
import { DeleteIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, CopyIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../config'
import PasswordModal from './PasswordModal'
import { checkAuth } from '../utils/auth'

const PhotoList = () => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [inputPage, setInputPage] = useState('1')
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [photoToDelete, setPhotoToDelete] = useState(null)
  const [sortBy, setSortBy] = useState('time_desc')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingDeletePhoto, setPendingDeletePhoto] = useState(null)
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const currentBucket = searchParams.get('bucket') || 'photo'

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true)
        // 检查是否有权限访问精选图库
        if (currentBucket === 'best' && !checkAuth('gallery')) {
          toast({
            title: '访问受限',
            description: '请重新输入密码访问精选图库',
            status: 'error',
            duration: 3000,
          })
          return
        }

        const [sortField, sortOrder] = sortBy.split('_')
        const response = await axios.get(
          `${API_URL}/api/photos?bucket=${currentBucket}&page=${page}&sortBy=${sortField}&order=${sortOrder}`
        )
        setPhotos(response.data.photos)
        setTotalPages(response.data.totalPages)
      } catch (error) {
        toast({
          title: '获取照片失败',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [currentBucket, page, sortBy])

  useEffect(() => {
    // 监听排序方式改变事件
    const handleSortChange = (e) => {
      setSortBy(e.detail)
    }
    window.addEventListener('sortChange', handleSortChange)
    return () => {
      window.removeEventListener('sortChange', handleSortChange)
    }
  }, [])

  const handleDeleteClick = (photo) => {
    if (!checkAuth('delete')) {
      setPendingDeletePhoto(photo)
      setShowPasswordModal(true)
    } else {
      handleDelete(photo)
    }
  }

  const handlePasswordSuccess = () => {
    if (pendingDeletePhoto) {
      handleDelete(pendingDeletePhoto)
      setPendingDeletePhoto(null)
    }
  }

  const handleDelete = async (photo) => {
    try {
      await axios.delete(`${API_URL}/api/delete/${currentBucket}/${photo.key}`)
      // 重新加载照片列表
      const [sortField, sortOrder] = sortBy.split('_')
      const response = await axios.get(
        `${API_URL}/api/photos?bucket=${currentBucket}&page=${page}&sortBy=${sortField}&order=${sortOrder}`
      )
      setPhotos(response.data.photos)
      setTotalPages(response.data.totalPages)
      
      toast({
        title: '删除成功',
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleCopyUrl = (key) => {
    const url = `https://${currentBucket}.knowivf.ac.cn/${key}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'URL已复制到剪贴板',
      status: 'success',
      duration: 2000,
    })
  }

  const openPreview = (photo) => {
    const index = photos.findIndex(p => p.key === photo.key)
    setSelectedPhotoIndex(index)
    setSelectedPhoto(photo)
    onPreviewOpen()
  }

  const handlePrevPhoto = (e) => {
    e.stopPropagation()
    if (selectedPhotoIndex > 0) {
      const prevIndex = selectedPhotoIndex - 1
      setSelectedPhotoIndex(prevIndex)
      setSelectedPhoto(photos[prevIndex])
    }
  }

  const handleNextPhoto = (e) => {
    e.stopPropagation()
    if (selectedPhotoIndex < photos.length - 1) {
      const nextIndex = selectedPhotoIndex + 1
      setSelectedPhotoIndex(nextIndex)
      setSelectedPhoto(photos[nextIndex])
    }
  }

  const handleKeyDown = (e) => {
    if (isPreviewOpen) {
      if (e.key === 'ArrowLeft') {
        handlePrevPhoto(e)
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto(e)
      } else if (e.key === 'Escape') {
        onPreviewClose()
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPhotoIndex, photos, isPreviewOpen])

  const handlePageInputChange = (value) => {
    setInputPage(value)
  }

  const handlePageSubmit = (e) => {
    e.preventDefault()
    const pageNum = parseInt(inputPage)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum)
    } else {
      setInputPage(page.toString())
      toast({
        title: '无效的页码',
        description: `请输入1-${totalPages}之间的数字`,
        status: 'warning',
        duration: 2000,
      })
    }
  }

  useEffect(() => {
    setInputPage(page.toString())
  }, [page])

  if (loading) {
    return (
      <Center h="500px">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box w="100%">
      <SimpleGrid columns={5} spacing={4}>
        {photos.map((photo) => (
          <Box
            key={photo.key}
            position="relative"
            borderRadius="lg"
            overflow="hidden"
            cursor="pointer"
            onClick={() => openPreview(photo)}
            role="group"
          >
            <Image
              src={`https://${currentBucket}.knowivf.ac.cn/${photo.key}`}
              alt={photo.key}
              w="100%"
              h="200px"
              objectFit="cover"
            />
            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              p={2}
              bg="blackAlpha.700"
              transform="translateY(100%)"
              transition="transform 0.2s"
              _groupHover={{ transform: 'translateY(0)' }}
            >
              <HStack spacing={2} justify="center">
                <IconButton
                  aria-label="Copy URL"
                  icon={<CopyIcon />}
                  size="sm"
                  colorScheme="blue"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyUrl(photo.key)
                  }}
                />
                <IconButton
                  aria-label="Delete photo"
                  icon={<CloseIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(photo)
                  }}
                />
              </HStack>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* Image Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={onPreviewClose} 
        size="full"
      >
        <ModalOverlay onClick={onPreviewClose} />
        <ModalContent 
          bg="transparent" 
          boxShadow="none" 
          maxW="100vw" 
          maxH="100vh"
          onClick={onPreviewClose}
        >
          <ModalBody 
            p={0} 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            minH="100vh"
            position="relative"
          >
            <Box
              position="absolute"
              left={4}
              top="50%"
              transform="translateY(-50%)"
              zIndex={2}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                aria-label="Previous photo"
                icon={<ChevronLeftIcon boxSize={8} />}
                onClick={handlePrevPhoto}
                isDisabled={selectedPhotoIndex === 0}
                colorScheme="whiteAlpha"
                size="lg"
                variant="ghost"
                _hover={{ bg: 'whiteAlpha.300' }}
              />
            </Box>
            <Box
              position="absolute"
              right={4}
              top="50%"
              transform="translateY(-50%)"
              zIndex={2}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                aria-label="Next photo"
                icon={<ChevronRightIcon boxSize={8} />}
                onClick={handleNextPhoto}
                isDisabled={selectedPhotoIndex === photos.length - 1}
                colorScheme="whiteAlpha"
                size="lg"
                variant="ghost"
                _hover={{ bg: 'whiteAlpha.300' }}
              />
            </Box>
            {selectedPhoto && (
              <Box
                p={4}
                onClick={(e) => e.stopPropagation()}
                bg="transparent"
                position="relative"
              >
                <Image
                  src={`https://${currentBucket}.knowivf.ac.cn/${selectedPhoto.key}`}
                  alt={selectedPhoto.key}
                  maxW="90vw"
                  maxH="90vh"
                  objectFit="contain"
                  bg="transparent"
                />
                <Text
                  position="absolute"
                  bottom={-8}
                  left="50%"
                  transform="translateX(-50%)"
                  color="white"
                  fontSize="sm"
                >
                  {selectedPhotoIndex + 1} / {photos.length}
                </Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Flex justify="center" align="center" mt={4} gap={4}>
        <Button
          onClick={() => setPage(1)}
          isDisabled={page === 1}
        >
          首页
        </Button>
        <Button
          onClick={() => setPage(page - 1)}
          isDisabled={page === 1}
        >
          上一页
        </Button>
        <HStack as="form" onSubmit={handlePageSubmit}>
          <NumberInput
            min={1}
            max={totalPages}
            value={inputPage}
            onChange={handlePageInputChange}
            maxW={20}
            clampValueOnBlur={false}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text>/ {totalPages} 页</Text>
          <Button type="submit" size="sm" colorScheme="blue">
            跳转
          </Button>
        </HStack>
        <Button
          onClick={() => setPage(page + 1)}
          isDisabled={page === totalPages}
        >
          下一页
        </Button>
        <Button
          onClick={() => setPage(totalPages)}
          isDisabled={page === totalPages}
        >
          末页
        </Button>
      </Flex>

      {/* 添加密码验证模态框 */}
      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => {
          setShowPasswordModal(false)
          setPendingDeletePhoto(null)
        }}
        onSuccess={() => {
          handlePasswordSuccess()
          setShowPasswordModal(false)
        }}
        type="delete"
        title="删除照片验证"
      />
    </Box>
  )
}

export default PhotoList
