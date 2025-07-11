import { useState, useEffect, ChangeEvent } from 'react';
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
import { Symptom } from '../../hooks/useSymptoms';

interface SymptomModalProps {
  isOpen: boolean;
  symptom: Symptom;
  onClose: () => void;
  refetchList: () => void;
}

export function SymptomEditModal({ isOpen, onClose, symptom, refetchList }: SymptomModalProps) {
  const [name, setName] = useState(symptom.name || '')
  const [description, setDescription] = useState(symptom.description || '')
  const [touched, setTouched] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setName(symptom.name || '')
    setDescription(symptom.description || '')
  }, [symptom])

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
    setTouched(false)
    onClose()
  }

  async function handleUpdate() {
    if (name !== '' && description !== '') {
      if (name !== symptom.name || description !== symptom.description) {
        setIsUpdating(true)
        try {
          const response = await api.put(`/symptom/${symptom.id}`, { name, description })
          toast({
            title: "Sucesso na alteração do sintoma",
            description: response.data?.success,
            status: "success",
            isClosable: true
          })
          setTouched(false)
          onClose()
          refetchList()
        } catch (error: any) {
          toast({
            title: "Erro na alteração do sintoma",
            description: "Sintoma já registrado no sistema",
            status: "error",
            isClosable: true
          })
        }
        setIsUpdating(false)
      } else {
        toast({
          title: "Erro na alteração do sintoma",
          description: "Sintoma sem alteração",
          status: "error",
          isClosable: true
        })
      }
    } else {
      toast({
        title: "Erro na alteração do sintoma",
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
          <ModalHeader textAlign="center">Editar sintoma</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="semibold" mb="2">Nome do sintoma</Text>
            <Input value={name} mb="2" onChange={handleNameInputChanged} />
            <Text fontWeight="semibold" mb="2">Descrição</Text>
            <Textarea value={description} mb="2" onChange={handleDescriptionInputChanged} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose} mr="3">Cancelar</Button>
            <Button
              onClick={handleUpdate}
              colorScheme="blue"
              disabled={!touched}
              isLoading={isUpdating}
            >
              Atualizar
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}