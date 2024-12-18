import { Box, Button, HStack, Select, useDisclosure } from '@chakra-ui/react'
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import PasswordModal from './PasswordModal'
import { API_URL } from '../config'
import { checkAuth } from '../utils/auth'

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentBucket = searchParams.get('bucket') || 'photo'
  const [sortBy, setSortBy] = useState('time_desc')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [pendingBucket, setPendingBucket] = useState(null)

  useEffect(() => {
    if (currentBucket === 'best' && !checkAuth('gallery')) {
      setSearchParams({ bucket: 'photo' })
    }
  }, [])

  const handleBucketChange = (e) => {
    const newBucket = e.target.value
    if (newBucket === 'best') {
      if (!checkAuth('gallery')) {
        setPendingBucket(newBucket)
        onOpen()
        return
      }
    }
    setSearchParams({ bucket: newBucket })
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    window.dispatchEvent(new CustomEvent('sortChange', { detail: e.target.value }))
  }

  const handlePasswordSuccess = () => {
    if (pendingBucket) {
      setSearchParams({ bucket: pendingBucket })
      setPendingBucket(null)
    }
  }

  return (
    <Box w="100%" py={4}>
      <HStack spacing={4} justify="space-between">
        <HStack spacing={4}>
          <Button
            as={Link}
            to="/"
            colorScheme={location.pathname === '/' ? 'blue' : 'gray'}
          >
            照片列表
          </Button>
          <Button
            as={Link}
            to="/upload"
            colorScheme={location.pathname === '/upload' ? 'blue' : 'gray'}
          >
            上传照片
          </Button>
        </HStack>
        <HStack spacing={4}>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            w="240px"
          >
            <option value="time_desc">按上传时间降序</option>
            <option value="time_asc">按上传时间升序</option>
            <option value="name_asc">按文件名升序</option>
            <option value="name_desc">按文件名降序</option>
          </Select>
          <Select
            value={currentBucket}
            onChange={handleBucketChange}
            w="200px"
          >
            <option value="photo">照片库</option>
            <option value="fuzhushengzhi">辅助生殖</option>
            <option value="best">精选</option>
          </Select>
        </HStack>
      </HStack>

      <PasswordModal 
        isOpen={isOpen} 
        onClose={() => {
          onClose()
          setPendingBucket(null)
          if (pendingBucket === 'best') {
            setSearchParams({ bucket: currentBucket })
          }
        }}
        onSuccess={handlePasswordSuccess}
        type="gallery"
        title="访问精选图库"
      />
    </Box>
  )
}

export default Navigation
