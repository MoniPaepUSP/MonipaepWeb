import { useState, ChangeEvent } from 'react';
import {
  Button,
  Flex,
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
} from '@chakra-ui/react';

import { api } from '../../services/apiClient';

interface DiseaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetchList: () => void;
}

export function DiseaseAddModal({ isOpen, onClose, refetchList }: DiseaseModalProps) {
  const [diseaseName, setDiseaseName] = useState('')
  const [touched, setTouched] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const toast = useToast()

  function handleNameInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setDiseaseName(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleClose() {
    setDiseaseName('')
    setTouched(false)
    onClose()
  }

  async function handleDiseaseCreation() {
    if (diseaseName !== '') {
      setIsPosting(true)
      try {
        const response = await api.post('/disease/gpt', {
          name: diseaseName,
        })
        toast({
          title: "Sucesso na geração da doença",
          description: response.data?.success,
          status: "success",
          isClosable: true
        })
        handleClose()
        refetchList()
      } catch (error: any) {
        toast({
          title: "Erro na criação da doença",
          description: "Doença já registrada no sistema",
          status: "error",
          isClosable: true
        })
      }
      setIsPosting(false)

    } else {
      toast({
        title: "Erro na criação da doença",
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
        <ModalContent height="auto" width="500px">
          <ModalHeader textAlign="center">Adicionar doença</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="semibold" mb="3">Nome da doença a ser gerada</Text>
            <Input value={diseaseName} mb="4" onChange={handleNameInputChanged} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose} mr="3">Cancelar</Button>
            <Button
              onClick={handleDiseaseCreation}
              colorScheme="blue"
              disabled={!touched}
              isLoading={isPosting}
            >
              Gerar com IA
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}