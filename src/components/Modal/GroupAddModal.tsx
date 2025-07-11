import { useState, ChangeEvent } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Text,
  Textarea,
  Input,
  useToast,
} from '@chakra-ui/react';

import { api } from '../../services/apiClient';

interface GroupAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetchList: () => void;
}

export function GroupAddModal({ isOpen, onClose, refetchList }: GroupAddModalProps) {
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const toast = useToast()

  function handleNameInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleClose() {
    setName('')
    setTouched(false)
    onClose()
  }

  async function handleGroupCreation() {
    if (name !== '') {
      setIsPosting(true)
      try {
        const response = await api.post('/faqgroup/', { name })
        toast({
          title: "Sucesso na criação da categoria",
          description: response.data?.success,
          status: "success",
          isClosable: true
        })
        handleClose()
        refetchList()
      } catch (error: any) {
        toast({
          title: "Erro na criação da categoria",
          description: error.response?.data.error,
          status: "error",
          isClosable: true
        })
      }
      setIsPosting(false)
    } else {
      toast({
        title: "Erro na criação da categoria",
        description: "Preencha os campos corretamente",
        status: "error",
        isClosable: true
      })
    }
  }

  return (
    <Modal
      motionPreset="slideInBottom"
      size="xl"
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay>
        <ModalContent height="auto" width="550px">
          <ModalHeader textAlign="center">Adicionar Categoria</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="semibold" mb="2">Nome</Text>
            <Input value={name} mb="2" onChange={handleNameInputChanged} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose} mr="3">Cancelar</Button>
            <Button
              onClick={handleGroupCreation}
              colorScheme="blue"
              disabled={!touched}
              isLoading={isPosting}
            >
              Registrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}