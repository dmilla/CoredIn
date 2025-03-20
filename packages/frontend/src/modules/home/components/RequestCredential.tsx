import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  VStack,
  useDisclosure
} from "@chakra-ui/react";
import {
  CredentialDTO,
  CredentialRequestStatus,
  CredentialType
} from "@coredin/shared";
import { useState } from "react";
import { credentialLabels } from "../constants/credentialLabels";
import { handleMonthChange, handleYearChange } from "../helpers/dates";
import { months } from "../constants/months";
import {
  useCustomToast,
  useLoggedInServerState,
  useMutableServerState
} from "@/hooks";
import { ISSUER_QUERIES } from "@/queries/IssuerQueries";
import { ISSUER_MUTATIONS } from "@/queries/IssuerMutations";
import { defaultDate, defaultState } from "./credentials/constants";
import {
  getSelectedMonth,
  hasValidInput,
  isEndDateAfterStart
} from "./credentials/helpers";
import { years } from "../constants/years";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { formElementBorderStyles } from "@/themes";
import { IssuersListModal } from "./credentials";

export const RequestCredential = () => {
  const { data: issuers } = useLoggedInServerState(ISSUER_QUERIES.getIssuers());
  // console.log(CredentialRequestStatus);
  const { mutateAsync } = useMutableServerState(
    ISSUER_MUTATIONS.requestCredential()
  );
  const [state, setState] = useState<CredentialDTO>({ ...defaultState });
  const [hasEndDate, setHasEndDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { successToast, errorToast } = useCustomToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleEndDateCheckbox = () => {
    setHasEndDate((prevHasEndDate) => !prevHasEndDate);
    setState((prevState) => ({ ...prevState, endDate: undefined }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    mutateAsync({ request: state, issuerDid: state.issuer })
      .then((response) => {
        // console.log(response);
        if (response) {
          successToast("Credential submitted successfully");
          setState({ ...defaultState });
          setHasEndDate(false);
        }
        setIsSubmitting(false);
      })
      .catch((error) => {
        errorToast("Something went wrong");
        console.error(error);
        setIsSubmitting(false);
      });
  };
  // console.log("state", state);

  return (
    <VStack
      spacing="2.5em"
      layerStyle="cardBox"
      px="2em"
      pb="2.5em"
      align="start"
    >
      <Heading as="h1" fontFamily="body">
        Request new credential
      </Heading>

      <FormControl>
        <FormLabel>Select the type of a credential</FormLabel>
        <Select
          {...formElementBorderStyles}
          _placeholder={{ color: "other.600" }}
          value={state.type}
          onChange={(e) =>
            setState({
              ...state,
              type: (e.target.value as CredentialType) || ""
            })
          }
        >
          <option value="">Select a type</option>
          <option value="EducationCredential">Education</option>
          <option value="ProfessionalExperience">
            Professional experience
          </option>
          <option value="EventAttendance">Event attendance</option>
        </Select>
      </FormControl>

      {state.type && (
        <>
          <FormControl>
            <FormLabel>{credentialLabels[state.type].titleLabel}</FormLabel>
            <Input
              type="text"
              {...formElementBorderStyles}
              placeholder={credentialLabels[state.type].titlePlaceholder}
              value={state.title}
              onChange={(e) => setState({ ...state, title: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>
              {credentialLabels[state.type].establishmentLabel}
            </FormLabel>
            <Input
              type="text"
              {...formElementBorderStyles}
              placeholder={
                credentialLabels[state.type].establishmentPlaceholder
              }
              value={state.establishment}
              onChange={(e) =>
                setState({ ...state, establishment: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel>Start date</FormLabel>
            <Flex direction="row" gap="1em">
              <Select
                {...formElementBorderStyles}
                onChange={(e) =>
                  setState({
                    ...state,
                    startDate: handleMonthChange(
                      e.target.value,
                      state.startDate || "0"
                    )
                  })
                }
                value={state.startDate.slice(3, 5)}
              >
                <option value="00">Month</option>
                {months.map((month, index) => {
                  return (
                    <option
                      key={`start-date-month-${index}`}
                      value={getSelectedMonth(month)}
                    >
                      {month}
                    </option>
                  );
                })}
              </Select>

              <Select
                {...formElementBorderStyles}
                onChange={(e) =>
                  setState({
                    ...state,
                    startDate: handleYearChange(
                      e.target.value,
                      state.startDate || defaultDate
                    )
                  })
                }
                value={state.startDate.slice(6)}
              >
                <option value="0000">Year</option>
                {years.map((year, index) => {
                  return (
                    <option key={`start-date-year-${index}`} value={year}>
                      {year}
                    </option>
                  );
                })}
              </Select>
            </Flex>
          </FormControl>

          <Checkbox isChecked={!hasEndDate} onChange={handleEndDateCheckbox}>
            {credentialLabels[state.type].hasEndDateLabel}
          </Checkbox>
          {hasEndDate && (
            <FormControl>
              <FormLabel>End date</FormLabel>
              <Flex direction="row" gap="1em">
                <Select
                  {...formElementBorderStyles}
                  onChange={(e) =>
                    setState({
                      ...state,
                      endDate: handleMonthChange(
                        getSelectedMonth(e.target.value),
                        state.endDate || defaultDate
                      )
                    })
                  }
                >
                  <option value="0">Month</option>
                  {months.map((month, index) => {
                    return (
                      <option key={`end-date-month-${index}`} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </Select>

                <Select
                  {...formElementBorderStyles}
                  onChange={(e) =>
                    setState({
                      ...state,
                      endDate: handleYearChange(
                        e.target.value,
                        state.endDate || defaultDate
                      )
                    })
                  }
                >
                  <option value="0000">Year</option>
                  {years.map((year, index) => {
                    return (
                      <option key={`end-date-year-${index}`} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </Select>
              </Flex>
              {!isEndDateAfterStart(state.startDate, state.endDate) && (
                <Text mt="0.5em" color="brand.400" textStyle="sm">
                  Please enter a valid end date
                </Text>
              )}
            </FormControl>
          )}

          {/* LAST */}
          <FormControl>
            {/* todo: connect the label */}
            <FormLabel>Select an issuer</FormLabel>
            <Button
              id="issuer"
              w="100%"
              wordBreak="break-word"
              role="combobox"
              aria-controls="issuers-listbox"
              aria-haspopup="listbox"
              aria-label="Show the list of issuers."
              tabIndex={0}
              aria-expanded="false"
              bg="transparent"
              borderRadius="1.125rem"
              color="brand.900"
              textTransform="none"
              fontWeight="400"
              fontSize={{ base: "0.875rem", lg: "1rem" }}
              border="1px solid"
              borderColor="other.200"
              _hover={{
                bg: "inherit",
                color: "inherit",
                borderColor: "brand.200"
              }}
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              overflow="hidden"
              rightIcon={<ChevronDownIcon fontSize="1.25em" mr="-0.625em" />}
              onClick={onOpen}
            >
              <Text
                as="span"
                mr="auto"
                ml="-0.625em"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflow="hidden"
              >
                {state.issuer
                  ? `@${issuers?.find((issuer) => state.issuer === issuer.issuerDid)?.username}`
                  : "See all the issuers"}
              </Text>
            </Button>

            <IssuersListModal
              isOpen={isOpen}
              onClose={onClose}
              state={state}
              setState={setState}
              issuers={issuers}
            />
          </FormControl>

          <Button
            variant="primary"
            size="md"
            w="100%"
            onClick={handleSubmit}
            isDisabled={!hasValidInput(state, hasEndDate)}
            isLoading={isSubmitting}
          >
            Send a request
          </Button>
        </>
      )}
    </VStack>
  );
};
