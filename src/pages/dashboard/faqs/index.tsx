import { useState, useCallback, ChangeEvent, useMemo } from "react";
import Head from "next/head";
import { debounce } from "ts-debounce";
import DashboardLayout from "../../../components/Layouts/DashboardLayout";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Spinner,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useDisclosure,
} from "@chakra-ui/react";
import { BiPencil, BiTrash } from "react-icons/bi";
import { MdSearch } from "react-icons/md";
import { RiAddLine } from "react-icons/ri";

import { withSSRAuth } from "../../../utils/withSSRAuth";
import { useFaqs, Faq } from "../../../hooks/useFaqs";
import { FaqAddModal } from "../../../components/Modal/FaqAddModal";
import { FaqEditModal } from "../../../components/Modal/FaqEditModal";
import { FaqExcludeAlert } from "../../../components/AlertDialog/FaqExcludeAlert";
import { GroupAddModal } from "../../../components/Modal/GroupAddModal";

export default function Faqs() {
  const [search, setSearch] = useState("");
  const [questionToBeEdited, setQuestionToBeEdited] = useState<Faq | undefined>(undefined);
  const [questionGroupIdTobeAdded, setQuestionGroupIdTobeAdded] = useState<string | undefined>(undefined);
  const [questionToBeDeleted, setQuestionToBeDeleted] = useState<Faq | undefined>(undefined);

  const { data, isLoading, isFetching, error, refetch } = useFaqs({ filter: search });

  const { isOpen: isOpenEditModal, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const { isOpen: isOpenExcludeAlert, onOpen: onOpenExcludeAlert, onClose: onCloseExcludeAlert } = useDisclosure();
  const { isOpen: isOpenAddModal, onOpen: onOpenAddModal, onClose: onCloseAddModal } = useDisclosure();
  const { isOpen: isOpenGroupAddModal, onOpen: onOpenGroupAddModal, onClose: onCloseGroupAddModal } = useDisclosure();

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }, []);

  const debouncedChangeInputHandler = useMemo(() => debounce(handleChangeInput, 600), [handleChangeInput]);

  function handleEditQuestion(faq: Faq) {
    setQuestionToBeEdited(faq);
    onOpenEditModal();
  }

  function handleDeleteQuestion(faq: Faq) {
    setQuestionToBeDeleted(faq);
    onOpenExcludeAlert();
  }

  function handleAddQuestion(faqGroupId: string) {
    setQuestionGroupIdTobeAdded(faqGroupId);
    onOpenAddModal();
  }

  return (
    <>
      <Head>
        <title>MoniPaEp | FAQs</title>
      </Head>

      <Flex direction="column" w="100%" bgColor="white" borderRadius="4">
        <Heading ml={{ base: 4, md: 8 }} my={6} fontSize={{ base: "xl", md: "3xl" }}>
          FAQs
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
            <FaqAddModal isOpen={isOpenAddModal} onClose={onCloseAddModal} faqGroupId={questionGroupIdTobeAdded} refetchList={refetch} />
            <GroupAddModal isOpen={isOpenGroupAddModal} onClose={onCloseGroupAddModal} refetchList={refetch} />
            {questionToBeEdited && <FaqEditModal isOpen={isOpenEditModal} onClose={onCloseEditModal} faq={questionToBeEdited} refetchList={refetch} />}
            {questionToBeDeleted && <FaqExcludeAlert isOpen={isOpenExcludeAlert} onClose={onCloseExcludeAlert} faqId={questionToBeDeleted.id} refetchList={refetch} />}

            {/* Barra de busca + adicionar categoria */}
            <Flex
              mx={{ base: 4, md: 8 }}
              mb={{ base: 4, md: 8 }}
              direction={{ base: "column", md: "row" }}
              gap={{ base: 2, md: 0 }}
              justify="space-between"
              align={{ base: "stretch", md: "center" }}
            >
              <InputGroup w={{ base: "100%", md: "30%" }}>
                <InputLeftElement>
                  <Icon as={MdSearch} fontSize="xl" color="gray.400" />
                </InputLeftElement>
                <Input placeholder="Filtrar por pergunta..." onChange={debouncedChangeInputHandler} />
              </InputGroup>
              <Button mt={{ base: 2, md: 0 }} w={{ base: "100%", md: "auto" }} size="sm" fontSize="sm" colorScheme="blue" leftIcon={<Icon as={RiAddLine} fontSize="20" />} onClick={onOpenGroupAddModal}>
                Adicionar nova Categoria
              </Button>
            </Flex>

            <Box mx={{ base: 4, md: 8 }} overflowX="auto" mb={{ base: 4, md: 8 }}>
              {data?.totalGroups === 0 ? (
                <Text mt="2" mb="6">
                  {search === "" ? "Não existem questões registradas até o momento." : "A busca não encontrou nenhuma questão com esse filtro."}
                </Text>
              ) : (
                <Accordion allowMultiple bgColor="gray.100" boxShadow="md" border="1px" borderColor="gray.200">
                  {data?.groups.map((group) => (
                    <AccordionItem key={group.id} _hover={{ bgColor: "custom.blue-100" }}>
                      <h2>
                        <AccordionButton>
                          <Text flex="1" textAlign="left" fontWeight="semibold">
                            {group.name}
                          </Text>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel bgColor="gray.50" pb={3} pr="3" overflowX="auto">
                        <Table size="sm" w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                          <Thead bgColor="gray.200">
                            <Tr>
                              <Th>Pergunta</Th>
                              <Th>Resposta</Th>
                              <Th minW="80px"></Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {Array.isArray(group.faqs) &&
                              (group.faqs as Faq[]).map((faq) => (
                                <Tr key={faq.id} _hover={{ bgColor: "gray.50" }}>
                                  <Td minW="150px">{faq.question}</Td>
                                  <Td minW="200px">{faq.answer}</Td>
                                  <Td>
                                    <Flex direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} gap={2} justify="flex-end">
                                      <Button fontSize="lg" h="36px" w="36px" colorScheme="blue" onClick={() => handleEditQuestion(faq)}>
                                        <Icon as={BiPencil} />
                                      </Button>
                                      <Button fontSize="lg" h="36px" w="36px" colorScheme="red" onClick={() => handleDeleteQuestion(faq)}>
                                        <Icon as={BiTrash} />
                                      </Button>
                                    </Flex>
                                  </Td>
                                </Tr>
                              ))}
                          </Tbody>
                        </Table>
                        <Button size="sm" fontSize="sm" colorScheme="blue" leftIcon={<Icon as={RiAddLine} fontSize="20" />} onClick={() => handleAddQuestion(group.id)}>
                          Adicionar nova Pergunta
                        </Button>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </Box>
          </>
        )}
      </Flex>
    </>
  );
}

Faqs.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return { props: {} };
});
