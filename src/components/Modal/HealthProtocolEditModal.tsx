import { useState, useEffect, ChangeEvent } from 'react';
import {
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalBody,
  ModalHeader,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';

import { api } from '../../services/apiClient';
import { HealthProtocol } from '../../hooks/useHealthProtocols';

interface HealthProtocolEditModalProps {
  isOpen: boolean;
  healthProtocol: HealthProtocol;
  onClose: () => void;
  refetchList: () => void;
}

export function HealthProtocolEditModal({ isOpen, onClose, healthProtocol, refetchList }: HealthProtocolEditModalProps) {
  const [instructions, setInstructions] = useState(healthProtocol.instructions)
  const [severity, setSeverity] = useState(healthProtocol.severity)
  const [touched, setTouched] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const toast = useToast()

  useEffect(() => {
    setInstructions(healthProtocol.instructions);
    setSeverity(healthProtocol.severity);
  }, [healthProtocol])

  function handleInstructionsInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setInstructions(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleDescriptionInputChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setSeverity(event.target.value)
    if (!touched) {
      setTouched(true)
    }
  }

  function handleClose() {
    setInstructions(healthProtocol.instructions)
    setSeverity(healthProtocol.severity)
    setTouched(false)
    onClose()
  }

  async function handleHealthProtocolUpdate() {
    if (instructions !== '' && severity !== '') {
      let body: any = {}
      if (instructions !== healthProtocol.instructions) {
        body = { ...body.instructions }
      }
      if (severity !== healthProtocol.severity) {
        body = { ...body, severity }
      }
      if (Object.keys(body).length === 0) {
        toast({
          title: "Erro na alteração do protocolo",
          description: "Não houve nenhuma alteração nos campos",
          status: "error",
          isClosable: true
        })
        return
      }
      try {
        setIsUpdating(true)
        const response = await api.put(`/healthprotocol/${healthProtocol.id}`, body)
        toast({
          title: "Sucesso na alteração do protocolo",
          description: response.data?.success,
          status: "success",
          isClosable: true
        })
        setTouched(false)
        onClose()
        refetchList()
      } catch (error: any) {
        toast({
          title: "Erro na alteração do protocolo",
          description: error.response?.data.error,
          status: "error",
          isClosable: true
        })
      }
      setIsUpdating(false)
    } else {
      toast({
        title: "Erro na alteração do protocolo",
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
          <ModalHeader textAlign="center">Editar protocolo de saúde</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="semibold" mb="2">Título</Text>
            <Input value={instructions} mb="2" onChange={handleInstructionsInputChanged} />
            <Text fontWeight="semibold" mt="2">Descrição</Text>
            <Textarea value={severity} mb="2" height="100px" onChange={handleDescriptionInputChanged} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose} mr="3">Cancelar</Button>
            <Button
              onClick={handleHealthProtocolUpdate}
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