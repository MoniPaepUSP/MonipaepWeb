import { ReactNode } from "react";
import {
  Flex,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Box,
} from "@chakra-ui/react";
import { Sidebar } from "../Sidebar";
import { HiOutlineMenu } from "react-icons/hi";
import { useDisclosure } from "@chakra-ui/react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex w="100vw" h="100%" minHeight="100vh" maxWidth="100%" bgColor="gray.100">
      {/* Sidebar fixa no desktop */}
      <Box
        display={{ base: "none", md: "flex" }}
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        w="72"
      >
        <Sidebar />
      </Box>

      {/* Conteúdo principal */}
      <Flex
        direction="column"
        flex="1"
        ml={{ base: 0, md: "72" }}
        w={{ base: "100%", md: "calc(100% - 288px)" }}
      >
        {/* Topbar com botão hamburger (apenas mobile) */}
        <Box
          display={{ base: "flex", md: "none" }}
          p="2"
          bg="white"
          boxShadow="sm"
        >
          <IconButton
            aria-label="Abrir menu"
            icon={<HiOutlineMenu />}
            onClick={onOpen}
            variant="outline"
          />
        </Box>

        <Box p="4">{children}</Box>
      </Flex>

      {/* Drawer mobile */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="custom.blue-dark">
          <DrawerCloseButton color="white" />
          <DrawerBody p={0}>
            <Sidebar isMobile onNavigate={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default DashboardLayout;
