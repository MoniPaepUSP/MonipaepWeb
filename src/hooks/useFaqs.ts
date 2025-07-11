import { useQuery } from "react-query";

import { api } from "../services/apiClient";

export type Faq = {
  id: string;
  question: string;
  answer: string;
}

export type FaqGroup = {
  id: string;
  name: string;
  faqs: Faq[];
}

export type GetFaqGroupsResponse = {
  groups: FaqGroup[],
  totalGroups: number,
}

interface UseFaqsProps {
  filter?: string;
}

export async function getFaqs(filter?: string) {
  let params = {}
  if(filter !== '') {
    params = { question: filter }
  }
  const { data } = await api.get<GetFaqGroupsResponse>('/faqgroup', { params })
  return data
}

export function useFaqs({ filter = '' }: UseFaqsProps) { 
  return useQuery(['faqs', filter], () => {
    return getFaqs(filter)
  }, {
    keepPreviousData: true,
    staleTime: 1000 * 10
  })
}