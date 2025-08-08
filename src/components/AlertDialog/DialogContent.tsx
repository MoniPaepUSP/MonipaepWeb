import { AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, Button } from "@chakra-ui/react";
import React from "react";

function DialogContent({
  cancelRef,
  onClose,
  onConfirm,
  isDeletting
}: {
  cancelRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onConfirm: () => void;
  isDeletting: boolean;
}) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader fontSize="lg" fontWeight="bold">
        Confirmação necessária
      </AlertDialogHeader>
      <AlertDialogBody>
        Tem certeza que deseja excluir este item?
      </AlertDialogBody>
      <AlertDialogFooter>
        <Button ref={cancelRef} onClick={onClose} variant="outline">
          Cancelar
        </Button>
        <Button
          colorScheme="red"
          onClick={onConfirm}
          ml={3}
          isLoading={isDeletting}
        >
          Excluir
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export default DialogContent;