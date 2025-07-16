import { useState, useCallback, ChangeEvent, useMemo } from "react";
import Head from "next/head"
import { debounce } from "ts-debounce"
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
  useDisclosure,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { BiPencil, BiTrash } from 'react-icons/bi'
import { MdSearch } from 'react-icons/md'
import { RiAddLine } from 'react-icons/ri'

import { withSSRAuth } from "../../../utils/withSSRAuth";
import { Faq, FaqGroup, useFaqs } from "../../../hooks/useFaqs";
import { FaqEditModal } from "../../../components/Modal/FaqEditModal";
import { FaqExcludeAlert } from "../../../components/AlertDialog/FaqExcludeAlert";
import { FaqAddModal } from "../../../components/Modal/FaqAddModal";
import { GroupAddModal } from "../../../components/Modal/GroupAddModal";

export default function Faqs() {
  const [search, setSearch] = useState('')
  const [questionToBeEdited, setQuestionToBeEdited] = useState<Faq | undefined>(undefined)
  const [questionGroupIdTobeAdded, setQuestionGroupIdTobeAdded] = useState<string | undefined>(undefined)
  const [questionToBeDeleted, setQuestionToBeDeleted] = useState<Faq | undefined>(undefined)
  const { data, isLoading, isFetching, error, refetch } = useFaqs({ filter: search })
  const {
    isOpen: isOpenEditModal,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal
  } = useDisclosure()

  const {
    isOpen: isOpenExcludeAlert,
    onOpen: onOpenExcludeAlert,
    onClose: onCloseExcludeAlert
  } = useDisclosure()

  const {
    isOpen: isOpenAddModal,
    onOpen: onOpenAddModal,
    onClose: onCloseAddModal
  } = useDisclosure()

  const {
    isOpen: isOpenGroupAddModal,
    onOpen: onOpenGroupAddModal,
    onClose: onCloseGroupAddModal
  } = useDisclosure()

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }, [])

  const debouncedChangeInputHandler = useMemo(
    () => debounce(handleChangeInput, 600)
    , [handleChangeInput])

  function handleEditQuestion(faq: Faq) {
    setQuestionToBeEdited(faq)
    onOpenEditModal()
  }

  function handleDeleteQuestion(faq: Faq) {
    setQuestionToBeDeleted(faq)
    onOpenExcludeAlert()
  }

  function handleAddQuestion(faqGroupId: string) {
    setQuestionGroupIdTobeAdded(faqGroupId)
    onOpenAddModal()
  }

  return (
    <>
      <Head>
        <title>MoniPaEp | FAQs</title>
      </Head>

      <Flex h="100%" w="100%" bgColor="white" borderRadius="4" direction="column" >
        <Heading ml="8" my="6">
          FAQs
          {!isLoading && isFetching && <Spinner ml="4" />}
        </Heading>
        {isLoading ? (
          <Box w="100%" h="100%" display="flex" justifyContent="center" alignItems="center">
            <Spinner size="lg" />
          </Box>
        ) : error ? (
          <Box w="100%" display="flex" justifyContent="center" alignItems="center">
            <Text>Erro ao carregar os dados</Text>
          </Box>
        ) : (
          <>
            <FaqAddModal
              isOpen={isOpenAddModal}
              onClose={onCloseAddModal}
              faqGroupId={questionGroupIdTobeAdded}
              refetchList={refetch}
            />

            <GroupAddModal
              isOpen={isOpenGroupAddModal}
              onClose={onCloseGroupAddModal}
              refetchList={refetch}
            />

            {questionToBeEdited && (
              <FaqEditModal
                isOpen={isOpenEditModal}
                onClose={onCloseEditModal}
                faq={questionToBeEdited}
                refetchList={refetch}
              />
            )}

            {questionToBeDeleted && (
              <FaqExcludeAlert
                isOpen={isOpenExcludeAlert}
                onClose={onCloseExcludeAlert}
                faqId={questionToBeDeleted.id}
                refetchList={refetch}
              />
            )}

            <Flex mx="8" mb="8" justifyContent="space-between" alignItems="center">
              <InputGroup w="30">
                <InputLeftElement>
                  <Icon as={MdSearch} fontSize="xl" color="gray.400" />
                </InputLeftElement>
                <Input placeholder="Filtrar por pergunta..." onChange={debouncedChangeInputHandler} />
              </InputGroup>
              <Button
                size="sm"
                fontSize="sm"
                colorScheme="blue"
                leftIcon={<Icon as={RiAddLine} fontSize="20" />}
                onClick={onOpenGroupAddModal}
              >
                Adicionar nova Categoria
              </Button>
            </Flex>

            <Flex direction="column" w="100%" overflow="auto" px="8">
              {data?.totalGroups === 0 ? (
                <Text mt="2">
                  {search === '' ?
                    'Não existem questões registradas até o momento.' :
                    'A busca não encontrou nenhuma questão com esse filtro.'
                  }
                </Text>
              ) : (
                <>
                  <Accordion
                    allowMultiple
                    bgColor="gray.100"
                    boxShadow="md"
                    border="1px"
                    borderColor="gray.200"
                  >
                    {data?.groups.map(group => (
                      <AccordionItem key={group.id} _hover={{ bgColor: 'custom.blue-100' }}>
                        <h2>
                          <AccordionButton>
                            <Text flex="1" textAlign="left" fontWeight="semibold">
                              {group.name}
                            </Text>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel bgColor="gray.50" pb={3} pr="3">
                          <Table w="100%" border="1px" borderColor="gray.200" boxShadow="md" mb="4">
                            <Thead bgColor="gray.200">
                              <Tr>
                                <Th>Pergunta</Th>
                                <Th>Resposta</Th>
                                <Th></Th>
                              </Tr>
                            </Thead>

                            <Tbody>
                              {Array.isArray(group.faqs) && (group.faqs as Faq[]).map(faq => (
                                <Tr key={faq.id} _hover={{ bgColor: 'gray.50' }}>
                                  <Td w="45%">
                                    <Text>{faq.question}</Text>
                                  </Td>
                                  <Td w="45%">
                                    <Text>{faq.answer}</Text>
                                  </Td>

                                  <Td pr="4">
                                    <Flex justifyContent="flex-end" alignItems="center">
                                      <Button
                                        fontSize="lg"
                                        height="36px"
                                        width="36px"
                                        colorScheme="blue"
                                        onClick={() => handleEditQuestion(faq)}
                                      >
                                        <Icon as={BiPencil} />
                                      </Button>
                                      <Button
                                        fontSize="lg"
                                        height="36px"
                                        ml="2"
                                        width="36px"
                                        colorScheme="red"
                                        onClick={() => handleDeleteQuestion(faq)}
                                      >
                                        <Icon as={BiTrash} />
                                      </Button>
                                    </Flex>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                          <Button
                            size="sm"
                            fontSize="sm"
                            colorScheme="blue"
                            leftIcon={<Icon as={RiAddLine} fontSize="20" />}
                            onClick={() => handleAddQuestion(group.id)}
                          >
                            Adicionar nova Pergunta
                          </Button>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <Text
                    borderRadius="4"
                    px="1"
                    mt="4"
                  >
                    <strong>1</strong> - <strong> {data?.totalGroups}</strong> de <strong>{data?.totalGroups}</strong>
                  </Text>
                </>
              )}
            </Flex>
          </>
        )}
      </Flex>
    </>
  )
}

Faqs.layout = DashboardLayout

export const getServerSideProps = withSSRAuth(async (ctx) => {
  return { props: {} }
})