import { useState, useRef } from "react";
import { 
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useToast,
} from "@chakra-ui/react";

import { api } from "../../services/apiClient";

interface SpecialConditionExcludeAlertProps {
  isOpen: boolean;
  specialConditionId: string;
  onClose: () => void;
  refetchList: () => void;
}

export function SpecialConditionExcludeAlert({ isOpen, onClose, specialConditionId, refetchList }: SpecialConditionExcludeAlertProps) {
  const [isDeletting, setIsDeletting] = useState(false)
  const cancelRef = useRef(null)
  const toast = useToast()

  async function handleSpecialConditionExclusion() {
    setIsDeletting(true)
    try {
      const response = await api.delete(`/specialcondition/${specialConditionId}`)
      toast({
        title: "Sucesso na exclusão da condição especial",
        description: response.data?.success,
        status: "success",
        isClosable: true
      })
      refetchList()
      onClose()
      setIsDeletting(false)
    } catch (error: any) {
      toast({
        title: "Erro na remoção",
        description: error.response?.data.error,
        status: "error",
        isClosable: true
      })
    }
    setIsDeletting(false)
  }
  
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      motionPreset="slideInBottom"
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Confirmação necessária
          </AlertDialogHeader>
          <AlertDialogBody>
            Tem certeza que deseja excluir esta condição especial?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="outline">
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleSpecialConditionExclusion} ml={3} isLoading={isDeletting}>
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}