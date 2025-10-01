import { ReactNode } from "react";
import { Divider, Flex, Heading, Spinner } from "@chakra-ui/react";
import { TabNavLink } from "./NavLink/TabNavLink";

interface PatientDataWrapperProps {
  children: ReactNode;
  id: string;
  name?: string;
  isFetching: boolean;
  isLoading: boolean;
}

export function PatientDataWrapper({ children, id, name, isFetching, isLoading }: PatientDataWrapperProps) {
  return (
    <Flex direction="column" width="100%" bgColor="white">
      <Flex alignItems="center">
        <Heading ml={{ base: 4, md: 8 }} my={6} fontSize={{ base: "xl", md: "3xl" }}>
          Detalhes do paciente {name ? `(${name})` : ''}
          {!isLoading && isFetching && <Spinner ml="4" />}
        </Heading>
      </Flex>

      {/* Barra de navegação com scroll horizontal */}
      <Flex
        mx={{ base: 4, md: 8 }}
        mb={4}
        gap={{ base: 4, md: 6 }}
        overflowX="auto"
        py={2}
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        <TabNavLink href={`/dashboard/patients/details/${id}`} dynamicRoute>
          Dados cadastrais
        </TabNavLink>
        <TabNavLink href={`/dashboard/patients/diseasehistory/${id}`} dynamicRoute>
          Histórico de doenças
        </TabNavLink>
        <TabNavLink href={`/dashboard/patients/unassignedsymptoms/${id}`} dynamicRoute>
          Sintomas em aberto
        </TabNavLink>
      </Flex>

      <Divider />
      {children}
    </Flex>
  )
}
