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
import { SpecialCondition } from '../../hooks/useSpecialConditions';

interface SpecialConditionModalProps {
  isOpen: boolean;
  specialCondition: SpecialCondition;
  onClose: () => void;
  refetchList: () => void;
}

export function SpecialConditionEditModal({ isOpen, onClose, specialCondition, refetchList }: SpecialConditionModalProps) {
  const [name, setName] = useState(specialCondition.name || '')
  const [description, setDescription] = useState(specialCondition.description || '')
  const [touched, setTouched] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setName(specialCondition.name || '')
    setDescription(specialCondition.description || '')
  }, [specialCondition])

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
      if (name !== specialCondition.name || description !== specialCondition.description) {
        setIsUpdating(true)
        try {
          const response = await api.put(`/specialcondition/${specialCondition.id}`, { name, description })
          toast({
            title: "Sucesso na alteração da condição especial",
            description: response.data?.success,
            status: "success",
            isClosable: true
          })
          setTouched(false)
          onClose()
          refetchList()
        } catch (error: any) {
          toast({
            title: "Erro na alteração da condição especial",
            description: "Condição especial já registrado no sistema",
            status: "error",
            isClosable: true
          })
        }
        setIsUpdating(false)
      } else {
        toast({
          title: "Erro na alteração da condição especial",
          description: "Condição especial sem alteração",
          status: "error",
          isClosable: true
        })
      }
    } else {
      toast({
        title: "Erro na alteração da condição especial",
        description: "Preencha o campo com o nome da condição especial",
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
          <ModalHeader textAlign="center">Editar condição especial</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="semibold" mb="2">Nome da condição especial</Text>
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