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
import DialogContent from "./DialogContent";

interface ComorbidityExcludeAlertProps {
  isOpen: boolean;
  comorbidityId: string;
  onClose: () => void;
  refetchList: () => void;
}

export function ComorbidityExcludeAlert({ isOpen, onClose, comorbidityId, refetchList }: ComorbidityExcludeAlertProps) {
  const [isDeletting, setIsDeletting] = useState(false)
  const cancelRef = useRef(null)
  const toast = useToast()

  async function handleComorbidityExclusion() {
    setIsDeletting(true)
    try {
      const response = await api.delete(`/comorbidity/${comorbidityId}`)
      toast({
        title: "Sucesso na exclusão da comorbidade",
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
        <DialogContent
          cancelRef={cancelRef}
          onClose={onClose}
          onConfirm={handleComorbidityExclusion}
          isDeletting={isDeletting}
        />
      </AlertDialogOverlay>
    </AlertDialog>
  )
}