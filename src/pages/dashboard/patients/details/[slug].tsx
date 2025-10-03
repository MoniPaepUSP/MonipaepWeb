import Head from "next/head";
import Router from "next/router";
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  Spinner,
  VStack,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { BiTrash } from "react-icons/bi";
import { usePatientDetails } from "../../../../hooks/usePatientDetails";
import { PatientDataWrapper } from "../../../../components/Layouts/PatientDataWrapper";
import { PatientExcludeAlert } from "../../../../components/AlertDialog/PatientExcludeAlert";
import { Can } from "../../../../components/Can";
import DashboardLayout from "../../../../components/Layouts/DashboardLayout";
import { withSSRAuth } from "../../../../utils/withSSRAuth";

interface PatientDetailsProps {
  patientId: string;
}

export default function PatientDetails({ patientId }: PatientDetailsProps) {
  const { data, isLoading, isFetching, error } = usePatientDetails({ patientId });
  const patient = data?.patients?.[0];

  const {
    isOpen: isOpenExcludeAlert,
    onOpen: onOpenExcludeAlert,
    onClose: onCloseExcludeAlert,
  } = useDisclosure();

  return (
    <PatientDataWrapper
      id={patientId}
      name={patient?.name}
      isFetching={isFetching}
      isLoading={isLoading}
    >
      <Head>
        <title>MoniPaEp | Detalhes do paciente</title>
      </Head>

      <Flex direction="column" w="100%" bgColor="white" borderRadius="4">
        {isLoading ? (
          <Box w="100%" h="100%" display="flex" justifyContent="center" alignItems="center">
            <Spinner size="lg" my="10" />
          </Box>
        ) : error ? (
          <Box w="100%" display="flex" justifyContent="center" alignItems="center" p={{ base: 4, md: 8 }}>
            <Text>Erro ao carregar os dados</Text>
          </Box>
        ) : (
          <>
            <PatientExcludeAlert
              isOpen={isOpenExcludeAlert}
              onClose={onCloseExcludeAlert}
              patientId={patientId}
            />

            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={6}
              px={{ base: 4, md: 8 }}
              py={{ base: 4, md: 6 }}
            >
              {/* Coluna de dados */}
              <VStack align="flex-start" spacing={2}>
                <Flex wrap="wrap">
                  <Text fontWeight="bold">Nome:&nbsp;</Text>
                  <Text>{patient?.name ?? "—"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Gênero:&nbsp;</Text>
                  <Text>{patient?.gender ?? "—"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">CPF:&nbsp;</Text>
                  <Text>{patient?.cpf ?? "—"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Email:&nbsp;</Text>
                  <Text>{patient?.email ?? "—"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Data de nascimento:&nbsp;</Text>
                  <Text>{patient?.birthdate ?? "—"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Telefone:&nbsp;</Text>
                  <Text>{patient?.phone ?? "—"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Endereço:&nbsp;</Text>
                  <Text>
                    {[
                      patient?.street || "",
                      patient?.houseNumber ? `, ${patient.houseNumber}` : "",
                    ].join("").trim() || "—"}
                  </Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Bairro:&nbsp;</Text>
                  <Text>{patient?.neighborhood ?? "—"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Plano de saúde:&nbsp;</Text>
                  <Text>{patient?.hasHealthPlan ? "Possui" : "Não possui"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Status do paciente:&nbsp;</Text>
                  <Text>{patient?.status ?? "—"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Status da conta:&nbsp;</Text>
                  <Text>{patient?.activeAccount ? "Ativa" : "Inativa"}</Text>
                </Flex>

                <Flex wrap="wrap">
                  <Text fontWeight="bold">Data de registro no aplicativo:&nbsp;</Text>
                  <Text>{patient?.createdAt ?? "—"}</Text>
                </Flex>
              </VStack>

              {/* Coluna de ações (no mobile aparece abaixo) */}
              <Flex
                direction="column"
                justify="flex-start"
                align={{ base: "stretch", md: "flex-end" }}
                gap={4}
              >
                <Box>
                  <Button
                    leftIcon={<Icon as={BiTrash} fontSize="20" />}
                    colorScheme="red"
                    w={{ base: "100%", md: "200px" }}
                    onClick={onOpenExcludeAlert}
                  >
                    <Can roles={["general.admin"]}>
                      Excluir paciente
                    </Can>
                    {/* Se usuário não for admin, o botão ficará visível mas o conteúdo de <Can> não, 
                        caso prefira ocultar completamente, troco a lógica para condicional. */}
                  </Button>
                </Box>

                <Box>
                  <Button
                    variant="outline"
                    w={{ base: "100%", md: "200px" }}
                    onClick={() => Router.back()}
                  >
                    Voltar
                  </Button>
                </Box>
              </Flex>
            </SimpleGrid>
          </>
        )}
      </Flex>
    </PatientDataWrapper>
  );
}

PatientDetails.layout = DashboardLayout;

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const params = ctx.params;
  return {
    props: {
      patientId: params?.slug,
    },
  };
});
