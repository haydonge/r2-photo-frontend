import { ChakraProvider, Container, VStack } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PhotoList from './components/PhotoList'
import UploadPhoto from './components/UploadPhoto'
import Navigation from './components/Navigation'

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8}>
            <Navigation />
            <Routes>
              <Route path="/" element={<PhotoList />} />
              <Route path="/upload" element={<UploadPhoto />} />
            </Routes>
          </VStack>
        </Container>
      </Router>
    </ChakraProvider>
  )
}

export default App
