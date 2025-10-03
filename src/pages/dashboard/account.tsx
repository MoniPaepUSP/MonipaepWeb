import { useContext } from "react";
import Head from "next/head";
import Router from "next/router";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  Spinner,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { BiPencil } from 'react-icons/bi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { IoChevronBack } from "react-icons/io5";

import { withSSRAuth } from "../../utils/withSSRAuth";
import { useUserDetails } from "../../hooks/useUserDetails";
import { AuthContext } from "../../contexts/AuthContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { UserDetailsEditModal } from "../../components/Modal/UserDetailsEditModal";
import { UserPasswordEditModal } from "../../components/Modal/UserPasswordEditModal";

export default function Account() {
  const { user } = useContext(AuthContext);
  const { data, isLoading, isFetching, error, refetch } = useUserDetails({ userId: user?.user.id });

  const {
    isOpen: isOpenEditDetailsModal,
    onOpen: onOpenEditDetailsModal,
    onClose: onCloseEditDetailsModal
  } = useDisclosure();

  const {
    isOpen: isOpenEditPasswordModal,
    onOpen: onOpenEditPasswordModal,
    onClose: onCloseEditPasswordModal
  } = useDisclosure();

  return (
    <>
      <Head>
        <title>MoniPaEp | Detalhes do usuário</title>
      </Head>

      <Flex
        direction="column"
        w="100%"
        bgColor="white"
        borderRadius="4"
        p={{ base: 4, md: 8 }}
      >
        <Heading fontSize={{ base: "xl", md: "3xl" }} mb={6}>
          Detalhes do usuário
          {!isLoading && isFetching && <Spinner ml="4" />}
        </Heading>

        {isLoading ? (
          <Flex w="100%" h="100%" justify="center" align="center">
            <Spinner size="lg" my="10" />
          </Flex>
        ) : error ? (
          <Flex w="100%" justify="center" align="center">
            <Text>Erro ao carregar os dados</Text>
          </Flex>
        ) : (
          <>
            {data && (
              <UserDetailsEditModal
                isOpen={isOpenEditDetailsModal}
                onClose={onCloseEditDetailsModal}
                user={data}
                refetch={refetch}
              />
            )}

            {data && (
              <UserPasswordEditModal
                isOpen={isOpenEditPasswordModal}
                onClose={onCloseEditPasswordModal}
                userId={data?.id}
              />
            )}

            <Flex direction={{ base: "column", md: "row" }} align={{ base: "flex-start", md: "flex-start" }} >
              <Icon
                as={IoChevronBack}
                fontSize={{ base: "20px", md: "22px" }}
                mt={{ base: 2, md: 1 }}
                mr={{ base: 0, md: 6 }}
                mb={{ base: 4, md: 0 }}
                _hover={{ cursor: 'pointer' }}
                onClick={() => Router.back()}
              />

              <VStack align="flex-start" spacing={3} w="100%">
                <Flex wrap="wrap">
                  <Text fontWeight="bold">Nome:&nbsp;</Text>
                  <Text>{data?.name}</Text>
                </Flex>
                <Flex wrap="wrap">
                  <Text fontWeight="bold">CPF:&nbsp;</Text>
                  <Text>{data?.CPF}</Text>
                </Flex>
                <Flex wrap="wrap">
                  <Text fontWeight="bold">Email:&nbsp;</Text>
                  <Text>{data?.email}</Text>
                </Flex>
                <Flex wrap="wrap">
                  <Text fontWeight="bold">Departamento:&nbsp;</Text>
                  <Text>{data?.department}</Text>
                </Flex>
                <Flex wrap="wrap">
                  <Text fontWeight="bold">Criado em:&nbsp;</Text>
                  <Text>{data?.createdAt}</Text>
                </Flex>

                <HStack
                  spacing={2}
                  w="100%"
                  pt={2}
                  direction={{ base: "column", md: "row" }}
                  align={{ base: "stretch", md: "center" }}
                >
                  <Button
                    colorScheme="blue"
                    flex={{ base: "1", md: undefined }}
                    w={{ base: "100%", md: "auto" }}
                    leftIcon={<Icon as={BiPencil} fontSize="20" />}
                    onClick={onOpenEditDetailsModal}
                  >
                    Editar dados
                  </Button>

                  <Button
                    colorScheme="purple"
                    flex={{ base: "1", md: undefined }}
                    w={{ base: "100%", md: "auto" }}
                    leftIcon={<Icon as={RiLockPasswordLine} fontSize="20" />}
                    onClick={onOpenEditPasswordModal}
                  >
                    Alterar senha
                  </Button>
                </HStack>
              </VStack>
            </Flex>
          </>
        )}
      </Flex>
    </>
  )
}

Account.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }));
