import { Button, Heading, Link, Text, VStack } from "@chakra-ui/react";
import { useRouteError } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";

export default function ResourceNotFoundPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <VStack
      id="error-page"
      mx="auto"
      p="1em"
      gap="2em"
      maxW="600px"
      h="100dvh"
      justify="center"
    >
      <Heading>Oops!</Heading>
      <Text textAlign="center">We coudn't found the requested resource</Text>
      <Link as={ReactRouterLink} to="/">
        <Button variant="primary" size="sm">
          Return to home
        </Button>
      </Link>
    </VStack>
  );
}
