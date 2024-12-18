import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { verifyPassword, setAuth } from '../utils/auth'

const PasswordModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  type,
  title = '请输入密码',
}) => {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = () => {
    setIsLoading(true)
    
    if (verifyPassword(type, password)) {
      onSuccess()
      setAuth(type)
      onClose()
      toast({
        title: '验证成功',
        status: 'success',
        duration: 2000,
      })
    } else {
      toast({
        title: '密码错误',
        status: 'error',
        duration: 2000,
      })
    }
    setIsLoading(false)
    setPassword('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入密码"
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={isLoading}>
            确认
          </Button>
          <Button onClick={onClose}>取消</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PasswordModal
