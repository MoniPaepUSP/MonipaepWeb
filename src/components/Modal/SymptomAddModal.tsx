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
  Input,
  useToast,
  Textarea,
} from '@chakra-ui/react';

import { api } from '../../services/apiClient';

interface SymptomAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetchList: () => void;
}

export function SymptomAddModal({ isOpen, onClose, refetchList }: SymptomAddModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [touched, setTouched] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const toast = useToast()

  function handleNameInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleDescriptionInputChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleClose() {
    setName('')
    setDescription('')
    setTouched(false)
    onClose()
  }

  async function handleSymptomCreation() {
    if (name !== '' && description !== '') {
      setIsPosting(true)
      try {
        const response = await api.post('/symptom/', { name, description })
        toast({
          title: "Sucesso na criação do sintoma",
          description: response.data?.success,
          status: "success",
          isClosable: true
        })
        handleClose()
        refetchList()
      } catch (error: any) {
        toast({
          title: "Erro na criação do sintoma",
          description: "Sintoma já registrado no sistema",
          status: "error",
          isClosable: true
        })
      }
      setIsPosting(false)
    } else {
      toast({
        title: "Erro na criação do sintoma",
        description: "Preencha o campo com o nome do sintoma",
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
        <ModalContent height="auto" width="500px">
          <ModalHeader textAlign="center">Adicionar sintoma</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="semibold" mb="2">Nome do sintoma</Text>
            <Input value={name} mb="2" onChange={handleNameInputChanged} />
            <Text fontWeight="semibold" mb="2">Descrição do sintoma</Text>
            <Textarea value={description} mb="2" onChange={handleDescriptionInputChanged} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose} mr="3">Cancelar</Button>
            <Button
              onClick={handleSymptomCreation}
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