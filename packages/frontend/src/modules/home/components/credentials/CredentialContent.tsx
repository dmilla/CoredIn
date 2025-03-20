import { HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { formatDate } from "../../helpers/formatDate";
import { FC } from "react";

type CredentialContentProps = {
  title: string;
  establishment: string;
  startDate: string;
  endDate?: string;
};

export const CredentialContent: FC<CredentialContentProps> = ({
  title,
  establishment,
  startDate,
  endDate
}) => {
  return (
    <VStack align="start" spacing="0.375em" w="100%">
      <HStack justify="space-between" w="100%">
        <Heading
          as="h3"
          fontFamily="body"
          fontSize={{ base: "1rem", lg: "1.25rem" }}
          lineHeight="1.5"
          wordBreak="break-all"
        >
          {title}
        </Heading>
      </HStack>

      <Text
        fontSize={{ base: "0.875rem", lg: "1rem" }}
        wordBreak="break-all"
        lineHeight="1.5"
      >
        {establishment}
      </Text>
      <Text fontSize={{ base: "0.875rem", lg: "1rem" }} wordBreak="break-all">
        {`${formatDate(startDate)} — ${endDate ? formatDate(endDate) : "Present"}`}
      </Text>
    </VStack>
  );
};
